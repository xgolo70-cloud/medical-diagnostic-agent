import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Wifi, Server, BrainCircuit, Zap } from 'lucide-react';

const steps = [
    {
        icon: Wifi,
        title: "Data Ingestion",
        subtitle: "10ms Latency",
        description: "High-frequency sensor data streams via MQTT/CoAP directly to our edge gateways.",
    },
    {
        icon: Server,
        title: "Edge Processing",
        subtitle: "Local Compute",
        description: "Data is normalized, filtered, and encrypted locally before leaving the secure perimeter.",
    },
    {
        icon: BrainCircuit,
        title: "Neural Inference",
        subtitle: "MedGemma AI",
        description: "Clinical models analyze patterns and detect anomalies in real-time with 99.9% accuracy.",
    },
    {
        icon: Zap,
        title: "Automated Response",
        subtitle: "< 50ms Reaction",
        description: "System triggers immediate alerts and adjusts device parameters autonomously.",
    }
];

export const InteractiveWorkflow = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section ref={containerRef} className="py-16 relative bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-24">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600 mb-6">
                         <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-25"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                        </span>
                        End-to-End Pipeline
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
                        Intelligent Data Flow.
                        <br />
                        <span className="text-gray-400">Zero Friction.</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl text-lg leading-relaxed">
                        A fully automated pipeline that transforms raw sensor inputs into 
                        actionable clinical insights in milliseconds.
                    </p>
                </div>

                <div className="relative">
                    {/* Central Line - Base */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gray-100 md:-translate-x-1/2" />
                    
                    {/* Central Line - Active Progress */}
                    <motion.div 
                        className="absolute left-8 md:left-1/2 top-0 w-px bg-black z-10 md:-translate-x-1/2 origin-top"
                        style={{ height: "100%", scaleY }}
                    />
                    
                     {/* Moving Data Packet - The Delight Element */}
                     <motion.div
                        className="absolute left-8 md:left-1/2 w-1.5 h-6 bg-gradient-to-b from-transparent via-blue-500 to-transparent z-20 md:-translate-x-[2px] rounded-full blur-[1px]"
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    />
                     <motion.div
                        className="absolute left-8 md:left-1/2 w-1 h-3 bg-blue-400 z-20 md:-translate-x-1/2 rounded-full"
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    />

                    <div className="space-y-32 relative z-20 pt-16">
                        {steps.map((step, index) => (
                            <WorkflowStep 
                                key={index} 
                                step={step} 
                                index={index} 
                                isEven={index % 2 === 0}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

interface StepType {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    subtitle: string;
    description: string;
}

const WorkflowStep = ({ step, index, isEven }: { step: StepType, index: number, isEven: boolean }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    });
    
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
    const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]); // More dramatic entry
    const activeState = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
    
    // Tilt Effect Logic
    const x = useMotionValue(0);
    const yRotate = useMotionValue(0);
    const rotateX = useTransform(yRotate, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    return (
        <motion.div 
            ref={ref}
            style={{ opacity, y }}
            className={`flex flex-col md:flex-row items-center gap-16 ${isEven ? 'md:flex-row-reverse' : ''}`}
        >
            {/* Content Card with Tilt */}
            <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'} pl-16 md:pl-0 [perspective:1000px]`}>
                <motion.div 
                    className={`group relative inline-block max-w-lg w-full transition-all duration-300 ${isEven ? 'mr-auto md:ml-auto md:mr-0' : ''}`}
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const width = rect.width;
                        const height = rect.height;
                        const mouseX = e.clientX - rect.left;
                        const mouseY = e.clientY - rect.top;
                        const xPct = mouseX / width - 0.5;
                        const yPct = mouseY / height - 0.5;
                        x.set(xPct * 100);
                        yRotate.set(yPct * 100);
                    }}
                    onMouseLeave={() => {
                        x.set(0);
                        yRotate.set(0);
                    }}
                    style={{ rotateX, rotateY, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                     {/* Magic Hover Card Background */}
                     <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-xl shadow-black/5 -z-10 border border-gray-100 transform scale-105" />

                    {/* Number Badge */}
                    <div className={`text-[140px] leading-none font-bold text-gray-50/80 absolute -top-16 -z-20 select-none transition-colors duration-500 group-hover:text-blue-50/50 ${isEven ? '-right-10' : '-left-10'}`}>
                        0{index + 1}
                    </div>

                    <div className="relative z-10 p-6 rounded-2xl border border-transparent group-hover:border-gray-100 transition-colors">
                        <div className={`flex items-center gap-4 mb-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                             <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{step.title}</h3>
                             <span className={`px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-600 uppercase tracking-widest ${isEven ? 'order-last' : ''}`}>
                                {step.subtitle}
                             </span>
                        </div>
                        <p className="text-gray-500 leading-relaxed text-base font-medium">
                            {step.description}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Central Node */}
            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                <motion.div 
                    className="relative z-10 w-16 h-16 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center transition-colors duration-500"
                    style={{
                        borderColor: useTransform(activeState, [0, 1], ["#f9fafb", "#ffffff"]),
                        backgroundColor: useTransform(activeState, [0, 1], ["#ffffff", "#000000"]),
                        boxShadow: useTransform(activeState, [0, 1], ["0 1px 2px 0 rgba(0, 0, 0, 0.05)", "0 10px 25px -5px rgba(0, 0, 0, 0.3)"]),
                    }}
                >
                    {/* Active Icon (White) */}
                    <motion.div style={{ opacity: activeState }} className="absolute inset-0 flex items-center justify-center">
                         <step.icon size={24} className="text-white" />
                    </motion.div>
                     {/* Inactive Icon (Gray) */}
                    <motion.div style={{ opacity: useTransform(activeState, [0, 1], [1, 0]) }} className="absolute inset-0 flex items-center justify-center">
                         <step.icon size={24} className="text-gray-300" />
                    </motion.div>
                </motion.div>
            </div>

            <div className="flex-1 hidden md:block" />
        </motion.div>
    );
};

