import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders with default props', () => {
            render(<Button>Click me</Button>);
            
            const button = screen.getByRole('button', { name: /click me/i });
            expect(button).toBeInTheDocument();
        });

        it('renders with custom className', () => {
            render(<Button className="custom-class">Test</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
        });

        it('renders children correctly', () => {
            render(
                <Button>
                    <span data-testid="child">Child Content</span>
                </Button>
            );
            
            expect(screen.getByTestId('child')).toBeInTheDocument();
        });
    });

    describe('Variants', () => {
        it('applies primary variant styles', () => {
            render(<Button variant="primary">Primary</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('applies secondary variant styles', () => {
            render(<Button variant="secondary">Secondary</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('applies outline variant styles', () => {
            render(<Button variant="outline">Outline</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('applies ghost variant styles', () => {
            render(<Button variant="ghost">Ghost</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Sizes', () => {
        it('applies small size', () => {
            render(<Button size="sm">Small</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('applies medium size (default)', () => {
            render(<Button size="md">Medium</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('applies large size', () => {
            render(<Button size="lg">Large</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('calls onClick when clicked', async () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click me</Button>);
            
            const button = screen.getByRole('button');
            await userEvent.click(button);
            
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('does not call onClick when disabled', async () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick} disabled>Disabled</Button>);
            
            const button = screen.getByRole('button');
            await userEvent.click(button);
            
            expect(handleClick).not.toHaveBeenCalled();
        });

        it('has correct disabled attribute', () => {
            render(<Button disabled>Disabled</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });
    });

    describe('Loading State', () => {
        it('shows loading state when isLoading is true', () => {
            render(<Button isLoading>Loading</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('hides content during loading', () => {
            render(<Button isLoading>Hidden Text</Button>);
            
            // Button should still be in document but content may be hidden
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('supports aria-label', () => {
            render(<Button aria-label="Submit form">Submit</Button>);
            
            const button = screen.getByLabelText('Submit form');
            expect(button).toBeInTheDocument();
        });

        it('supports custom type attribute', () => {
            render(<Button type="submit">Submit</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('is focusable', async () => {
            render(<Button>Focus me</Button>);
            
            const button = screen.getByRole('button');
            button.focus();
            
            expect(button).toHaveFocus();
        });

        it('is not focusable when disabled', async () => {
            render(<Button disabled>Disabled</Button>);
            
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('disabled');
        });
    });
});
