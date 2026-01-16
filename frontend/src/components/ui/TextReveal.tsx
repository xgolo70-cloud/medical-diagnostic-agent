import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '../../lib/utils';


interface TextRevealProps {
    children: string;
    className?: string;
    delay?: number;
    stagger?: number;
    trigger?: boolean; // If true, uses ScrollTrigger
}

export const TextReveal: React.FC<TextRevealProps> = ({
    children,
    className,
    delay = 0,
    stagger = 0.03,
    trigger = true
}) => {
    const el = useRef<HTMLDivElement>(null);
    const chars = children.split('');

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const charElements = gsap.utils.selector(el.current)('.char');

            const animation = gsap.fromTo(charElements,
                {
                    y: "100%",
                    opacity: 0
                },
                {
                    y: "0%",
                    opacity: 1,
                    duration: 1,
                    ease: "power4.out",
                    stagger: stagger,
                    paused: true,
                    delay: delay
                }
            );

            if (trigger) {
                ScrollTrigger.create({
                    trigger: el.current,
                    start: "top 80%",
                    onEnter: () => animation.play(),
                });
            } else {
                animation.play();
            }

        }, el);

        return () => ctx.revert();
    }, [children, delay, stagger, trigger]);

    return (
        <div ref={el} className={cn("relative overflow-hidden inline-flex flex-wrap leading-tight", className)}>
            <span className="sr-only">{children}</span>
            {chars.map((char, i) => (
                <span key={i} className="char inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
                    {char}
                </span>
            ))}
        </div>
    );
};
