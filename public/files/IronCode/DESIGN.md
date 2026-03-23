# Design System Document: The Digital Blacksmith

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Blacksmith."** This is a visual philosophy that rejects the ephemeral "lightness" of modern SaaS in favor of something weighted, forged, and permanent. We are fusing the raw, tactile nature of a heavy-industrial workshop with the precision of high-end engineering.

This system breaks the "template" look through **Brutal Industrialism**. We utilize intentional asymmetry—where elements appear anchored to a heavy "anvil" of content—and high-contrast typography scales that demand attention. By overlapping thick metallic frames with glowing, molten interactive states, we create a UI that feels like it was manufactured rather than rendered.

---

## 2. Colors & Atmospheric Tones
The palette is rooted in the heat of the forge: the transition from cold, unyielding carbon to the volatile energy of molten metal.

### The Palette
- **Base (Coal):** `surface` (#131313) and `surface_container_lowest` (#0e0e0e). The floor of the foundry.
- **Structural (Steel):** `secondary` (#c8c6c6) and `outline` (#ad897e). Used for the "heavy" metallic framing.
- **Active (Molten):** `primary` (#ffb59e) and `primary_container` (#ff571a). These represent the white-hot heat of a tool in the fire.
- **Alert (Ember):** `tertiary_container` (#ff544d). The cooling, dangerous glow of a finished strike.

### The "No-Line" Rule
Standard 1px hairline borders are strictly prohibited for sectioning. To define layout boundaries, designers must use **Surface Hierarchy**. Use a `surface_container_low` section sitting against a `surface` background to create a massive, structural shift. If a boundary is required, it must be "forged"—either a `2px` to `4px` heavy border or a shift in background depth.

### Surface Hierarchy & Nesting
Treat the UI as a physical assembly of plates.
- **Level 1 (The Floor):** `surface` (#131313).
- **Level 2 (The Anvil):** `surface_container` (#201f1f). High-priority content blocks.
- **Level 3 (The Workpiece):** `surface_bright` (#393939). Active floating elements or elevated "tooling" panels.

### The "Molten" Rule
Main CTAs and hero headers should utilize a subtle radial gradient from `primary` to `primary_container`. This mimics the uneven heat distribution of glowing metal, providing a "visual soul" that flat colors lack.

---

## 3. Typography: Industrial Authority
The typography is a dialogue between the heavy machinery of the foundry and the technical blueprints used to build it.

- **The Forge (Display & Headline):** `Space Grotesk`. Use `display-lg` (3.5rem) and `headline-lg` (2rem) for high-impact statements. These should be set with tight letter-spacing (-2%) to feel dense and pressurized.
- **The Blueprint (Title & Body):** `Inter`. This provides the technical legibility required for complex data. 
- **The Stencil (Labels):** `Space Grotesk` (All Caps). Used for `label-md` and `label-sm`. This mimics stamped metal serial numbers.

The hierarchy conveys power by using massive scale jumps. A `display-lg` headline should tower over `body-md` text to emphasize the "Heavy vs. Precise" contrast.

---

## 4. Elevation & Depth: Tonal Forging
In this system, we do not use "light" to create depth; we use "heat" and "mass."

- **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. Place a `surface_container_highest` (#353534) card on a `surface_container_low` (#1c1b1b) section to create a hard, physical lift.
- **Heat Glow (Ambient Shadows):** When an element floats, discard black shadows. Use a diffused "Heat Glow"—a shadow tinted with `primary` (#ffb59e) at 5% opacity with a large blur (24px+). This makes the element appear as if it is radiating heat onto the surface below.
- **The Metallic Border:** All primary containers must use a `2px` border using `outline_variant` (#5c4037) to simulate a beveled, machined edge.
- **Grain & Texture:** Apply a 3% opacity film grain or "brushed metal" noise overlay to `surface_bright` elements to break the digital perfection of the screen.

---

## 5. Components

### Buttons: The Strike
- **Primary:** High-contrast `primary_container` (#ff571a). No rounded corners (`0px`). On hover, the button should trigger an outer glow (the Heat Effect).
- **Secondary:** `secondary_container` (#494949) with a `2px` `outline` border. 
- **Interactive State:** All active states must feel like a "pulse" of light, increasing the brightness of the `primary` token.

### Input Fields: The Mold
- **Text Inputs:** Use `surface_container_lowest` (#0e0e0e) for the field background to create a "recessed" look. The bottom border should be a heavy `2px` line in `outline`.
- **Focus State:** The border transitions to `primary` (#ffb59e) with a subtle inner glow.

### Cards: The Heavy Plates
- **Construction:** No divider lines. Separate content using the Spacing Scale (e.g., `8` (1.75rem) gap between sections). 
- **Corners:** Strictly `0px` roundedness across all scales. Every edge must be sharp enough to cut.

### Tooltips: The Technical Tag
- **Style:** Small, high-contrast black boxes (`surface_container_lowest`) with `label-sm` text in `primary`. These should appear instantly, like a stamped label.

---

## 6. Do’s and Don'ts

### Do:
- **Use "Anvil" Layouts:** Align large, heavy elements to the left to create a visual "weight" that anchors the page.
- **Embrace the Grain:** Use subtle textures to make surfaces feel like cold-rolled steel.
- **High-Contrast Typography:** Pair a huge `display-lg` heading with a tiny, technical `label-sm` for an editorial look.

### Don't:
- **No Radii:** Never use rounded corners. The `roundedness` scale is locked at `0px`.
- **No Soft Grays:** Avoid mid-tone grays that lack "temperature." Use the warm-leaning `surface_variant` or the cool `secondary` steel tones.
- **No Thin Lines:** Never use `1px` borders for containment; they feel fragile. This system is about strength.
- **No Centered Layouts:** Avoid "boring" center-aligned grids. Use asymmetrical column widths to create a dynamic, engineered feel.