# Design System Document

## 1. Overview & Creative North Star: "The Obsidian Lens"

This design system is engineered to reflect the technical precision and architectural depth of high-level full-stack development. Moving away from the generic "flat" dark mode, this system adopts a **"Creative North Star" of The Obsidian Lens**.

The interface is treated as a high-fidelity optical instrument—a series of stacked, translucent layers that provide a glimpse into the logic beneath. We break the "template" look by utilizing **intentional asymmetry** and a high-contrast typography scale that feels more like a premium editorial magazine than a standard portfolio. By layering glass surfaces over subtle, glowing radial gradients, we create a sense of infinite depth, mirroring the sophisticated complexity of Svelte and Laravel ecosystems.

---

## 2. Colors

The palette is rooted in a "Deep Space" philosophy, using a nearly black foundation to allow vibrant technical accents to pop with neon-like intensity.

### Core Palette
- **Background (`#0A0A0A`):** The absolute foundation. A matte, deep charcoal that provides the canvas for all glass effects.
- **Primary / Cyan (`#00F2FF`):** Used for "Active" logic, data visualization, and primary action highlights.
- **Secondary / Soft Purple (`#BF5AF2`):** Used for "Creative" logic, secondary accents, and depth-defining gradients.

### The "No-Line" Rule
Sectioning must never be achieved with `1px solid` borders across the full width of the screen. Boundaries are defined through:
1. **Tonal Shifts:** Transitioning from `surface-container-low` to `surface-container-highest`.
2. **Backdrop Blurs:** Using the glass effect to naturally separate a floating element from the background.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack.
- **Base Layer:** `surface` (#131313)
- **Secondary Surfaces:** `surface_container_low` for large structural areas.
- **Interactive Cards:** `surface_container_high` with a 60% opacity fill and a `blur(12px)` backdrop.
- **Floating Overlays:** `surface_container_highest` for tooltips and modals.

### Signature Textures
To add "soul," use subtle radial gradients:
- A `20%` opacity Cyan glow in the top-left of the Hero section.
- A `15%` opacity Purple glow in the bottom-right of project cards.

---

## 3. Typography

The typography strategy pairs technical precision with editorial authority.

- **Display & Headlines (Space Grotesk):** This typeface offers a "tech-brutalist" feel with its geometric terminals. Use `display-lg` for hero statements to command attention.
- **Body & Labels (Inter):** The industry standard for legibility. Used for all descriptive text to ensure the "developer precision" isn't lost in the aesthetic.

**Hierarchy Intent:** 
- **Headlines:** Set to `headline-lg` with tight letter-spacing (-0.02em) to feel architectural.
- **Body:** Use `body-lg` for project descriptions with generous line-height (1.6) for readability.

---

## 4. Elevation & Depth

In this design system, depth is a functional tool, not a decoration.

### The Layering Principle
Stacking replaces shadowing. An inner card should be `surface_container_highest` placed upon a `surface_container_low` parent. This creates a "milled" effect, as if the UI was carved out of a single block of dark glass.

### Ambient Shadows
Shadows must be invisible yet felt. Use a `24px` to `48px` blur radius with only `6%` opacity, tinted with `primary` (`#00F2FF`). This simulates a glowing component rather than a floating one.

### The "Ghost Border" Fallback
Where a boundary is required for accessibility, use a **Ghost Border**:
- `outline_variant` at `15%` opacity. 
- Apply a `linear-gradient` to the border itself (from `primary` to `secondary` at 45 degrees) to give the glass edge a "refractive" shimmer.

### Glassmorphism Specs
All containers must utilize:
- **Background:** `rgba(28, 27, 27, 0.65)`
- **Backdrop Blur:** `16px`
- **Border:** `1px solid rgba(255, 255, 255, 0.08)`

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (Cyan to Soft Purple), `ROUND_SIXTEEN`, with a subtle outer glow on hover.
- **Secondary:** Ghost variant. Transparent background, `1px` Ghost Border, white text.
- **Tertiary:** Text-only with a Cyan underline that expands from the center on hover.

### Cards (The "Glass" Tile)
- No dividers. Use `24px` (Spacing Scale 6) of internal padding.
- Use `ROUND_SIXTEEN` for all corners.
- Hover State: Increase backdrop blur from `16px` to `24px` and brighten the Ghost Border to `30%` opacity.

### Chips (Tech Stack Tags)
- Small, pill-shaped (`full` roundedness).
- Background: `surface_container_highest` at 40% opacity.
- Border: `10%` Primary Cyan.

### Input Fields
- Underline style only, or fully enclosed glass containers.
- **Active State:** The bottom border transforms into a `2px` Cyan-to-Purple gradient.
- **Error State:** Use the `error` token (`#ffb4ab`) for the label and a soft red outer glow.

### Signature Component: The "Code Pulse"
A small, glowing dot (`primary`) next to project titles that subtly pulses using CSS keyframes, indicating a "live" or "production-ready" status.

---

## 6. Do's and Don'ts

### Do:
- **Use Asymmetry:** Place a large headline on the left and a small, high-density data point on the far right to create editorial tension.
- **Embrace White Space:** Use the `20` and `24` spacing scales between major sections to let the glass "breathe."
- **Layer Your Gradients:** Place a Soft Purple radial gradient behind a Cyan-bordered glass card for a "layered neon" effect.

### Don't:
- **Don't use 100% Opaque Borders:** This breaks the glass metaphor and makes the UI feel heavy and dated.
- **Don't use pure White (#FFFFFF):** Use `on_surface` (`#e5e2e1`) for text to reduce eye strain in dark mode.
- **Don't Over-Saturate:** Accents (Cyan/Purple) should be used for less than 10% of the screen real estate. The background and glass surfaces must do the heavy lifting.
- **Don't use Divider Lines:** If you feel the need for a line, use a spacing increase of `8px` or a `1px` shift in background tone instead.