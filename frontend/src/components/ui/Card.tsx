import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'bordered' | 'elevated';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {

        const variants = {
            default: "bg-white border border-zinc-200/60",
            bordered: "bg-white border border-zinc-200/60 hover:border-zinc-300",
            elevated: "bg-white border border-zinc-200/60 shadow-sm hover:shadow-md"
        };

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "rounded-2xl text-zinc-900 overflow-hidden transition-all",
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
