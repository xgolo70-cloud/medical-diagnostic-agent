import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticProps {
    children: React.ReactElement;
    intensity?: number; // 0.1 to 1, default 0.3
}

export const Magnetic: React.FC<MagneticProps> = ({ children, intensity = 0.3 }) => {
    const triggerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const trigger = triggerRef.current;
        // The child is the target, we need to clone it to attach ref or wrap it.
        // For simplicity in this implementation, we assume the child is a single element 
        // that receives the ref or we wrap it in a div that moves. 
        // Actually, let's move the trigger itself which wraps the children.

        if (!trigger) return;

        const xTo = gsap.quickTo(trigger, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(trigger, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = trigger.getBoundingClientRect();

            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);

            xTo(x * intensity);
            yTo(y * intensity);
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
        };

        trigger.addEventListener("mousemove", handleMouseMove);
        trigger.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            trigger.removeEventListener("mousemove", handleMouseMove);
            trigger.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [intensity]);

    // We wrap children in a div that acts as the magnetic container
    return (
        <div ref={triggerRef} className="inline-block cursor-pointer">
            {children}
        </div>
    );
};
