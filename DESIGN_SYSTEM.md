# Design System & Philosophy
> **"Clean Light Mode"** - Inspired by Vercel/Geist Design System.

## Core Philosophy
1.  **Minimalism first:** Functionality over decoration.
2.  **Content-centric:** The interface recedes; data and content come forward.
3.  **High Contrast & Clarity:** Strict adherence to accessibility and legibility.
4.  **Subtle Depth:** Use subtle borders and soft shadows instead of heavy colors.
5.  **Refined Motion:** Animations should be fast (150-300ms), subtle, and enhancing (not distracting).

---

## 🎨 Color Palette (Light Mode - Primary)

### Backgrounds
-   `--bg-primary`: `#ffffff` (Main Background)
-   `--bg-secondary`: `#fafafa` (Sidebars, Cards, Hovers)
-   `--bg-tertiary`: `#f5f5f5` (Inputs, Pills)

### Text Colors
-   `--text-primary`: `#171717` (Headings, Main Text)
-   `--text-secondary`: `#666666` (Subtitles, Descriptions)
-   `--text-tertiary`: `#888888` (Meta data, Placeholders)
-   `--text-muted`: `#a3a3a3` (Disabled states)

### Accents & Borders
-   `--color-primary`: `#171717` (Primary Buttons, Active States)
-   `--border-color`: `#eaeaea` (Card Borders, Dividers)
-   `--border-color-hover`: `#d4d4d4` (Interactive Elements)
-   `--border-color-focus`: `#171717` (Focus Rings)

### Functional Colors
-   `--color-success`: `#0070f3` (Blue - Vercel Style) or Green `#00A36C`
-   `--color-error`: `#ee0000` (Red)
-   `--color-warning`: `#f5a623` (Orange)

---

## 🔤 Typography

**Font Family:** `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif`

-   **H1:** `2rem` (32px), weight 500, tracking `-0.04em`
-   **H2:** `1.25rem` (20px), weight 600, tracking `-0.02em`
-   **Body:** `1rem` (16px), weight 400, line-height `1.5`
-   **Small:** `0.875rem` (14px), weight 400

---

## 🧩 Components

### Buttons
**Primary Button:**
-   Bg: `#171717` (Black)
-   Text: `#ffffff` (White)
-   Radius: `6px`
-   Hover: Lighten slightly `#404040`

**Secondary Button:**
-   Bg: `#ffffff`
-   Border: `1px solid #eaeaea`
-   Text: `#171717`
-   Hover: Bg `#fafafa`, Border `#d4d4d4`

### Cards
-   Bg: `#ffffff`
-   Border: `1px solid #eaeaea`
-   Radius: `6px` or `8px`
-   Shadow: `var(--shadow-sm)` (`0 1px 2px rgba(0, 0, 0, 0.04)`)
-   Hover: Translate Y `-2px`, Shadow `var(--shadow-md)`

### Inputs
-   Bg: `#ffffff`
-   Border: `1px solid #eaeaea`
-   Focus: Border `#171717`, Ring `2px solid #eaeaea`

---

## ✨ Animation Guidelines

-   **Duration:** Fast (`150ms` - `300ms`).
-   **Easing:** `ease` or `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like).
-   **Fade In:** `opacity: 0` -> `1`, `y: 10px` -> `0`.
-   **Hover:** Subtle scale (`1.01` or `1.02`), not exaggerated.

---

## 🛠️ Troubleshooting & Implementation Patterns

### 1. Absolute Centering (The "Unbreakable" Center)
When `mx-auto` or `text-center` fails to center an element (often due to `w-full` conflicts or parent constraints), use this Flexbox wrapper pattern:

```tsx
<div className="w-full flex justify-center">
    <Element className="text-center" />
</div>
```
*   **Why:** This decouples the centering logic from the element's internal sizing. The parent handles horizontal alignment, and the child handles text alignment.

### 2. Stubborn Link Styling (Footer Links)
If global CSS or browser defaults force links (anchors) to be blue despite utility classes (e.g., `text-gray-500`), use this "Span-Link" pattern as a last resort:

```tsx
<span 
    onClick={() => window.location.href = link.href}
    className="cursor-pointer transition-colors duration-200"
    style={{ color: '#6b7280' }} // Force gray color
    onMouseEnter={(e) => e.currentTarget.style.color = '#111827'} // Darker on hover
    onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
>
    Link Text
</span>
```
*   **Use Case:** Critical UI components like Footers where design consistency overrides semantic constraints and CSS specificity battles are breaking the theme.

### 3. Footer Design Standards
*   **Links:** Must be Gray (`text-gray-500` / `#6b7280`) by default, never Blue.
*   **Hover:** Dark Gray / Black (`text-gray-900` / `#111827`).
*   **Structure:** Clean columns, bold headers (uppercase), subtle animations.
