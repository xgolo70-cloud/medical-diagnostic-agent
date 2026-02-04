/**
 * Utility Functions Tests
 * 
 * Tests for the cn (className) utility function.
 */
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className utility)', () => {
    
    describe('basic functionality', () => {
        
        it('should return empty string for no arguments', () => {
            expect(cn()).toBe('');
        });
        
        it('should return single class unchanged', () => {
            expect(cn('bg-red-500')).toBe('bg-red-500');
        });
        
        it('should merge multiple classes', () => {
            const result = cn('text-white', 'bg-blue-500');
            expect(result).toContain('text-white');
            expect(result).toContain('bg-blue-500');
        });
        
        it('should handle string arrays', () => {
            const result = cn(['text-lg', 'font-bold']);
            expect(result).toContain('text-lg');
            expect(result).toContain('font-bold');
        });
    });
    
    describe('conditional classes', () => {
        
        it('should include class when condition is true', () => {
            const shouldInclude = true;
            const result = cn('base', shouldInclude && 'conditional');
            expect(result).toContain('conditional');
        });
        
        it('should exclude class when condition is false', () => {
            const shouldExclude = false;
            const result = cn('base', shouldExclude && 'conditional');
            expect(result).not.toContain('conditional');
        });
        
        it('should handle object syntax', () => {
            const result = cn('base', { 'active': true, 'disabled': false });
            expect(result).toContain('active');
            expect(result).not.toContain('disabled');
        });
        
        it('should handle undefined values', () => {
            const result = cn('base', undefined, 'other');
            expect(result).toContain('base');
            expect(result).toContain('other');
        });
        
        it('should handle null values', () => {
            const result = cn('base', null, 'other');
            expect(result).toContain('base');
            expect(result).toContain('other');
        });
    });
    
    describe('tailwind merge behavior', () => {
        
        it('should merge conflicting padding classes', () => {
            const result = cn('p-4', 'p-6');
            // tailwind-merge should keep only the last one
            expect(result).toBe('p-6');
        });
        
        it('should merge conflicting margin classes', () => {
            const result = cn('m-2', 'm-4');
            expect(result).toBe('m-4');
        });
        
        it('should merge conflicting text color classes', () => {
            const result = cn('text-red-500', 'text-blue-500');
            expect(result).toBe('text-blue-500');
        });
        
        it('should merge conflicting background classes', () => {
            const result = cn('bg-white', 'bg-black');
            expect(result).toBe('bg-black');
        });
        
        it('should keep non-conflicting classes', () => {
            const result = cn('p-4', 'text-white', 'bg-blue-500');
            expect(result).toContain('p-4');
            expect(result).toContain('text-white');
            expect(result).toContain('bg-blue-500');
        });
        
        it('should handle responsive prefixes', () => {
            const result = cn('p-2', 'md:p-4', 'lg:p-6');
            expect(result).toContain('p-2');
            expect(result).toContain('md:p-4');
            expect(result).toContain('lg:p-6');
        });
        
        it('should handle hover states', () => {
            const result = cn('bg-blue-500', 'hover:bg-blue-600');
            expect(result).toContain('bg-blue-500');
            expect(result).toContain('hover:bg-blue-600');
        });
        
        it('should merge conflicting responsive classes', () => {
            const result = cn('md:p-4', 'md:p-6');
            expect(result).toBe('md:p-6');
        });
    });
    
    describe('complex scenarios', () => {
        
        it('should handle component variant pattern', () => {
            const baseClasses = 'px-4 py-2 rounded font-medium';
            const variantClasses = 'bg-blue-500 text-white';
            const sizeClasses = 'text-sm';
            
            const result = cn(baseClasses, variantClasses, sizeClasses);
            
            expect(result).toContain('px-4');
            expect(result).toContain('py-2');
            expect(result).toContain('rounded');
            expect(result).toContain('bg-blue-500');
            expect(result).toContain('text-sm');
        });
        
        it('should allow override of base classes', () => {
            const baseClasses = 'p-4 bg-white';
            const overrideClasses = 'p-8 bg-black';
            
            const result = cn(baseClasses, overrideClasses);
            
            expect(result).toBe('p-8 bg-black');
        });
        
        it('should handle button disabled state pattern', () => {
            const isDisabled = true;
            
            const result = cn(
                'px-4 py-2 bg-blue-500',
                isDisabled && 'opacity-50 cursor-not-allowed'
            );
            
            expect(result).toContain('opacity-50');
            expect(result).toContain('cursor-not-allowed');
        });
        
        it('should handle dynamic class application', () => {
            const size = 'large';
            const sizeClasses: Record<string, string> = {
                small: 'text-sm p-2',
                medium: 'text-base p-3',
                large: 'text-lg p-4',
            };
            
            const result = cn('base', sizeClasses[size]);
            
            expect(result).toContain('text-lg');
            expect(result).toContain('p-4');
        });
    });
    
    describe('edge cases', () => {
        
        it('should handle empty strings', () => {
            const result = cn('', 'class', '');
            expect(result).toBe('class');
        });
        
        it('should handle whitespace-only strings', () => {
            const result = cn('  ', 'class', '   ');
            expect(result).toBe('class');
        });
        
        it('should handle mixed types', () => {
            const result = cn(
                'base',
                ['array-class'],
                { 'object-class': true },
                'string-class'
            );
            
            expect(result).toContain('base');
            expect(result).toContain('array-class');
            expect(result).toContain('object-class');
            expect(result).toContain('string-class');
        });
        
        it('should handle nested arrays', () => {
            const result = cn(['outer', ['inner']]);
            expect(result).toContain('outer');
            expect(result).toContain('inner');
        });
    });
});
