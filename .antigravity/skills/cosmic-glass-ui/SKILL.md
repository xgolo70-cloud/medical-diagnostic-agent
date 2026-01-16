---
name: cosmic-glass-ui
description: Implements the 'Cosmic Glass' design philosophy for all UI/UX work. Use when creating new components, pages, modals, or any frontend visual elements. Ensures deep dark mode (Zinc palette), glassmorphism effects, fluid animations, glow effects, and intelligent floating UI elements.
---

# Cosmic Glass UI Design System

This skill ensures all UI components follow the established "Cosmic Glass" design philosophy for this medical diagnostic application.

## Core Design Principles

### 1. Color Palette (Zinc-Based Dark Mode)
```css
/* Primary Background Layers */
--bg-base: #09090b;        /* zinc-950 - Deepest background */
--bg-surface: #18181b;     /* zinc-900 - Card/panel backgrounds */
--bg-elevated: #27272a;    /* zinc-800 - Elevated elements */
--bg-hover: #3f3f46;       /* zinc-700 - Hover states */

/* Text Colors */
--text-primary: #fafafa;   /* zinc-50 - Primary text */
--text-secondary: #a1a1aa; /* zinc-400 - Secondary text */
--text-muted: #71717a;     /* zinc-500 - Muted/disabled text */

/* Accent Colors (Medical Context) */
--accent-primary: #22c55e;    /* Green - Success/Healthy */
--accent-warning: #f59e0b;    /* Amber - Caution/Warning */
--accent-danger: #ef4444;     /* Red - Critical/Urgent */
--accent-info: #3b82f6;       /* Blue - Informational */
```

### 2. Glassmorphism Effects
Apply these to cards, modals, and floating panels:
```css
.glass-card {
  background: rgba(24, 24, 27, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.glass-modal {
  background: rgba(24, 24, 27, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}
```

### 3. Fluid Animations
```css
/* Timing Functions */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Standard Durations */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-slower: 600ms;
```

### 4. Subtle Glow Effects (Use Sparingly)
```css
/* For interactive elements on hover */
.glow-subtle {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.15);
}

/* For critical/attention elements */
.glow-critical {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
}
```

## Component Guidelines

### Buttons
- Use solid backgrounds with subtle hover transitions
- Never use pure white - always slightly tinted
- Include micro-animations on interaction

### Cards
- Always apply glassmorphism base
- Use consistent padding: 24px for desktop, 16px for mobile
- Include subtle border highlight on hover

### Modals
- Apply heavy blur effect (20px+)
- Use darker overlay (rgba(0, 0, 0, 0.7))
- Animate entry with scale + fade

### Input Fields
- Dark backgrounds matching zinc-800
- Subtle ring focus states (not glow)
- Clear placeholder contrast

## Implementation Checklist

When creating/modifying UI components:

1. [ ] Use Zinc color palette exclusively (no random colors)
2. [ ] Apply glassmorphism to elevated surfaces
3. [ ] Include smooth transitions (250ms default)
4. [ ] Ensure text contrast meets WCAG AA
5. [ ] Add hover/focus states with subtle feedback
6. [ ] Test in dark mode context only
7. [ ] Keep glow effects minimal and purposeful
8. [ ] Use consistent spacing tokens (4px base grid)

## Files to Reference
- `/frontend/src/styles/styles.css` - Global design tokens
- `/frontend/src/index.css` - Base styles
