def _risk_from_score(score: float):
    """Utility to convert numeric score to risk level."""
    if score >= 80:
        return "Low Risk"
    elif score >= 60:
        return "Medium Risk"
    else:
        return "High Risk"


def get_focus_score(avg_std, avg_dist=None, near_ratio=None):
    """
    Focus test scoring.

    Parameters
    ----------
    avg_std : float
        Average std dev of gaze (pixels). Higher => more shaky.
    avg_dist : float or None
        Average distance from gaze to the center dot (pixels).
        Lower => closer to the dot.
    near_ratio : float or None
        Fraction of gaze frames where gaze was near the dot (0–1).
        Higher => more often actually looking at the dot.

    If only avg_std is provided, we fall back to the old behavior.
    If avg_dist and near_ratio are provided, we combine all three to decide the score.
    """
    if avg_std is None:
        return 0, "No Data", "No eye data was captured in the focus test."

    # --- Old simple behavior fallback (for backward compatibility) ---
    if avg_dist is None or near_ratio is None:
        k = 0.7  # simple linear mapping
        raw_score = 100 - k * avg_std
        score = max(0, min(100, raw_score))
        level = _risk_from_score(score)

        if level == "Low Risk":
            comment = (
                f"Your gaze was quite stable (avg std ≈ {avg_std:.1f}px). "
                "This indicates good focus in this test."
            )
        elif level == "Medium Risk":
            comment = (
                f"Your gaze moved a moderate amount (avg std ≈ {avg_std:.1f}px). "
                "Focus is average and can be monitored over time."
            )
        else:
            comment = (
                f"Your gaze moved a lot during the test (avg std ≈ {avg_std:.1f}px). "
                "In real screening, this would suggest deeper checks."
            )
        return int(round(score)), level, comment

    # --- New combined behavior-aware scoring ---

    # 1) Stability component: lower std => higher score
    #    Assume std 20 is very good, 120 is quite bad (tune if needed).
    k_std = 0.5
    stability_raw = 100 - k_std * avg_std
    stability_score = max(0, min(100, stability_raw))

    # 2) Distance component: lower distance from center dot => higher score
    #    Assume avg_dist 20 is excellent, 180 is bad.
    k_dist = 0.4
    dist_raw = 100 - k_dist * avg_dist
    distance_score = max(0, min(100, dist_raw))

    # 3) Near ratio: how often actually close to the dot
    #    near_ratio 1.0 = always on dot, 0.0 = never on dot
    #    Map this roughly into a bonus around -20 to +20.
    near_bonus = (near_ratio - 0.5) * 40  # if 1.0 => +20, if 0.0 => -20

    # Combine
    base_score = 0.4 * stability_score + 0.6 * distance_score + near_bonus

    # Hard rule: if user rarely looked near the dot, cap max score
    if near_ratio < 0.2:
        base_score = min(base_score, 30)  # force High Risk
    elif near_ratio < 0.4:
        base_score = min(base_score, 60)  # at best Medium

    score = max(0, min(100, base_score))
    level = _risk_from_score(score)

    # Human-friendly comment
    if level == "Low Risk":
        comment = (
            f"Your gaze was close to the center dot most of the time "
            f"(near ratio ≈ {near_ratio*100:.0f}%), with moderate stability "
            f"(movement std ≈ {avg_std:.1f}px, distance ≈ {avg_dist:.1f}px). "
            "This suggests good focus in this test."
        )
    elif level == "Medium Risk":
        comment = (
            f"Your gaze sometimes moved away from the center dot or was a bit unstable "
            f"(near ratio ≈ {near_ratio*100:.0f}%, std ≈ {avg_std:.1f}px, "
            f"distance ≈ {avg_dist:.1f}px). Focus is average and can be monitored."
        )
    else:
        comment = (
            f"You were not looking at the center dot consistently "
            f"(near ratio ≈ {near_ratio*100:.0f}%, std ≈ {avg_std:.1f}px, "
            f"distance ≈ {avg_dist:.1f}px). In real screening, this would suggest "
            "that more detailed cognitive checks may be useful."
        )

    return int(round(score)), level, comment


