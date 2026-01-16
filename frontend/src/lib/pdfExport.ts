/**
 * PDF Export Utility
 * Uses jspdf and html2canvas to generate PDF reports from DOM elements
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ==================== Types ====================

export interface PDFExportOptions {
    title?: string;
    subtitle?: string;
    filename?: string;
    orientation?: 'portrait' | 'landscape';
    format?: 'a4' | 'letter';
    margin?: number;
}

export interface DiagnosisReportData {
    patientId?: string;
    modality: string;
    analysis: string;
    findings: string[];
    recommendations: string[];
    date: string;
    processingTime?: string;
}

// ==================== Helper Functions ====================

const formatDate = (date: Date = new Date()): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

// ==================== PDF Export Functions ====================

/**
 * Export a DOM element to PDF
 */
export const exportElementToPDF = async (
    element: HTMLElement,
    options: PDFExportOptions = {}
): Promise<void> => {
    const {
        title = 'Medical Report',
        filename = 'report.pdf',
        orientation = 'portrait',
        format = 'a4',
        margin = 20,
    } = options;

    try {
        // Capture the element as canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        // Create PDF
        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format,
        });

        const imgData = canvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add header
        pdf.setFontSize(18);
        pdf.setTextColor(23, 23, 23);
        pdf.text(title, margin, margin);

        // Add date
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(formatDate(), margin, margin + 8);

        // Add image content
        const yOffset = margin + 15;
        
        if (imgHeight > pageHeight - yOffset - margin) {
            // Split across pages if needed
            let remainingHeight = imgHeight;
            let currentY = 0;
            
            while (remainingHeight > 0) {
                const availableHeight = pdf.internal.pageSize.getHeight() - (currentY === 0 ? yOffset : margin) - margin;
                const sliceHeight = Math.min(remainingHeight, availableHeight);
                
                pdf.addImage(
                    imgData,
                    'PNG',
                    margin,
                    currentY === 0 ? yOffset : margin,
                    imgWidth,
                    imgHeight,
                    undefined,
                    'FAST'
                );
                
                remainingHeight -= sliceHeight;
                
                if (remainingHeight > 0) {
                    pdf.addPage();
                    currentY += sliceHeight;
                }
            }
        } else {
            pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
        }

        // Add footer
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
                `Page ${i} of ${totalPages} | AI & Things Medical Diagnostics`,
                margin,
                pageHeight - 10
            );
        }

        // Save PDF
        pdf.save(filename);
    } catch (error) {
        console.error('Failed to export PDF:', error);
        throw error;
    }
};

/**
 * Generate a structured medical report PDF
 */
export const exportDiagnosisReport = async (
    data: DiagnosisReportData,
    options: Omit<PDFExportOptions, 'title'> = {}
): Promise<void> => {
    const {
        filename = `diagnosis-report-${Date.now()}.pdf`,
        orientation = 'portrait',
        format = 'a4',
        margin = 20,
    } = options;

    const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // ===== Header =====
    pdf.setFillColor(23, 23, 23);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('Medical Analysis Report', margin, 20);
    
    pdf.setFontSize(10);
    pdf.text(`Generated: ${data.date}`, margin, 30);
    
    yPos = 50;

    // ===== Patient Info =====
    pdf.setTextColor(23, 23, 23);
    pdf.setFontSize(12);
    pdf.text('Report Details', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    
    const details = [
        `Modality: ${data.modality.toUpperCase()}`,
        data.patientId ? `Patient ID: ${data.patientId}` : null,
        data.processingTime ? `Processing Time: ${data.processingTime}` : null,
    ].filter(Boolean);

    details.forEach(detail => {
        pdf.text(detail as string, margin, yPos);
        yPos += 6;
    });

    yPos += 5;

    // ===== Divider =====
    pdf.setDrawColor(230, 230, 230);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // ===== Analysis =====
    pdf.setTextColor(23, 23, 23);
    pdf.setFontSize(12);
    pdf.text('Analysis', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    
    const analysisLines = pdf.splitTextToSize(data.analysis, contentWidth);
    pdf.text(analysisLines, margin, yPos);
    yPos += analysisLines.length * 5 + 10;

    // ===== Findings =====
    if (data.findings.length > 0) {
        pdf.setTextColor(23, 23, 23);
        pdf.setFontSize(12);
        pdf.text('Key Findings', margin, yPos);
        yPos += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        
        data.findings.forEach((finding, index) => {
            const bullet = `${index + 1}. ${finding}`;
            const lines = pdf.splitTextToSize(bullet, contentWidth - 5);
            pdf.text(lines, margin + 5, yPos);
            yPos += lines.length * 5 + 3;
        });
        yPos += 5;
    }

    // ===== Recommendations =====
    if (data.recommendations.length > 0) {
        pdf.setTextColor(23, 23, 23);
        pdf.setFontSize(12);
        pdf.text('Recommendations', margin, yPos);
        yPos += 8;

        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        
        data.recommendations.forEach((rec) => {
            const bullet = `• ${rec}`;
            const lines = pdf.splitTextToSize(bullet, contentWidth - 5);
            pdf.text(lines, margin + 5, yPos);
            yPos += lines.length * 5 + 3;
        });
    }

    // ===== Footer =====
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
        'AI & Things Medical Diagnostics | For educational purposes only',
        margin,
        pageHeight - 10
    );

    // ===== Disclaimer =====
    pdf.setFillColor(255, 243, 205);
    pdf.rect(margin, pageHeight - 25, contentWidth, 10, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(146, 64, 14);
    pdf.text(
        '⚠ This report is for educational purposes only. Consult a healthcare professional.',
        margin + 3,
        pageHeight - 19
    );

    // Save
    pdf.save(filename);
};

export default {
    exportElementToPDF,
    exportDiagnosisReport,
};
