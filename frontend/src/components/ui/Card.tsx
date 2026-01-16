import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'bordered' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {

        const variants = {
            default: "bg-white border border-[#eaeaea]",
            bordered: "bg-white border border-[#eaeaea] hover:border-[#d4d4d4]",
            elevated: "bg-white border border-[#eaeaea] shadow-sm hover:shadow-md"
        };

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "rounded-md text-[#171717] overflow-hidden transition-all",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";
