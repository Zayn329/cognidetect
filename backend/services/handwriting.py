"""
PRODUCTION-GRADE DYSGRAPHIA SCREENING SYSTEM
Single-file implementation for easy frontend integration

Usage:
    from dysgraphia_analyzer_single_file import analyze_handwriting_image, AnalysisResult
    
    result = analyze_handwriting_image("path/to/image.jpg")
    print(f"Stability: {result.stability_score}/100")
    print(f"Risk Level: {result.risk_level}")
    print(f"Confidence: {result.confidence}%")
"""

import cv2
import numpy as np
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Tuple, List, Dict, Optional
from pathlib import Path


# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# ENUMS & DATA STRUCTURES
# ============================================================================

class RiskLevel(Enum):
    """Dysgraphia risk classification"""
    LOW = "Low Risk - No concerning indicators"
    MILD = "Mild - Some indicators warrant monitoring"
    MODERATE = "Moderate - Significant dysgraphic patterns"
    HIGH = "High - Strong indicators of dysgraphia"
    CRITICAL = "Critical - Severe dysgraphic patterns"


@dataclass
class AnalysisResult:
    """
    Complete analysis results - designed for easy frontend integration
    
    Attributes:
        stability_score (float): 0-100, higher = better handwriting control
        linearity_score (float): 0-100, baseline consistency
        spacing_consistency (float): 0-100, inter-character spacing
        size_consistency (float): 0-100, letter size uniformity
        slant_consistency (float): 0-100, writing angle consistency
        pressure_estimate (float): 0-100, pen pressure uniformity
        dysgraphia_risk (float): 0-100, composite risk score
        risk_level (RiskLevel): Categorical risk assessment
        confidence (float): 0-100, analysis reliability
        num_strokes (int): Number of letter/stroke marks detected
        recommendation (str): Clinical recommendation text
        details (dict): Raw metric values for debugging
        error (Optional[str]): Error message if analysis failed
    """
    stability_score: float
    linearity_score: float
    spacing_consistency: float
    size_consistency: float
    slant_consistency: float
    pressure_estimate: float
    dysgraphia_risk: float
    risk_level: RiskLevel
    confidence: float
    num_strokes: int
    recommendation: str
    details: Dict[str, float]
    error: Optional[str] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'stability_score': round(self.stability_score, 2),
            'linearity_score': round(self.linearity_score, 2),
            'spacing_consistency': round(self.spacing_consistency, 2),
            'size_consistency': round(self.size_consistency, 2),
            'slant_consistency': round(self.slant_consistency, 2),
            'pressure_estimate': round(self.pressure_estimate, 2),
            'dysgraphia_risk': round(self.dysgraphia_risk, 2),
            'risk_level': self.risk_level.name,
            'risk_description': self.risk_level.value,
            'confidence': round(self.confidence, 2),
            'num_strokes': self.num_strokes,
            'recommendation': self.recommendation,
            'error': self.error
        }
    
    def __str__(self) -> str:
        """Human-readable summary"""
        if self.error:
            return f"Analysis Failed: {self.error}"
        
        return (
            f"Stability: {self.stability_score:.1f}/100 | "
            f"Risk: {self.risk_level.name} ({self.dysgraphia_risk:.1f}%) | "
            f"Confidence: {self.confidence:.1f}%"
        )


# ============================================================================
# CONFIGURATION
# ============================================================================

class AnalysisConfig:
    """Tunable configuration parameters"""
    
    # Image preprocessing
    MIN_STROKE_SIZE = 8  # Minimum letter dimensions (pixels)
    
    # Linearity (baseline) thresholds
    BASELINE_GOOD_STD = 5.0
    BASELINE_POOR_STD = 20.0
    
    # Spacing thresholds
    SPACING_GOOD_STD = 10.0
    SPACING_POOR_STD = 25.0
    
    # Size consistency thresholds (coefficient of variation %)
    SIZE_GOOD_CV = 30.0
    SIZE_POOR_CV = 50.0
    
    # Slant thresholds
    SLANT_GOOD_STD = 0.15
    SLANT_POOR_STD = 0.40
    
    # Pressure thresholds
    PRESSURE_GOOD_STD = 0.05
    PRESSURE_POOR_STD = 0.15
    
    # Metric weights for composite score
    WEIGHT_LINEARITY = 0.30
    WEIGHT_SPACING = 0.25
    WEIGHT_SIZE = 0.20
    WEIGHT_SLANT = 0.15
    WEIGHT_PRESSURE = 0.10
    
    # Confidence calculation
    MIN_SAMPLES_FOR_HIGH_CONFIDENCE = 5
    MAX_SAMPLES_BEFORE_FRAGMENTATION = 50


