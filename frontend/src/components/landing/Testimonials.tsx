import { motion } from 'framer-motion';
import { Quote, Star, Sparkles } from 'lucide-react';

const reviews = [
    {
        text: "AI & Things revolutionized our remote patient monitoring. We've reduced false alerts by 85% and improved response times dramatically.",
        author: "Dr. Sarah Chen",
        role: "Chief Medical Officer",
        company: "CardioPulse",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5,
        highlight: true
    },
    {
        text: "The latency is incredible. It feels like the AI is running directly on the sensor. Game-changing technology.",
        author: "James Wilson",
        role: "VP of Engineering",
        company: "MedTech Solutions",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5
    },
    {
        text: "Compliance was our biggest headache. This platform solved it completely out of the box.",
        author: "Elena Rodriguez",
        role: "Head of Security",
        company: "HealthFirst",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5
    },
    {
        text: "We've processed over 2 million patient readings with zero downtime. Incredible reliability.",
        author: "Dr. Michael Park",
        role: "Head of Digital Health",
        company: "Metro Hospital",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5,
        highlight: true
    },
    {
        text: "The integration with our existing EHR systems was seamless. Our team was up and running in days.",
        author: "Lisa Martinez",
        role: "CTO",
        company: "CareConnect",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5
    },
    {
        text: "Finally, an edge AI solution that actually delivers on its promises. Highly recommended.",
        author: "David Kim",
        role: "Lead Architect",
        company: "BiometricsPlus",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100&h=100",
        stars: 5
    },
];

const ReviewCard = ({ review, index }: { review: typeof reviews[0], index: number }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className={`
            flex-shrink-0 w-[340px] p-6 rounded-2xl mx-3 transition-all duration-300
            ${review.highlight 
                ? 'bg-black text-white shadow-2xl shadow-black/20' 
                : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl'
            }
        `}
    >
        {/* Stars */}
        <div className="flex gap-0.5 mb-4">
            {[...Array(review.stars)].map((_, i) => (
                <Star 
                    key={i} 
                    className={`w-4 h-4 ${review.highlight ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-500 fill-yellow-500'}`} 
                />
            ))}
        </div>

        {/* Quote */}
        <p className={`text-[15px] leading-relaxed mb-6 ${review.highlight ? 'text-white/90' : 'text-gray-700'}`}>
            "{review.text}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3">
            <img 
                src={review.avatar} 
                alt={review.author} 
                className={`w-10 h-10 rounded-full object-cover ${review.highlight ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-50'}`}
            />
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${review.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {review.author}
                </div>
                <div className={`text-xs truncate ${review.highlight ? 'text-white/60' : 'text-gray-500'}`}>
                    {review.role} · {review.company}
                </div>
            </div>
        </div>
    </motion.div>
);

export const Testimonials = () => {
    const duplicatedReviews = [...reviews, ...reviews, ...reviews];

    return (
        <section className="py-28 relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium mb-6"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Customer Stories</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 tracking-tight"
                    >
                        Loved by teams
                        <br />
                        <span className="text-gray-400">worldwide</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 text-lg max-w-xl mx-auto"
                    >
                        Join thousands of healthcare professionals who trust AI & Things for their critical infrastructure.
                    </motion.p>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />

                {/* Row 1 - Left */}
                <div className="relative mb-4 overflow-hidden">
                    <div 
                        className="flex py-2"
                        style={{ animation: 'marquee-left 80s linear infinite' }}
                    >
                        {duplicatedReviews.map((review, i) => (
                            <ReviewCard key={`row1-${i}`} review={review} index={i % reviews.length} />
                        ))}
                    </div>
                </div>

                {/* Row 2 - Right */}
                <div className="relative overflow-hidden">
                    <div 
                        className="flex py-2"
                        style={{ animation: 'marquee-right 80s linear infinite' }}
                    >
                        {[...duplicatedReviews].reverse().map((review, i) => (
                            <ReviewCard key={`row2-${i}`} review={review} index={i % reviews.length} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="max-w-4xl mx-auto mt-20 px-6"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-black text-white">
                    {[
                        { value: "99.9%", label: "Uptime SLA" },
                        { value: "500+", label: "Healthcare Partners" },
                        { value: "10M+", label: "Readings Processed" },
                        { value: "4.9/5", label: "Customer Rating" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <style>{`
                @keyframes marquee-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(-33.333%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </section>
    );
};
