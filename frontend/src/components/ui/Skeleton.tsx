import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className,
    variant = 'text',
    width,
    height,
    animation = 'pulse',
}) => {
    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: '',
        rounded: 'rounded-xl',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
    };

    return (
        <div
            className={cn(
                'bg-slate-700/50',
                variantClasses[variant],
                animationClasses[animation],
                className
            )}
            style={{
                width: width,
                height: height,
            }}
        />
    );
};

// Preset skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
    lines = 3,
    className,
}) => (
    <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                variant="text"
                width={i === lines - 1 ? '60%' : '100%'}
            />
        ))}
    </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
    <div className={cn('p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50', className)}>
        <div className="flex items-start justify-between mb-4">
            <Skeleton variant="rounded" width={48} height={48} />
            <Skeleton variant="rounded" width={60} height={24} />
        </div>
        <Skeleton variant="text" width="40%" height={32} className="mb-2" />
        <Skeleton variant="text" width="60%" height={16} />
    </div>
);

export default Skeleton;
