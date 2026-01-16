/**
 * Data Export Utilities
 * Provides CSV and JSON export functionality for history and diagnosis data
 */

export interface ExportOptions {
    filename?: string;
    type: 'csv' | 'json';
}

/**
 * Download data as a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV<T extends Record<string, unknown>>(data: T[]): string {
    if (data.length === 0) return '';

    // Get all unique keys from all objects
    const keys = Array.from(
        new Set(data.flatMap(obj => Object.keys(obj)))
    );

    // Header row
    const header = keys.join(',');

    // Data rows
    const rows = data.map(obj =>
        keys.map(key => {
            const value = obj[key];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
        }).join(',')
    );

    return [header, ...rows].join('\n');
}

/**
 * Export data as CSV
 */
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename = 'export'
): void {
    const csv = arrayToCSV(data);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `${filename}_${timestamp}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export data as JSON
 */
export function exportToJSON<T>(
    data: T,
    filename = 'export'
): void {
    const json = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(json, `${filename}_${timestamp}.json`, 'application/json');
}

/**
 * Generic export function based on type
 */
export function exportData<T extends Record<string, unknown>>(
    data: T[],
    options: ExportOptions
): void {
    const filename = options.filename || 'export';
    
    if (options.type === 'csv') {
        exportToCSV(data, filename);
    } else {
        exportToJSON(data, filename);
    }
}

export default { exportToCSV, exportToJSON, exportData };
