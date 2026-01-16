import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useMemo } from 'react';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Ease constants for consistent feel
export const EASING = {
    smooth: "power3.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.3)",
    soft: "power2.out"
};

/**
 * A hook to safely use GSAP with React's lifecycle.
 * Automatically cleans up the context on unmount.
 */
export const useGsapContext = (scope: React.RefObject<HTMLDivElement | HTMLElement | null>) => {
    const ctx = useMemo(() => gsap.context(() => { }, scope), [scope]);

    useEffect(() => {
        return () => ctx.revert();
    }, [ctx]);

    return ctx;
};

// Reusable standard animations
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
