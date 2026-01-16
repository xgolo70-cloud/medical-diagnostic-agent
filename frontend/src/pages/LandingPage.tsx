import { motion, useScroll, useSpring } from 'framer-motion';
import { SiteHeader } from '../components/landing/SiteHeader';
import { HeroSection } from '../components/landing/HeroSection';
import { TrustedBy } from '../components/landing/TrustedBy';
import { BentoFeatures } from '../components/landing/BentoFeatures';
import { InteractiveWorkflow } from '../components/landing/InteractiveWorkflow';
import { Testimonials } from '../components/landing/Testimonials';
import { Pricing } from '../components/landing/Pricing';
import { SiteFooter } from '../components/landing/SiteFooter';

export const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden selection:bg-black selection:text-white">
            
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-black origin-left z-[100]"
                style={{ scaleX }}
            />

            {/* Smart Header */}
            <SiteHeader />

            {/* Main Content */}
            <main className="relative z-10 pt-16">
                <HeroSection />
                <TrustedBy />
                <div id="features" className="scroll-mt-32">
                    <BentoFeatures />
                </div>
                <div id="workflow" className="scroll-mt-32">
                    <InteractiveWorkflow />
                </div>
                <div id="testimonials" className="scroll-mt-32">
                    <Testimonials />
                </div>
                <Pricing />
            </main>

            <SiteFooter />
        </div>
    );
};
