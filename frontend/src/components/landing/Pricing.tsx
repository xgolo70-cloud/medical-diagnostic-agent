import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap, Crown, ArrowRight, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/Button';

const plans = [
    {
        name: "Hobby",
        price: { monthly: "$0", yearly: "$0" },
        description: "Perfect for prototyping and personal projects.",
        icon: Zap,
        features: [
            { text: "Up to 100 devices", included: true },
            { text: "1GB data retention", included: true },
            { text: "Community Support", included: true },
            { text: "Basic Analytics", included: true },
            { text: "Custom Alerts", included: false },
            { text: "HIPAA Compliance", included: false }
        ],
        cta: "Start Free",
        highlight: false
    },
    {
        name: "Pro",
        price: { monthly: "$299", yearly: "$249" },
        description: "For growing teams and production workloads.",
        icon: Sparkles,
        features: [
            { text: "Up to 10,000 devices", included: true },
            { text: "30-day data retention", included: true },
            { text: "Priority Support", included: true },
            { text: "Advanced Anomaly Detection", included: true },
            { text: "Custom Alerts & Webhooks", included: true },
            { text: "HIPAA Compliance", included: false }
        ],
        cta: "Start Pro Trial",
        highlight: true
    },
    {
        name: "Enterprise",
        price: { monthly: "Custom", yearly: "Custom" },
        description: "For large healthcare networks.",
        icon: Crown,
        features: [
            { text: "Unlimited devices", included: true },
            { text: "Unlimited retention", included: true },
            { text: "24/7 Dedicated Support", included: true },
            { text: "On-premise deployment", included: true },
            { text: "BAA Signing (HIPAA)", included: true },
            { text: "SLA Guarantees", included: true }
        ],
        cta: "Contact Sales",
        highlight: false
    }
];

export const Pricing = () => {
    const [isYearly, setIsYearly] = useState(true);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section id="pricing" ref={sectionRef} className="py-24 relative bg-white">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Predictable pricing,
                        <br />
                        designed to scale.
                    </h2>
                    <div className="flex justify-center w-full">
                        <p className="text-lg text-gray-500 max-w-xl w-full mb-10 text-center">
                            Start for free, scale with your fleet. No hidden fees.
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
                        <button 
                            onClick={() => setIsYearly(!isYearly)}
                            className="w-14 h-8 rounded-full bg-gray-100 p-1 relative transition-colors hover:bg-gray-200 border border-gray-200"
                        >
                            <motion.div 
                                className="w-6 h-6 rounded-full bg-black shadow-sm"
                                animate={{ x: isYearly ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            Yearly
                            <span className="text-black text-xs ml-2 font-medium bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                Save 20%
                            </span>
                        </span>
                    </div>
                </motion.div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
                    {plans.map((plan, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group h-full"
                        >
                            {/* Magic Border for Highlighted Plan */}
                            {plan.highlight && (
                                <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden pointer-events-none transform scale-100 shadow-2xl shadow-black/10">
                                    <div className="absolute inset-0 bg-gray-900/5 blur-2xl" /> 
                                    {/* Simplified clean border for pro instead of rotating beam which can be distracting for reading */}
                                    <div className="absolute inset-0 border-2 border-black rounded-2xl" />
                                </div>
                            )}
                            
                            <div className={`relative h-full rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                                plan.highlight 
                                    ? 'bg-gray-50/50 scale-100 z-10' 
                                    : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg'
                            }`}>
                                {/* Highlight Badge */}
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black text-[10px] font-bold text-white tracking-widest uppercase shadow-md z-20 flex items-center gap-1.5 h-6">
                                        Popular
                                    </div>
                                )}

                                {/* Header - Fixed Min Height for alignment */}
                                <div className="mb-6 min-h-[140px] flex flex-col">
                                    <div className="flex justify-between items-start w-full">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                                            plan.highlight ? 'bg-black text-white shadow-xl shadow-black/10' : 'bg-gray-50 text-gray-900 border border-gray-100'
                                        }`}>
                                            <plan.icon size={22} strokeWidth={1.5} />
                                        </div>
                                        {plan.highlight && <Crown size={20} className="text-black/20" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">{plan.description}</p>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-gray-100 mb-6" />

                                {/* Price - Fixed Height */}
                                <div className="mb-8 min-h-[80px]">
                                    <div className="flex items-baseline gap-1">
                                        <motion.span 
                                            key={isYearly ? "year" : "month"}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-5xl font-bold text-gray-900 tracking-tighter"
                                        >
                                            {isYearly ? plan.price.yearly : plan.price.monthly}
                                        </motion.span>
                                        {plan.price.monthly !== 'Custom' && (
                                            <span className="text-gray-400 font-medium text-sm translate-y-[-4px]">/mo</span>
                                        )}
                                    </div>
                                    {isYearly && plan.price.monthly !== 'Custom' && plan.price.monthly !== '$0' && (
                                        <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 w-fit">
                                            <Check size={10} strokeWidth={4} />
                                            Save 20%
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 py-0.5">
                                            {feature.included ? (
                                                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    plan.highlight ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                    <Check size={10} strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center bg-transparent border border-gray-200 text-gray-300 flex-shrink-0">
                                                    <X size={10} strokeWidth={3} />
                                                </div>
                                            )}
                                            <span className={`text-sm leading-tight transition-colors ${feature.included ? 'text-gray-700 font-semibold' : 'text-gray-400'}`}>
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Button
                                    className={`w-full py-6 rounded-xl font-bold text-sm tracking-wide transition-all ${
                                        plan.highlight 
                                            ? 'bg-black text-white hover:bg-gray-800 shadow-xl hover:-translate-y-1' 
                                            : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {plan.cta}
                                        {plan.highlight && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