# ============================================================================
# RISK CLASSIFIER
# ============================================================================

class RiskClassifier:
    """Determines risk level and clinical recommendations"""
    
    @staticmethod
    def classify(dysgraphia_risk: float, confidence: float, 
                num_samples: int) -> Tuple[RiskLevel, str]:
        """
        Classify risk and generate recommendation
        
        Args:
            dysgraphia_risk: 0-100 risk score
            confidence: 0-100 analysis confidence
            num_samples: Number of strokes detected
            
        Returns:
            Tuple of (RiskLevel, recommendation_text)
        """
        
        # Adjust risk based on confidence
        if confidence < 40:
            # Low confidence - be conservative
            if dysgraphia_risk > 60:
                risk_level = RiskLevel.MODERATE
            else:
                risk_level = RiskLevel.MILD
        else:
            # High confidence classification
            if dysgraphia_risk < 20:
                risk_level = RiskLevel.LOW
            elif dysgraphia_risk < 40:
                risk_level = RiskLevel.MILD
            elif dysgraphia_risk < 60:
                risk_level = RiskLevel.MODERATE
            elif dysgraphia_risk < 80:
                risk_level = RiskLevel.HIGH
            else:
                risk_level = RiskLevel.CRITICAL
        
        recommendation = RiskClassifier._get_recommendation(risk_level, confidence, num_samples)
        return risk_level, recommendation
    
    @staticmethod
    def _get_recommendation(risk_level: RiskLevel, confidence: float, 
                           num_samples: int) -> str:
        """Generate clinical recommendation"""
        
        base_recommendations = {
            RiskLevel.LOW: (
                "Handwriting shows normal motor control and consistency. "
                "No dysgraphia indicators detected. Continue with regular instruction."
            ),
            RiskLevel.MILD: (
                "Some minor handwriting variations detected. Recommend: "
                "Continue monitoring. Consider periodic reassessment. "
                "If other indicators present (slow writing, fatigue), consult occupational therapist."
            ),
            RiskLevel.MODERATE: (
                "Moderate dysgraphic patterns detected. Recommend: "
                "Occupational therapy evaluation. Interventions to consider: "
                "pencil grip training, handwriting practice, motor skill exercises."
            ),
            RiskLevel.HIGH: (
                "Significant dysgraphic patterns present. Recommend: "
                "Comprehensive occupational therapy assessment. Consider: "
                "typing instruction, alternative writing tools, assistive technology evaluation."
            ),
            RiskLevel.CRITICAL: (
                "Severe handwriting dysfunction detected. Recommend: "
                "Urgent occupational therapy referral. Implement accommodations: "
                "keyboard use, speech-to-text, reduced handwriting requirements."
            )
        }
        
        recommendation = base_recommendations.get(risk_level, "Unable to classify")
        
        # Add confidence caveat if low
        if confidence < 50:
            recommendation += (
                f" [Note: Low confidence ({confidence:.0f}%) - recommend retesting "
                "with clearer handwriting sample]"
            )
        
        # Add sample size note if insufficient
        if num_samples < 3:
            recommendation += " [Insufficient handwriting sample for reliable assessment]"
        
        return recommendation


# ============================================================================
# MAIN ANALYZER CLASS
# ============================================================================

