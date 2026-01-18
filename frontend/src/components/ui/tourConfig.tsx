import React from 'react';
import { Sparkles } from 'lucide-react';

// ==================== Types ====================

export interface TourStep {
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    icon?: React.ReactNode;
}

export interface TourContextType {
    isOpen: boolean;
    currentStep: number;
    steps: TourStep[];
    startTour: (steps: TourStep[]) => void;
    endTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
}

// ==================== Storage Keys ====================

export const TOUR_COMPLETED_KEY = 'tour_completed';
export const TOUR_SKIPPED_KEY = 'tour_skipped';

// ==================== Pre-defined Tour Steps ====================

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="stats-cards"]',
        title: '📊 إحصائياتك',
        content: 'لوحة سريعة تعرض أهم الأرقام: عدد التحليلات المنجزة، دقة النموذج، وحالة النظام الحالية.',
        placement: 'bottom',
        icon: <Sparkles className="text-white" size={20} />,
    },
    {
        target: '[data-tour="quick-actions"]',
        title: '⚡ إجراءات سريعة',
        content: 'اختصارات للمهام الأكثر استخداماً - ابدأ تحليل جديد أو استعرض سجلاتك بضغطة واحدة.',
        placement: 'left',
    },
    {
        target: '[data-tour="recent-activity"]',
        title: '📋 النشاط الأخير',
        content: 'تابع آخر تحليلاتك مع حالة كل منها. اضغط على أي سجل للتفاصيل الكاملة.',
        placement: 'top',
    },
];

export const MEDAI_TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="modality-select"]',
        title: '🏥 اختر نوع الفحص',
        content: 'حدد نوع الصورة الطبية المراد تحليلها: أشعة سينية، تصوير مقطعي، رنين مغناطيسي، أو فحص جلدي.',
        placement: 'bottom',
    },
    {
        target: '[data-tour="upload-area"]',
        title: '📤 ارفع صورتك',
        content: 'اسحب وأفلت الصورة هنا أو اضغط لاختيار ملف. يدعم DICOM و PNG و JPG.',
        placement: 'top',
    },
];

// ==================== Helper Functions ====================

export const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_SKIPPED_KEY);
};
