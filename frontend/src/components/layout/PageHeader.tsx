import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface Breadcrumb {
    label: string;
    path?: string;
}

interface PageHeaderProps {
    /** Page title */
    title: string;
    /** Icon rendered before the title */
    icon?: React.ReactNode;
    /** Optional subtitle / breadcrumb text shown after the title */
    subtitle?: string;
    /** Breadcrumb trail (optional — shown between back button and title) */
    breadcrumbs?: Breadcrumb[];
    /** Whether to show a back button */
    showBack?: boolean;
    /** Right-side action buttons */
    actions?: React.ReactNode;
    /** Optional status badge rendered inline with the title */
    badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    icon,
    subtitle,
    breadcrumbs,
    showBack = true,
    actions,
    badge,
}) => {
    const navigate = useNavigate();

    return (
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
                {/* Left side: back + icon + title + breadcrumbs */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {showBack && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(-1)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={18} strokeWidth={2} />
                        </motion.button>
                    )}

                    {showBack && (
                        <div className="w-px h-5 bg-gray-200 shrink-0 hidden sm:block" />
                    )}

                    {icon && (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                            {icon}
                        </div>
                    )}

                    <div className="flex items-center gap-2 min-w-0">
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight truncate">
                            {title}
                        </h1>

                        {badge && badge}

                        {subtitle && (
                            <>
                                <span className="text-gray-300 hidden sm:inline">/</span>
                                <span className="text-xs sm:text-sm text-gray-500 font-medium hidden sm:inline truncate">
                                    {subtitle}
                                </span>
                            </>
                        )}

                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1.5">
                                {breadcrumbs.map((crumb, i) => (
                                    <React.Fragment key={i}>
                                        <span className="text-gray-300">/</span>
                                        {crumb.path ? (
                                            <button
                                                onClick={() => navigate(crumb.path!)}
                                                className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors truncate"
                                            >
                                                {crumb.label}
                                            </button>
                                        ) : (
                                            <span className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                                                {crumb.label}
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: action buttons */}
                {actions && (
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
};

export default PageHeader;
