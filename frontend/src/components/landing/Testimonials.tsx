import { motion } from 'framer-motion';
import { Star, Sparkles, Quote, Activity, Users, Zap, ShieldCheck } from 'lucide-react';

const reviews = [
    {
        text: "AI & Things revolutionized our remote patient monitoring. We've reduced false alerts by 85% and improved response times dramatically.",
        author: "Dr. Sarah Chen",
        role: "Chief Medical Officer",
        company: "CardioPulse",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5,
        tag: "Enterprise"
    },
    {
        text: "The latency is incredible. It feels like the AI is running directly on the sensor. Game-changing technology for our critical care units.",
        author: "James Wilson",
        role: "VP of Engineering",
        company: "MedTech Solutions",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5,
        tag: "Tech Lead"
    },
    {
        text: "Compliance was our biggest headache. This platform solved it completely out of the box with built-in HIPAA guardrails.",
        author: "Elena Rodriguez",
        role: "Head of Security",
        company: "HealthFirst",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5,
        tag: "Security"
    },
    {
        text: "We've processed over 2 million patient readings with zero downtime. The reliability of the edge inference is unmatched.",
        author: "Dr. Michael Park",
        role: "Head of Digital Health",
        company: "Metro Hospital",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5,
        tag: "Innovation"
    },
    {
        text: "The integration with our existing EHR systems was seamless. Our team was up and running in days, not months.",
        author: "Lisa Martinez",
        role: "CTO",
        company: "CareConnect",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5,
        tag: "Integration"
    },
    {
        text: "Finally, an edge AI solution that actually delivers on its promises. Highly recommended for any high-scale deployment.",
        author: "David Kim",
        role: "Lead Architect",
        company: "BiometricsPlus",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5,
        tag: "Architecture"
    },
];

const ReviewCard = ({ review }: { review: typeof reviews[0] }) => (
    <div className="group relative w-[400px] flex-shrink-0 mx-4">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-sm transition-all duration-300 group-hover:bg-white/80 group-hover:shadow-xl group-hover:-translate-y-1" />
        
        <div className="relative p-8 h-full flex flex-col justify-between z-10">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-1">
                        {[...Array(review.stars)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
                        ))}
                    </div>
                    <div className="px-3 py-1 bg-black/5 rounded-full text-[11px] font-semibold text-gray-600 uppercase tracking-wider backdrop-blur-sm">
                        {review.tag}
                    </div>
                </div>

                <Quote className="w-10 h-10 text-black/5 absolute top-6 right-6 rotate-12" />

                <p className="text-[17px] leading-[1.6] text-gray-700 font-medium mb-8">
                    "{review.text}"
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 pt-6 border-t border-black/5">
                <img 
                    src={review.avatar} 
                    alt={review.author} 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div>
                    <div className="text-[15px] font-bold text-gray-900 leading-tight">
                        {review.author}
                    </div>
                    <div className="text-[13px] text-gray-500 font-medium leading-tight mt-0.5">
                        {review.role}, {review.company}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const Testimonials = () => {
    // Create infinite rows
    const row1 = [...reviews, ...reviews];
    const row2 = [...reviews, ...reviews].reverse();

    return (
        <section className="py-32 relative overflow-hidden bg-[#fafafa]">
            {/* Dynamic Backgrounds */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-400/5 rounded-full blur-[120px] mix-blend-multiply" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-24 flex flex-col items-center max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-semibold text-gray-800">Verified Customer Stories</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tight w-full"
                    >
                        Loved by innovators
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto w-full"
                    >
                        Join thousands of healthcare professionals and engineering teams who trust AI & Things for their critical edge infrastructure.
                    </motion.p>
                </div>
            </div>

            {/* Marquee Section */}
            <div className="relative w-full space-y-10">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#fafafa] via-[#fafafa]/80 to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#fafafa] via-[#fafafa]/80 to-transparent z-20 pointer-events-none" />

                {/* Row 1 */}
                <div className="relative w-full overflow-hidden py-4">
                    <div className="flex animate-marquee hover:[animation-play-state:paused] w-max">
                        {row1.map((review, i) => (
                            <ReviewCard key={`r1-${i}`} review={review} />
                        ))}
                    </div>
                </div>

                {/* Row 2 */}
                <div className="relative w-full overflow-hidden py-4">
                    <div className="flex animate-marquee-reverse hover:[animation-play-state:paused] w-max">
                        {row2.map((review, i) => (
                            <ReviewCard key={`r2-${i}`} review={review} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Section with Glass Cards */}
            <div className="max-w-6xl mx-auto px-6 mt-40 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Uptime SLA", value: "99.99%", icon: Activity },
                        { label: "Active Nodes", value: "50k+", icon: Zap },
                        { label: "Daily Predictions", value: "10M+", icon: Users },
                        { label: "Security Score", value: "100%", icon: ShieldCheck },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-transform duration-500"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20">
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">{stat.value}</div>
                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                .animate-marquee {
                    animation: marquee 80s linear infinite;
                }
                .animate-marquee-reverse {
                    animation: marquee-reverse 80s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-reverse {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </section>
    );
};
