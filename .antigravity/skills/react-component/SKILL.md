---
name: react-component
description: Creates new React components following project conventions. Use when building new UI components, pages, or feature modules for the clinical dashboard frontend.
---

# React Component Development Skill

This skill guides the creation of new React components for the medical diagnostic application's clinical dashboard.

## Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard-specific components
│   ├── landing/        # Landing page components
│   └── layout/         # Layout components (Sidebar, Header, etc.)
├── pages/              # Page-level components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── services/           # API service functions
├── store/              # State management (Redux)
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## Component Template

### Functional Component (TypeScript)
```tsx
import React from 'react';
import './ComponentName.css'; // If needed

interface ComponentNameProps {
  /** Description of the prop */
  propName: string;
  /** Optional prop with default */
  optional?: boolean;
  /** Event handler */
  onAction?: () => void;
}

/**
 * ComponentName - Brief description of what this component does.
 * 
 * @example
 * <ComponentName propName="value" onAction={() => handleAction()} />
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  propName,
  optional = false,
  onAction,
}) => {
  // Hooks at the top
  const [state, setState] = React.useState<string>('');

  // Event handlers
  const handleClick = React.useCallback(() => {
    onAction?.();
  }, [onAction]);

  // Render
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

## Styling Guidelines

### Use Cosmic Glass Design System
Always apply the established design tokens:

```tsx
// Good - Using design system classes
<div className="glass-card p-6 rounded-2xl">
  <h2 className="text-zinc-50 text-xl font-semibold">Title</h2>
  <p className="text-zinc-400 mt-2">Description</p>
</div>

// Bad - Hardcoded colors
<div style={{ background: '#1a1a1a', padding: '24px' }}>
  <h2 style={{ color: 'white' }}>Title</h2>
</div>
```

### CSS-in-JS or CSS Modules
```tsx
// Inline styles for dynamic values only
const dynamicStyle = {
  transform: `translateX(${offset}px)`,
  opacity: isVisible ? 1 : 0,
};
```

## State Management Patterns

### Local State (useState)
Use for component-specific UI state:
```tsx
const [isOpen, setIsOpen] = useState(false);
const [inputValue, setInputValue] = useState('');
```

### Global State (Redux Toolkit)
Use for app-wide state:
```tsx
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectPatient, setCurrentPatient } from '@/store/patientSlice';

const patient = useAppSelector(selectPatient);
const dispatch = useAppDispatch();
```

### Server State (React Query)
Use for API data:
```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchDiagnosis } from '@/services/api';

const { data, isLoading, error } = useQuery({
  queryKey: ['diagnosis', patientId],
  queryFn: () => fetchDiagnosis(patientId),
});
```

## Accessibility Requirements

Since this is a medical application, accessibility is critical:

1. [ ] Use semantic HTML elements (`<button>`, `<nav>`, `<main>`)
2. [ ] Include `aria-label` for icon-only buttons
3. [ ] Ensure keyboard navigation works
4. [ ] Maintain color contrast ratios (WCAG AA)
5. [ ] Add `role` attributes where needed
6. [ ] Include loading states with `aria-busy`

## Component Creation Checklist

When creating a new component:

1. [ ] Create file in appropriate directory
2. [ ] Define TypeScript interface for props
3. [ ] Add JSDoc documentation
4. [ ] Apply Cosmic Glass styling
5. [ ] Handle loading/error states
6. [ ] Implement accessibility features
7. [ ] Add responsive breakpoints if needed
8. [ ] Export from index file (if exists)

## Medical Context Considerations

For this clinical application:

- **Data sensitivity**: Never log PHI to console
- **Error handling**: Graceful degradation, never expose raw errors
- **Loading states**: Always show feedback for async operations
- **Confirmation**: Critical actions require user confirmation
