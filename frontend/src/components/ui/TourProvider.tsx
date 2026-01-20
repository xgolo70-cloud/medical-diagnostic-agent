import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Lightbulb } from 'lucide-react';
import type { TourStep, TourContextType } from './tourConfig';
import { TOUR_COMPLETED_KEY, TOUR_SKIPPED_KEY } from './tourConfig';

// ==================== Context ====================

const TourContext = createContext<TourContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};

// ==================== Helper Functions ====================

const getElementPosition = (selector: string) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        viewportTop: rect.top,
        viewportLeft: rect.left,
    };
};

// ==================== Tooltip Component ====================

interface TooltipProps {
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    onFinish: () => void;
}

const TourTooltip: React.FC<TooltipProps> = ({
    step,
    stepIndex,
    totalSteps,
    onNext,
    onPrev,
    onSkip,
    onFinish,
}) => {
    const [position, setPosition] = useState({ top: 0, left: 0, arrowPosition: 'top' as string });
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === totalSteps - 1;

    useEffect(() => {
        const updatePosition = () => {
            const pos = getElementPosition(step.target);
            if (pos) {
                const placement = step.placement || 'bottom';
                const tooltipWidth = 380;
                const tooltipHeight = 220;
                const padding = 16;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                let top = 0;
                let left = 0;
                const arrowPosition = placement;

                switch (placement) {
                    case 'bottom':
                        top = pos.top + pos.height + padding;
                        left = pos.centerX - tooltipWidth / 2;
                        break;
                    case 'top':
                        top = pos.top - tooltipHeight - padding;
                        left = pos.centerX - tooltipWidth / 2;
                        break;
                    case 'left':
                        top = pos.top + pos.height / 2 - tooltipHeight / 2;
                        left = pos.left - tooltipWidth - padding;
                        break;
                    case 'right':
                        top = pos.top + pos.height / 2 - tooltipHeight / 2;
                        left = pos.left + pos.width + padding;
                        break;
                }

                // Keep tooltip within viewport
                left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
                top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16 + window.scrollY));

                setPosition({ top, left, arrowPosition });

                // Scroll element into view smoothly
                const element = document.querySelector(step.target);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        // Delay to allow for any animations
        const timer = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [step]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onSkip();
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                if (isLast) {
                    onFinish();
                } else {
                    onNext();
                }
            }
            if (e.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNext, onPrev, onSkip, onFinish, isLast]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed z-[10001] w-[380px]"
            style={{ top: position.top, left: position.left }}
            role="dialog"
            aria-label={`خطوة ${stepIndex + 1} من ${totalSteps}`}
        >
            {/* Main Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                
                {/* Header */}
                <div className="relative px-6 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                initial={{ rotate: -10 }}
                                animate={{ rotate: 0 }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg"
                            >
                                {step.icon || <Lightbulb className="text-white" size={20} />}
                            </motion.div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {step.title}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    الخطوة {stepIndex + 1} من {totalSteps}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onSkip}
                            className="p-2 -mr-2 -mt-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            aria-label="تخطي الجولة"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6">
                    <div className="flex gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`h-1 flex-1 rounded-full origin-left transition-colors duration-300 ${
                                    i < stepIndex 
                                        ? 'bg-green-500' 
                                        : i === stepIndex 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                                            : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-sm leading-relaxed"
                        style={{ direction: 'rtl' }}
                    >
                        {step.content}
                    </motion.p>
                </div>

                {/* Footer with Actions */}
                <div className="px-6 pb-5 pt-2 flex items-center justify-between">
                    <button
                        onClick={onSkip}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline-offset-2 hover:underline"
                    >
                        تخطي الجولة
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {!isFirst && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onPrev}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                            >
                                <ChevronRight size={16} />
                                السابق
                            </motion.button>
                        )}
                        
                        {isLast ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onFinish}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all"
                            >
                                <Check size={16} />
                                إنهاء الجولة
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onNext}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 transition-all"
                            >
                                التالي
                                <ChevronLeft size={16} />
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            {/* Keyboard hint */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-3 gap-2 text-[10px] text-white/60"
            >
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">→</kbd>
                <span>للتنقل</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd>
                <span>للإغلاق</span>
            </motion.div>
        </motion.div>
    );
};

// ==================== Spotlight Component ====================

const TourSpotlight: React.FC<{ target: string }> = ({ target }) => {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updatePosition = () => {
            const pos = getElementPosition(target);
            if (pos) {
                setPosition({
                    top: pos.top - 12,
                    left: pos.left - 12,
                    width: pos.width + 24,
                    height: pos.height + 24,
                });
                setIsVisible(true);
            }
        };

        const timer = setTimeout(updatePosition, 50);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        };
    }, [target]);

    return (
        <>
            {/* Animated Overlay */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[2px]" 
            />
            
            {/* Spotlight with Glow Effect */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed z-[10000] pointer-events-none"
                        style={{
                            top: position.top,
                            left: position.left,
                            width: position.width,
                            height: position.height,
                        }}
                    >
                        {/* Outer Glow */}
                        <div 
                            className="absolute inset-0 rounded-2xl"
                            style={{
                                boxShadow: `
                                    0 0 0 9999px rgba(0, 0, 0, 0.6),
                                    0 0 40px 8px rgba(59, 130, 246, 0.3),
                                    0 0 80px 16px rgba(147, 51, 234, 0.2),
                                    inset 0 0 20px rgba(255, 255, 255, 0.1)
                                `,
                            }}
                        />
                        
                        {/* Animated Border */}
                        <motion.div
                            animate={{ 
                                boxShadow: [
                                    '0 0 0 3px rgba(255, 255, 255, 0.6)',
                                    '0 0 0 6px rgba(255, 255, 255, 0.3)',
                                    '0 0 0 3px rgba(255, 255, 255, 0.6)',
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0 rounded-2xl"
                        />
                        
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-lg" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ==================== Provider Component ====================

interface TourProviderProps {
    children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>([]);

    const startTour = useCallback((tourSteps: TourStep[]) => {
        setSteps(tourSteps);
        setCurrentStep(0);
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    }, []);

    const endTour = useCallback(() => {
        setIsOpen(false);
        setCurrentStep(0);
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        document.body.style.overflow = '';
    }, []);

    const skipTour = useCallback(() => {
        setIsOpen(false);
        setCurrentStep(0);
        localStorage.setItem(TOUR_SKIPPED_KEY, 'true');
        document.body.style.overflow = '';
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, steps.length]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const contextValue: TourContextType = {
        isOpen,
        currentStep,
        steps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
    };

    return (
        <TourContext.Provider value={contextValue}>
            {children}
            
            <AnimatePresence>
                {isOpen && steps.length > 0 && (
                    <>
                        <TourSpotlight target={steps[currentStep].target} />
                        <TourTooltip
                            step={steps[currentStep]}
                            stepIndex={currentStep}
                            totalSteps={steps.length}
                            onNext={nextStep}
                            onPrev={prevStep}
                            onSkip={skipTour}
                            onFinish={endTour}
                        />
                    </>
                )}
            </AnimatePresence>
        </TourContext.Provider>
    );
};

// ==================== Utility Hook ====================

// eslint-disable-next-line react-refresh/only-export-components
export const useAutoStartTour = (tourSteps: TourStep[], delay: number = 1500) => {
    const { startTour } = useTour();

    useEffect(() => {
        const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
        const skipped = localStorage.getItem(TOUR_SKIPPED_KEY);

        if (!completed && !skipped) {
            const timer = setTimeout(() => {
                startTour(tourSteps);
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [startTour, tourSteps, delay]);
};

export default TourProvider;
