import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
    children: React.ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 24,
        scale: 0.99,
        filter: 'blur(4px)',
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
    },
    out: {
        opacity: 0,
        y: -12,
        scale: 0.995,
        filter: 'blur(2px)',
    },
};

const pageTransition = {
    type: 'spring' as const,
    stiffness: 260,
    damping: 25,
    mass: 0.8,
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                style={{ willChange: 'transform, opacity, filter' }}
                onAnimationComplete={() => {
                    // Clean up will-change after animation
                    const el = document.querySelector('[data-page-transition]');
                    if (el instanceof HTMLElement) {
                        el.style.willChange = 'auto';
                    }
                }}
                data-page-transition
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;
