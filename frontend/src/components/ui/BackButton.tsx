import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BackButtonProps {
    to?: string;
    label?: string;
    className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
    to, 
    label = 'Back',
    className 
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'group flex items-center gap-2 px-2 py-1 rounded-md',
                'text-[#666666] hover:text-[#171717] transition-all duration-200',
                'hover:bg-[#fafafa] active:scale-95',
                className
            )}
        >
            <ArrowLeft 
                size={14} 
                className="transition-transform group-hover:-translate-x-0.5" 
            />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
};

export default BackButton;
