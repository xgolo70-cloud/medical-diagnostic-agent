import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Activity, Shield, Globe, Lock, Cpu, Network, Zap } from 'lucide-react';

const features = [
    {
        icon: Activity,
        title: "Real-time Processing",
        description: "Sub-millisecond latency analysis on edge devices with local GPU acceleration.",
        size: "large",
        metric: "< 1ms Latency"
    },
    {
        icon: Shield,
        title: "HIPAA Ready",
        description: "End-to-end encryption & compliance baked into every transaction.",
        size: "medium",
    },
    {
        icon: Globe,
        title: "Global Edge",
        description: "Deploy to 200+ edge locations instantly.",
        size: "medium",
    },
    {
        icon: Cpu,
        title: "Local Edge Models",
        description: "Run MedGemma 2B/7B directly on-device without cloud dependency.",
        size: "long",
    },
    {
        icon: Network,
        title: "Swarm Mesh",
        description: "Devices coordinate locally to solve complex diagnostics without central servers.",
        size: "medium",
    },
    {
        icon: Lock,
        title: "Zero Trust Architecture",
        description: "Identity-based security principles hooked into every request, ensuring medical-grade data privacy.",
        size: "full",
    },
];

// ECG Waveform Component - Clean Light Mode
const ECGWaveform = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* ECG Line */}
            <svg 
                className="w-full h-full" 
                viewBox="0 0 600 80" 
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Main gradient - subtle black/gray */}
                    <linearGradient id="ecgGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#171717" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="#171717" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#171717" stopOpacity="0.1" />
                    </linearGradient>
                    
                    {/* Subtle shadow filter */}
                    <filter id="ecgShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1" result="blur"/>
                        <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Background grid - very subtle */}
                <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#lightGrid)" />
                
                {/* Baseline reference */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="2 6" />
                
                {/* Main ECG path */}
                <motion.path
                    d="M0,40 C30,40 50,40 70,40 L90,40 L100,38 L105,42 L110,30 L115,50 L120,12 L125,68 L130,30 L140,40 C160,40 190,40 220,40 L240,40 L250,38 L255,42 L260,30 L265,50 L270,12 L275,68 L280,30 L290,40 C310,40 340,40 370,40 L390,40 L400,38 L405,42 L410,30 L415,50 L420,12 L425,68 L430,30 L440,40 C460,40 490,40 520,40 L540,40 L550,38 L555,42 L560,30 L565,50 L570,12 L575,68 L580,30 L590,40 L600,40"
                    stroke="url(#ecgGradientLight)"
                    strokeWidth="2"
                    fill="none"
                    filter="url(#ecgShadow)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ 
                        pathLength: { duration: 2.5, ease: "easeOut" },
                        opacity: { duration: 0.8 }
                    }}
                />
                
                {/* Scanning indicator */}
                <motion.rect
                    x="0"
                    y="0"
                    width="3"
                    height="80"
                    fill="#171717"
                    opacity="0.15"
                    animate={{ x: [-3, 600] }}
                    transition={{ 
                        duration: 6, 
                        repeat: Infinity, 
                        ease: "linear",
                        repeatDelay: 1
                    }}
                />
            </svg>
        </div>
    );
};

// Live Stats Component - Clean Light Mode
const LiveStats = () => {
    const [latency, setLatency] = useState(0.3);

    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(Number((0.2 + Math.random() * 0.5).toFixed(1)));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute top-2 right-2 flex items-center gap-3">
            {/* Latency indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-200 shadow-sm">
                <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[10px] font-mono font-medium text-gray-900">{latency}ms</span>
            </div>
            {/* Status */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
                <Activity className="w-3 h-3 text-gray-600" />
                <span className="text-[10px] font-medium text-gray-600">Active</span>
            </div>
        </div>
    );
};

// Processing status messages - Clean Light Mode
const processingStatuses = [
    { text: "Analyzing...", color: "text-gray-600" },
    { text: "Processing", color: "text-gray-700" },
    { text: "Complete", color: "text-gray-900" },
];