class DysgraphiaAnalyzer:
    """
    Production-grade handwriting analyzer for dysgraphia screening
    
    Analyzes:
    - Baseline stability (vertical consistency)
    - Character spacing regularity
    - Letter size consistency
    - Writing slant/angle
    - Pressure variation estimates
    """
    
    def __init__(self, config: AnalysisConfig = None):
        """
        Initialize analyzer with optional custom configuration
        
        Args:
            config: Optional AnalysisConfig instance for custom thresholds
        """
        self.config = config or AnalysisConfig()
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def analyze_file(self, image_path: str) -> AnalysisResult:
        """
        Analyze handwriting from an image file
        
        Args:
            image_path: Path to image file (jpg, png, etc.)
            
        Returns:
            AnalysisResult with all metrics
        """
        try:
            if not Path(image_path).exists():
                return self._error_result(f"File not found: {image_path}")
            
            image = cv2.imread(image_path)
            return self.analyze_image(image)
        
        except Exception as e:
            self.logger.error(f"File loading error: {e}")
            return self._error_result(f"Failed to load image: {str(e)}")
    
    def analyze_image(self, image: np.ndarray) -> AnalysisResult:
        """
        Analyze handwriting from a numpy image array
        
        Args:
            image: BGR image from cv2.imread() or similar
            
        Returns:
            AnalysisResult with all metrics
        """
        try:
            # Validation
            if image is None or image.size == 0:
                return self._error_result("Invalid image input (None or empty)")
            
            if len(image.shape) != 3 or image.shape[2] != 3:
                return self._error_result(
                    f"Image must be 3-channel BGR, got shape {image.shape}"
                )
            
            # Preprocessing
            gray, thresh, cleaned = self._preprocess_image(image)
            if gray is None:
                return self._error_result("Failed to preprocess image")
            
            # Extract strokes
            contours = self._extract_contours(cleaned)
            if len(contours) < 3:
                return self._error_result(
                    f"Insufficient handwriting detected (only {len(contours)} marks)"
                )
            
            # Get valid bounding boxes
            boxes = self._get_valid_boxes(contours)
            if len(boxes) < 3:
                return self._error_result(
                    "Insufficient valid strokes after noise filtering"
                )
            
            # Sort left-to-right
            boxes.sort(key=lambda b: b[0])
            
            # Calculate all metrics
            result = self._calculate_all_metrics(boxes, gray, cleaned)
            
            return result
        
        except Exception as e:
            self.logger.error(f"Analysis error: {e}", exc_info=True)
            return self._error_result(f"Exception during analysis: {str(e)}")
    
    # ========================================================================
    # PREPROCESSING
    # ========================================================================
    
    def _preprocess_image(self, image: np.ndarray) -> Tuple:
        """
        Robust preprocessing pipeline
        
        Returns:
            Tuple of (gray, binary_threshold, cleaned_binary) or (None, None, None)
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Enhance contrast with CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            gray = clahe.apply(gray)
            
            # Otsu's threshold for binary image
            _, thresh = cv2.threshold(
                gray, 0, 255, 
                cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
            )
            
            # Morphological cleaning
            kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
            kernel_medium = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            
            # Close small holes
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel_small, iterations=1)
            # Remove small noise
            cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel_small, iterations=1)
            
            return gray, thresh, cleaned
        
        except Exception as e:
            self.logger.error(f"Preprocessing error: {e}")
            return None, None, None
    
    # ========================================================================
    # CONTOUR EXTRACTION
    # ========================================================================
    
    def _extract_contours(self, binary_image: np.ndarray) -> List:
        """Extract contours with error handling"""
        try:
            contours, _ = cv2.findContours(
                binary_image,
                cv2.RETR_EXTERNAL,
                cv2.CHAIN_APPROX_SIMPLE
            )
            return list(contours) if contours else []
        except Exception as e:
            self.logger.error(f"Contour extraction error: {e}")
            return []
    
    # ========================================================================
    # BOUNDING BOX FILTERING
    # ========================================================================
    
    def _get_valid_boxes(self, contours: List) -> List[Tuple[int, int, int, int]]:
        """
        Filter contours to valid bounding boxes (removes noise)
        
        Returns:
            List of (x, y, width, height)
        """
        boxes = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Filter out noise (too small)
            if w >= self.config.MIN_STROKE_SIZE and h >= self.config.MIN_STROKE_SIZE:
                # Aspect ratio sanity check (letters aren't extremely wide/tall)
                aspect_ratio = max(w, h) / min(w, h)
                if aspect_ratio < 8:  # Reasonable letter shape
                    boxes.append((x, y, w, h))
        
        return boxes
    
    # ========================================================================
    # METRIC CALCULATIONS
    # ========================================================================
    
    def _calculate_all_metrics(self, boxes: List, gray: np.ndarray, 
                               binary: np.ndarray) -> AnalysisResult:
        """Calculate all metrics and return complete result"""
        
        details = {}
        
        # 1. LINEARITY (Baseline Stability)
        linearity_score, baseline_std = self._analyze_linearity(boxes)
        details['baseline_std'] = baseline_std
        
        # 2. SPACING CONSISTENCY
        spacing_score, spacing_std, spacing_mean = self._analyze_spacing(boxes)
        details['spacing_std'] = spacing_std
        details['spacing_mean'] = spacing_mean
        
        # 3. SIZE CONSISTENCY
        size_score, size_std, size_mean = self._analyze_size_consistency(boxes)
        details['size_std'] = size_std
        details['size_mean'] = size_mean
        
        # 4. SLANT CONSISTENCY
        slant_score, slant_std = self._analyze_slant(boxes)
        details['slant_std'] = slant_std
        
        # 5. PRESSURE ESTIMATION
        pressure_score, pressure_std = self._analyze_pressure(boxes, binary)
        details['pressure_std'] = pressure_std
        
        # COMPOSITE SCORES
        stability_score = (
            linearity_score * self.config.WEIGHT_LINEARITY +
            spacing_score * self.config.WEIGHT_SPACING +
            size_score * self.config.WEIGHT_SIZE +
            slant_score * self.config.WEIGHT_SLANT +
            pressure_score * self.config.WEIGHT_PRESSURE
        )
        
        dysgraphia_risk = 100 - stability_score
        
        # Estimate confidence
        confidence = self._estimate_confidence(boxes, gray)
        
        # Classify risk and get recommendation
        risk_level, recommendation = RiskClassifier.classify(
            dysgraphia_risk, confidence, len(boxes)
        )
        
        return AnalysisResult(
            stability_score=stability_score,
            linearity_score=linearity_score,
            spacing_consistency=spacing_score,
            size_consistency=size_score,
            slant_consistency=slant_score,
            pressure_estimate=pressure_score,
            dysgraphia_risk=dysgraphia_risk,
            risk_level=risk_level,
            confidence=confidence,
            num_strokes=len(boxes),
            recommendation=recommendation,
            details=details,
            error=None
        )
    
    def _analyze_linearity(self, boxes: List) -> Tuple[float, float]:
        """
        Baseline consistency analysis
        
        Returns:
            (score 0-100, std_dev in pixels)
        """
        if len(boxes) < 2:
            return 100.0, 0.0
        
        baselines = np.array([y + h for x, y, w, h in boxes])
        baseline_std = float(np.std(baselines))
        
        # Map std to score: lower std = higher score
        linearity_score = max(0, 100 - (
            (baseline_std / self.config.BASELINE_POOR_STD) * 100
        ))
        
        return linearity_score, baseline_std
    
    def _analyze_spacing(self, boxes: List) -> Tuple[float, float, float]:
        """
        Inter-character spacing consistency
        
        Returns:
            (score 0-100, std_dev, mean_gap)
        """
        if len(boxes) < 2:
            return 100.0, 0.0, 0.0
        
        gaps = []
        for i in range(1, len(boxes)):
            curr_x = boxes[i][0]
            prev_end = boxes[i-1][0] + boxes[i-1][2]
            gap = curr_x - prev_end
            if gap > -5:  # Allow slight overlap (cursive)
                gaps.append(max(0, gap))
        
        if not gaps:
            return 100.0, 0.0, 0.0
        
        spacing_std = float(np.std(gaps))
        spacing_mean = float(np.mean(gaps))
        
        spacing_score = max(0, 100 - (
            (spacing_std / self.config.SPACING_POOR_STD) * 100
        ))
        
        return spacing_score, spacing_std, spacing_mean
    
    def _analyze_size_consistency(self, boxes: List) -> Tuple[float, float, float]:
        """
        Letter size consistency via coefficient of variation
        
        Returns:
            (score 0-100, std_dev, mean_area)
        """
        if len(boxes) < 2:
            return 100.0, 0.0, 0.0
        
        areas = np.array([w * h for x, y, w, h in boxes])
        size_std = float(np.std(areas))
        size_mean = float(np.mean(areas))
        
        # Coefficient of variation (normalized std)
        cv = (size_std / size_mean * 100) if size_mean > 0 else 0
        
        # CV > 50% is poor (dysgraphia)
        size_score = max(0, 100 - (
            (cv / self.config.SIZE_POOR_CV) * 100
        ))
        
        return size_score, size_std, size_mean
    
    def _analyze_slant(self, boxes: List) -> Tuple[float, float]:
        """
        Writing slant consistency (simplified aspect ratio method)
        
        Returns:
            (score 0-100, std_dev)
        """
        if len(boxes) < 3:
            return 100.0, 0.0
        
        aspect_ratios = np.array([
            w / h if h > 0 else 1.0
            for x, y, w, h in boxes
        ])
        
        slant_std = float(np.std(aspect_ratios))
        slant_score = max(0, 100 - (slant_std * 200))
        
        return slant_score, slant_std
    
    def _analyze_pressure(self, boxes: List, 
                         binary: np.ndarray) -> Tuple[float, float]:
        """
        Pen pressure estimation via pixel density variation
        
        Returns:
            (score 0-100, std_dev)
        """
        if len(boxes) < 3:
            return 100.0, 0.0
        
        densities = []
        for x, y, w, h in boxes:
            roi = binary[y:y+h, x:x+w]
            if roi.size > 0:
                density = np.sum(roi > 0) / roi.size
                densities.append(density)
        
        if not densities:
            return 100.0, 0.0
        
        pressure_std = float(np.std(densities))
        pressure_score = max(0, 100 - (pressure_std * 200))
        
        return pressure_score, pressure_std
    
    # ========================================================================
    # CONFIDENCE & ERROR HANDLING
    # ========================================================================
    
    def _estimate_confidence(self, boxes: List, gray: np.ndarray) -> float:
        """
        Estimate analysis confidence based on data quality
        
        Factors:
        - Sample count (too few or too many)
        - Image contrast quality
        """
        confidence = 80.0  # Start at 80%
        
        # Penalize low sample count
        if len(boxes) < 3:
            confidence -= 30
        elif len(boxes) < 5:
            confidence -= 15
        elif len(boxes) > self.config.MAX_SAMPLES_BEFORE_FRAGMENTATION:
            confidence -= 10  # Too fragmented, possibly noise
        
        # Check image contrast
        contrast = float(np.std(gray))
        if contrast < 20:
            confidence -= 25  # Low contrast
        elif contrast < 40:
            confidence -= 10  # Moderate contrast
        
        return max(20, min(100, confidence))
    
    def _error_result(self, error_msg: str) -> AnalysisResult:
        """Return error state result"""
        self.logger.warning(f"Analysis failed: {error_msg}")
        return AnalysisResult(
            stability_score=0,
            linearity_score=0,
            spacing_consistency=0,
            size_consistency=0,
            slant_consistency=0,
            pressure_estimate=0,
            dysgraphia_risk=0,
            risk_level=RiskLevel.LOW,
            confidence=0,
            num_strokes=0,
            recommendation="Unable to perform analysis. " + error_msg,
            details={'error': error_msg},
            error=error_msg
        )


# ============================================================================
# CONVENIENCE FUNCTIONS (for frontend integration)
# ============================================================================

def analyze_handwriting_image(image_path: str) -> AnalysisResult:
    """
    Simple function to analyze handwriting from file path
    
    Args:
        image_path: Path to image file
        
    Returns:
        AnalysisResult object (see AnalysisResult.to_dict() for JSON-ready format)
    
    Example:
        result = analyze_handwriting_image("handwriting.jpg")
        print(f"Stability: {result.stability_score}/100")
        print(f"Risk: {result.risk_level.name}")
        print(result.recommendation)
    """
    analyzer = DysgraphiaAnalyzer()
    return analyzer.analyze_file(image_path)


def analyze_handwriting_array(image: np.ndarray) -> AnalysisResult:
    """
    Analyze handwriting from numpy array
    
    Args:
        image: BGR image array from cv2.imread()
        
    Returns:
        AnalysisResult object
    
    Example:
        image = cv2.imread("handwriting.jpg")
        result = analyze_handwriting_array(image)
    """
    analyzer = DysgraphiaAnalyzer()
    return analyzer.analyze_image(image)


# ============================================================================
# BACKWARD COMPATIBILITY (for existing code)
# ============================================================================

def analyze_handwriting(image: np.ndarray) -> Tuple[float, str]:
    """
    DEPRECATED: Legacy function for backward compatibility
    
    Original function signature from initial code.
    Use analyze_handwriting_array() or analyze_handwriting_image() instead.
    
    Args:
        image: BGR image from cv2.imread()
        
    Returns:
        Tuple of (stability_score, details_string)
    """
    result = analyze_handwriting_array(image)
    
    if result.error:
        return 0.0, result.error
    
    details = (
        f"Baseline Var: {result.details.get('baseline_std', 0):.1f}, "
        f"Spacing Var: {result.details.get('spacing_std', 0):.1f}, "
        f"Risk: {result.risk_level.name}"
    )
    
    return result.stability_score, details


# ============================================================================
# TESTING & VALIDATION
# ============================================================================

def create_test_good_handwriting(width: int = 800, height: int = 200) -> np.ndarray:
    """Create synthetic 'good' handwriting for testing"""
    image = np.ones((height, width, 3), dtype=np.uint8) * 255
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(image, "The quick brown fox", (50, 100), font, 1.2, (0, 0, 0), 2)
    return image


def create_test_poor_handwriting(width: int = 800, height: int = 200) -> np.ndarray:
    """Create synthetic 'poor' handwriting for testing"""
    image = np.ones((height, width, 3), dtype=np.uint8) * 255
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    y_positions = [80, 95, 110, 85, 120, 90, 105, 88, 115, 92]
    x_pos = 50
    for char, y in zip("dysgraphia", y_positions):
        cv2.putText(image, char, (x_pos, y), font, 
                   np.random.uniform(0.8, 1.5), (0, 0, 0), 2)
        x_pos += np.random.randint(25, 60)
    
    return image


def run_tests():
    """Run validation tests"""
    print("\n" + "="*70)
    print("DYSGRAPHIA ANALYZER - VALIDATION TESTS")
    print("="*70 + "\n")
    
    # Test 1: Good handwriting
    print("Test 1: Good Handwriting Sample")
    print("-" * 70)
    good_image = create_test_good_handwriting()
    result = analyze_handwriting_array(good_image)
    print(result)
    print(f"Recommendation: {result.recommendation}\n")
    
    # Test 2: Poor handwriting
    print("Test 2: Poor Handwriting Sample (Simulated Dysgraphia)")
    print("-" * 70)
    poor_image = create_test_poor_handwriting()
    result = analyze_handwriting_array(poor_image)
    print(result)
    print(f"Recommendation: {result.recommendation}\n")
    
    # Test 3: Invalid input
    print("Test 3: Error Handling (None input)")
    print("-" * 70)
    result = analyze_handwriting_array(None)
    print(result)
    print(f"Error: {result.error}\n")
    
    # Test 4: JSON serialization
    print("Test 4: JSON Serialization")
    print("-" * 70)
    good_image = create_test_good_handwriting()
    result = analyze_handwriting_array(good_image)
    json_data = result.to_dict()
    print(f"Keys in JSON output: {list(json_data.keys())}")
    print(f"Sample JSON: {json_data}\n")
    
    print("="*70)
    print("ALL TESTS COMPLETED")
    print("="*70 + "\n")


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    print(__doc__)
    run_tests()