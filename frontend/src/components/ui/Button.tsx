import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    'aria-label'?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const variants = {
            primary: "bg-[#171717] hover:bg-[#404040] text-white border border-transparent",
            secondary: "bg-white border border-[#eaeaea] text-[#171717] hover:bg-[#fafafa] hover:border-[#d4d4d4]",
            ghost: "bg-transparent hover:bg-[#fafafa] text-[#666666] hover:text-[#171717]",
            outline: "bg-transparent border border-[#eaeaea] text-[#666666] hover:border-[#d4d4d4] hover:text-[#171717]",
            danger: "bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] hover:bg-[#fecaca]"
        };

        const sizes = {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-0 flex items-center justify-center"
        };

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </div>
                ) : null}
                <span className={cn(isLoading ? "opacity-0" : "opacity-100", "flex items-center gap-2")}>
                    {children as React.ReactNode}
                </span>
            </motion.button>
        );
    }
);

Button.displayName = "Button";
