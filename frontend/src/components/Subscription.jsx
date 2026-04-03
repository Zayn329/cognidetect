import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { Check, X, Zap, ArrowRight, Sparkles, Crown } from 'lucide-react';
import { Button } from './ui/button';

const motion = Motion;

export default function Subscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Check for premium status from localStorage
  useEffect(() => {
    const premiumStatus = localStorage.getItem('isPremium');
    if (premiumStatus) {
      setIsPremium(true);
    }
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Auto-close success animation after 3 seconds
  useEffect(() => {
    if (showSuccessAnimation) {
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAnimation]);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create order on backend (you'll need to create an API endpoint)
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 999 * 100, // Amount in paise (₹999)
          currency: 'INR',
        }),
      });

      const { id: orderId } = await response.json();

      // Razorpay payment options
      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
        amount: 999 * 100,
        currency: 'INR',
        name: 'CogniDetect Premium',
        description: 'Premium Subscription Plan',
        order_id: orderId,
        handler: async (response) => {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            // Payment successful
            localStorage.setItem('isPremium', 'true');
            setIsPremium(true);
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 3000);
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#06B6D4',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const plans = [
    {
      name: 'Free Plan',
      price: '₹0',
      period: 'Forever',
      description: 'Get started with essential features',
      features: [
        { text: 'One cognitive assessment', included: true },
        { text: 'Basic performance report', included: true },
        { text: 'Memory screening', included: true },
        { text: 'Limited email support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Unlimited assessments', included: false },
        { text: 'Phone support', included: false },
        { text: 'Custom reporting', included: false },
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Premium Pro',
      price: '₹999',
      period: 'Per Month',
      description: 'Unlock full potential with advanced features',
      features: [
        { text: 'Unlimited assessments', included: true },
        { text: 'Advanced AI-powered reports', included: true },
        { text: 'All screening modules', included: true },
        { text: 'Priority support 24/7', included: true },
        { text: 'Advanced analytics & trends', included: true },
        { text: 'Detailed performance insights', included: true },
        { text: 'Export reports in multiple formats', included: true },
        { text: 'Custom assessment scheduling', included: true },
      ],
      cta: 'Get Premium',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Contact Sales',
      description: 'Dedicated solution for organizations',
      features: [
        { text: 'Unlimited assessments', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Team management', included: true },
        { text: 'Dedicated support team', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'White-label options', included: true },
        { text: 'On-premise deployment', included: true },
        { text: 'SLA guarantee', included: true },
      ],
      cta: 'Contact Us',
      highlighted: false,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-b from-cyan-600/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-t from-emerald-600/20 to-transparent blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-5 opacity-5 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:60px_60px]" />

      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          {/* Premium Status Banner */}
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 backdrop-blur-sm"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Crown className="h-5 w-5 text-emerald-400" />
              </motion.div>
              <span className="text-sm font-bold text-emerald-300">🎉 You have Premium subscription!</span>
              <Check className="h-5 w-5 text-emerald-400" />
            </motion.div>
          )}

          <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-900/20 backdrop-blur-sm mb-6">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <span className="text-sm font-semibold text-cyan-200">SIMPLE & TRANSPARENT PRICING</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Unlock advanced cognitive screening with our premium subscription. Start your journey to better brain health today.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div className="grid md:grid-cols-3 gap-8 mb-20" variants={itemVariants}>
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                plan.highlighted
                  ? 'md:scale-105 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/30'
                  : 'border border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 -z-10 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-slate-900 via-cyan-900/30 to-slate-900'
                    : 'bg-gradient-to-br from-slate-900 to-slate-950'
                }`}
              />

              {/* Premium Badge */}
              {plan.highlighted && (
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-xs font-bold">
                    <Zap className="h-4 w-4" />
                    MOST POPULAR
                  </div>
                </motion.div>
              )}

              <div className="p-8 pt-12">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                {/* Pricing */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                      {plan.price}
                    </span>
                    <span className="text-slate-400 text-sm">{plan.period}</span>
                  </div>
                  {plan.price !== 'Custom' && plan.price !== '₹0' && (
                    <p className="text-xs text-slate-500">Cancel anytime, no commitment</p>
                  )}
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mb-8"
                >
                  <Button
                    onClick={() => {
                      if (plan.name === 'Premium Pro') {
                        if (isPremium) {
                          alert('You already have Premium subscription!');
                        } else {
                          handlePayment();
                        }
                      }
                    }}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      plan.highlighted
                        ? isPremium
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/40'
                          : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white shadow-lg shadow-cyan-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {plan.name === 'Premium Pro' && isPremium ? (
                      <>
                        <Crown className="h-4 w-4" />
                        Premium Active ✓
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Features List */}
                <div className="space-y-3 border-t border-slate-700 pt-8">
                  {plan.features.map((feature, fIdx) => (
                    <motion.div
                      key={fIdx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fIdx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      {feature.included ? (
                        <div className="mt-1 flex-shrink-0">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: fIdx * 0.05 + 0.2 }}
                            className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </motion.div>
                        </div>
                      ) : (
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                            <X className="h-3 w-3 text-slate-600" />
                          </div>
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-slate-300' : 'text-slate-500 line-through'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants} className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your Premium Pro subscription at any time. No hidden charges or long-term commitments required.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, UPI, and other Indian payment methods for seamless transactions.'
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. CogniDetect uses enterprise-grade encryption and is fully HIPAA compliant. Your data is always protected.'
              },
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Yes! You can change your plan anytime. Changes take effect in your next billing cycle.'
              },
            ].map((faq, idx) => (
              <motion.details
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group rounded-lg border border-slate-700 hover:border-cyan-500/50 bg-slate-900/50 backdrop-blur-sm overflow-hidden hover:bg-slate-900/80 transition-all"
              >
                <summary className="cursor-pointer p-5 font-semibold text-white flex items-center justify-between">
                  {faq.q}
                  <motion.div
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-sm group-open:rotate-180 transition-transform"
                  >
                    +
                  </motion.div>
                </summary>
                <motion.p className="px-5 pb-5 text-slate-300 border-t border-slate-700">{faq.a}</motion.p>
              </motion.details>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={itemVariants}
          className="mt-20 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block"
          >
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-emerald-900/20 backdrop-blur-sm p-8">
              <p className="text-slate-300 mb-4">
                Ready to take your cognitive health seriously?
              </p>
              <h3 className="text-2xl font-bold text-white mb-6">
                Start your Premium journey at just ₹999/month
              </h3>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-bold gap-2 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                  Upgrade to Premium Now
                  <Zap className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Success Animation */}
      {showSuccessAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-emerald-500/50 p-12 text-center max-w-md shadow-2xl shadow-emerald-500/30"
          >
            {/* Success Circle */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/50"
            >
              <motion.div
                animate={{ scale: [0, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Check className="h-12 w-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Success Message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-white mb-3"
            >
              Payment Successful! 🎉
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-300 mb-6"
            >
              Welcome to CogniDetect Premium! Your subscription is now active. Enjoy unlimited assessments and advanced features.
            </motion.p>

            {/* Premium Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mb-8 text-left"
            >
              {['✓ Unlimited Assessments', '✓ Advanced Reports', '✓ 24/7 Support'].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-emerald-300">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: 0.8 + idx * 0.1, duration: 0.6, repeat: Infinity }}
                  >
                    <Crown className="h-5 w-5" />
                  </motion.div>
                  <span className="font-semibold">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* Closing Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xs text-slate-500"
            >
              This message will close in a moment...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