# Backward compatibility if used elsewhere
def get_eye_stability_score(avg_std):
    # Use simple fallback
    return get_focus_score(avg_std)


def get_follow_dot_score(avg_error, hit_ratio=None):
    """
    Follow-dot test (tracking accuracy).

    avg_error : average distance between gaze and moving dot (pixels).
                Lower = better tracking.
    hit_ratio : fraction of frames where gaze was within a radius of the dot (0–1).
                Higher = better following behavior.
    """
    if avg_error is None:
        return 0, "No Data", "No gaze data was captured in the follow-dot test."

    # Old behavior if hit_ratio not provided
    if hit_ratio is None:
        k = 0.2
        raw_score = 100 - k * avg_error
        score = max(0, min(100, raw_score))
        level = _risk_from_score(score)

        if level == "Low Risk":
            comment = (
                f"You tracked the moving dot closely (avg error ≈ {avg_error:.1f}px). "
                "Eye tracking in this task looks strong."
            )
        elif level == "Medium Risk":
            comment = (
                f"You followed the dot reasonably (avg error ≈ {avg_error:.1f}px). "
                "Tracking is average."
            )
        else:
            comment = (
                f"Your eyes often deviated from the moving dot (avg error ≈ {avg_error:.1f}px). "
                "Tracking appears weak in this demo."
            )

        return int(round(score)), level, comment

    # New behavior-aware scoring
    # 1) Base score from error
    k_err = 0.15
    err_raw = 100 - k_err * avg_error
    err_score = max(0, min(100, err_raw))

    # 2) Hit ratio bonus/penalty
    #    1.0 => +20, 0.0 => -20
    hit_bonus = (hit_ratio - 0.5) * 40

    base_score = err_score + hit_bonus

    # If almost never near the dot, clamp to low score
    if hit_ratio < 0.2:
        base_score = min(base_score, 30)
    elif hit_ratio < 0.4:
        base_score = min(base_score, 60)

    score = max(0, min(100, base_score))
    level = _risk_from_score(score)

    if level == "Low Risk":
        comment = (
            f"You followed the moving dot very well (avg error ≈ {avg_error:.1f}px, "
            f"close to dot in ≈ {hit_ratio*100:.0f}% of frames)."
        )
    elif level == "Medium Risk":
        comment = (
            f"You followed the dot in many frames but with some deviation "
            f"(avg error ≈ {avg_error:.1f}px, hits ≈ {hit_ratio*100:.0f}%). "
            "Tracking is moderate."
        )
    else:
        comment = (
            f"You were often not looking near the moving dot "
            f"(avg error ≈ {avg_error:.1f}px, hits ≈ {hit_ratio*100:.0f}%). "
            "In a real screening, this would suggest attention or tracking difficulties."
        )

    return int(round(score)), level, comment


def get_reading_focus_score(accuracy):
    """
    Reading focus test scoring.
    accuracy = fraction of intervals where user looked at the highlighted word (0.0–1.0).

    Here we directly map:
        score = accuracy * 100
    and then classify risk from that score.
    """
    if accuracy is None:
        return 0, "No Data", "Reading focus test was not completed."

    score = max(0.0, min(100.0, accuracy * 100.0))
    level = _risk_from_score(score)

    if level == "Low Risk":
        comment = (
            f"You focused on the highlighted words most of the time "
            f"(accuracy ≈ {score:.1f}%). This indicates strong visual focus."
        )
    elif level == "Medium Risk":
        comment = (
            f"You focused on about half of the highlighted words "
            f"(accuracy ≈ {score:.1f}%). Focus is moderate."
        )
    else:
        comment = (
            f"You missed many highlighted words (accuracy ≈ {score:.1f}%). "
            "This suggests difficulty maintaining visual focus during reading."
        )

    return int(round(score)), level, comment