// Processing Status Component - Clean Light Mode
const ProcessingStatus = () => {
    const [status, setStatus] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(s => (s + 1) % processingStatuses.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute bottom-2 left-2 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white border border-gray-200 shadow-sm">
            <motion.div 
                className="w-1.5 h-1.5 rounded-full bg-gray-900"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className={`text-[10px] font-medium ${processingStatuses[status].color}`}>
                {processingStatuses[status].text}
            </span>
        </div>
    );
};

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const spanClass = feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : 
                      feature.size === 'long' ? 'md:col-span-2' : 
                      feature.size === 'full' ? 'md:col-span-3' : '';

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group relative bg-white rounded-xl overflow-hidden ${spanClass}`}
            onMouseMove={handleMouseMove}
        >
            {/* Border Beam Effect - Enhanced for large card */}
            <div className="absolute inset-0 z-0 rounded-xl overflow-hidden pointer-events-none">
                 <motion.div 
                    className={`absolute top-0 left-0 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                        feature.size === 'large' 
                            ? 'bg-[conic-gradient(from_0deg,transparent_0_320deg,#10b981_340deg,#06b6d4_360deg)]' 
                            : 'bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(0,0,0,0.8)_360deg)]'
                    }`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 />
            </div>
            
            {/* Masking Background */}
            <div className="absolute inset-[1px] bg-white rounded-[10px] z-0" />
            
            {/* Default Light Border - Gradient for large card */}
            <div className={`absolute inset-0 rounded-xl border pointer-events-none z-10 ${
                feature.size === 'large' 
                    ? 'border-emerald-200/50 group-hover:border-cyan-300/50 transition-colors duration-300' 
                    : 'border-gray-200'
            }`} />

            {/* Spotlight Effect (Internal) */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300 z-10"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            600px circle at ${mouseX}px ${mouseY}px,
                            ${feature.size === 'large' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 0, 0, 0.03)'},
                            transparent 80%
                        )
                    `
                }}
            />

            {/* Content Container */}
            <div className="relative h-full flex flex-col p-6 z-20">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-black transition-all duration-300 shadow-sm">
                        <feature.icon className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                    </div>
                    
                    {/* Metric Badge - Consistent style for all cards */}
                    {feature.metric && (
                        <div className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-200 text-xs font-mono font-medium text-gray-700">
                            {feature.metric}
                        </div>
                    )}
                </div>

                <div className={`${feature.size === 'large' ? 'mt-4' : 'mt-auto mb-4'} ${feature.size === 'full' ? 'max-w-xl' : ''}`}>
                     <h3 className="text-lg font-bold mb-1 tracking-tight text-gray-900">{feature.title}</h3>
                     <p className="text-gray-500 text-sm leading-relaxed max-w-sm">{feature.description}</p>
                </div>

                {/* Visual Elements for Large Cards - Clean Light Mode */}
                {feature.size === 'large' && (
                    <div className="relative w-full h-28 mt-2 rounded-lg bg-gray-50 overflow-hidden border border-gray-200">
                        {/* ECG Waveform */}
                        <ECGWaveform />
                        
                        {/* Live Stats */}
                        <LiveStats />
                        
                        {/* Processing Status */}
                        <ProcessingStatus />
                    </div>
                )}

                {feature.size === 'long' && (
                    <div className="absolute right-6 top-6 bottom-6 hidden md:flex flex-col justify-center gap-2 border-l border-gray-100 pl-6 w-1/3">
                         <div className="flex items-center gap-2 text-xs text-gray-500">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             MedGemma-7B Loaded
                         </div>
                         <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-black h-full w-2/3 rounded-full" />
                         </div>
                         <div className="text-[10px] text-gray-400 font-mono flex justify-between">
                            <span>VRAM Usage</span>
                            <span>4.2GB</span>
                         </div>
                    </div>
                )}

                {feature.size === 'full' && (
                    <div className="absolute top-6 right-6 bottom-6 w-[400px] hidden lg:block bg-[#0a0a0a] rounded-lg border border-gray-800 overflow-hidden font-mono text-[10px] text-gray-400 p-4">
                        <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                             <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                             </div>
                             <span className="text-xs text-gray-500">security_guard.sh</span>
                        </div>
                        <div className="space-y-1.5 opacity-80">
                            <div className="flex justify-between text-green-500/80">
                                <span>[INFO] Validating handshake...</span>
                                <span>2ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span>[AUTH] Device ID: 8f92-a1b2</span>
                                <span className="text-green-500">VERIFIED</span>
                            </div>
                            <div className="flex justify-between">
                                <span>[ENCR] E2EE Tunnel Established</span>
                                <span className="text-blue-400">AES-256</span>
                            </div>
                             <div className="flex justify-between text-gray-600">
                                <span>[LOG] Packet inspection complete</span>
                                <span>OK</span>
                            </div>
                            <motion.div 
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="h-3 w-1.5 bg-green-500 mt-2"
                            />
                        </div>
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const BentoFeatures = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section ref={sectionRef} className="py-16 relative bg-white">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
                >
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600 mb-6">
                            <Zap className="w-3.5 h-3.5 text-black fill-black" />
                            <span>Core Technologies</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                            Engineered for the
                            <br />
                            <span className="text-gray-400">Intelligent Edge.</span>
                        </h2>
                    </div>
                    <p className="text-lg text-gray-500 max-w-sm leading-relaxed pb-2">
                        A unified platform designed for the complexity of modern healthcare IoT ecosystems.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] gap-4">
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={index} 
                            feature={feature} 
                            index={index} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
