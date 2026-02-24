import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useMemo } from 'react';
import type { Variants, Transition } from 'framer-motion';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// GSAP Utilities (legacy)
// ==========================================

export const EASING = {
    smooth: "power3.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.3)",
    soft: "power2.out"
};

export const useGsapContext = (scope: React.RefObject<HTMLDivElement | HTMLElement | null>) => {
    const ctx = useMemo(() => gsap.context(() => { }, scope), [scope]);

    useEffect(() => {
        return () => ctx.revert();
    }, [ctx]);

    return ctx;
};

export const fadeIn = (element: string | Element, delay = 0) => {
    gsap.fromTo(element,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.8, delay, ease: EASING.smooth }
    );
};

export const staggerChildren = (parent: string | Element, childSelector: string, staggerTime = 0.1) => {
    gsap.fromTo(gsap.utils.selector(parent)(childSelector),
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: staggerTime, ease: EASING.smooth }
    );
};

// ==========================================
// Framer Motion Shared Variants
// ==========================================

/** Spring transition preset — snappy, organic feel */
export const spring: Transition = {
    type: 'spring',
    stiffness: 280,
    damping: 24,
    mass: 0.8,
};

/** Softer spring for larger elements */
export const gentleSpring: Transition = {
    type: 'spring',
    stiffness: 180,
    damping: 20,
    mass: 1,
};

/** Quick ease for exits */
export const quickEase: Transition = {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.2,
};

// ---- Container / Stagger ----

/** Stagger container — wraps children that use `fadeSlideUp` or similar child variants */
export const staggerContainer: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

/** Stagger with slightly more delay — for sections that appear later */
export const staggerContainerSlow: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

// ---- Child Items ----

/** Fade + slide up — the go-to child animation */
export const fadeSlideUp: Variants = {
    hidden: {
        opacity: 0,
        y: 16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: spring,
    },
};

/** Scale in — for modal/card reveals */
export const scaleIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.92,
        y: 8,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: spring,
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        y: -4,
        transition: quickEase,
    },
};

/** Slide in from right — for sidebars, panels */
export const slideInRight: Variants = {
    hidden: {
        opacity: 0,
        x: 24,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: spring,
    },
};

/** Slide in from left */
export const slideInLeft: Variants = {
    hidden: {
        opacity: 0,
        x: -24,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: spring,
    },
};

/** Pop in — for badges, tooltips, small elements */
export const popIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 15,
        },
    },
};

/** Dropdown — for menus appearing below a trigger */
export const dropdown: Variants = {
    hidden: {
        opacity: 0,
        y: -8,
        scale: 0.96,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
    exit: {
        opacity: 0,
        y: -6,
        scale: 0.97,
        transition: quickEase,
    },
};

/** Modal overlay — for backdrop animations */
export const overlay: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 },
    },
};
