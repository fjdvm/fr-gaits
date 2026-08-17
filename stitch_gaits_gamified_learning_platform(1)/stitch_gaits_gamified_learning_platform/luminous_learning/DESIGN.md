---
name: Luminous Learning
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#514533'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#847561'
  outline-variant: '#d6c4ac'
  surface-tint: '#7f5600'
  primary: '#7f5600'
  on-primary: '#ffffff'
  primary-container: '#fbb017'
  on-primary-container: '#694600'
  inverse-primary: '#ffba3f'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5c5f60'
  on-tertiary: '#ffffff'
  tertiary-container: '#bdbec0'
  on-tertiary-container: '#4b4d4f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdeae'
  primary-fixed-dim: '#ffba3f'
  on-primary-fixed: '#281800'
  on-primary-fixed-variant: '#604100'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e1e2e4'
  tertiary-fixed-dim: '#c5c6c8'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 32px
  gutter: 24px
  card-gap: 20px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system embodies a modern, "soft-edge" dashboard aesthetic that prioritizes clarity, focus, and gentle motivation. It is designed for educational platforms and SaaS environments where information density must be balanced with visual breathing room. 

The style sits at the intersection of **Corporate Modern** and **Soft Minimalism**. It utilizes high-quality whitespace and large-radius containers to create a welcoming, non-intimidating user experience. The atmosphere is professional yet approachable, using subtle depth to organize complex data without overwhelming the user. The "gold" accents provide a sense of achievement and gamification, guiding the eye toward progress and action.

## Colors

The palette is anchored by a sophisticated light-gray background system that prevents the screen from feeling clinical. 

- **Primary (Gold):** Used exclusively for high-intent actions, active navigation states, and progress indicators. It carries the weight of "gamification" and success.
- **Secondary (Ink):** A deep, near-black used for primary text and high-contrast UI elements like active sidebar tabs or primary buttons.
- **Surface & Background:** A tiered system of off-whites and cool grays (`#F4F5F7` and `#FFFFFF`) used to differentiate containers from the main canvas.
- **Status & Neutral:** Mid-tone grays are used for secondary labels, metadata, and inactive navigation items to maintain a clear hierarchy.

## Typography

The design system utilizes **Plus Jakarta Sans** for its clean, geometric, yet friendly personality. It bridges the gap between a systematic SaaS font and a warm consumer-facing typeface.

- **Headlines:** Set with tight letter-spacing and bold weights to provide strong structural anchors.
- **Body Text:** Uses a slightly larger 15px base to ensure readability in descriptive content blocks. 
- **Labels:** Meta-information and small UI labels use medium to semi-bold weights to remain legible at small scales against light-gray backgrounds.
- **Scale:** On mobile, large display titles should scale down to `headline-md` to maintain vertical economy while preserving the bold "title-first" hierarchy.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for dashboard views, centering the main workspace while allowing sidebars to remain docked or collapsible.

- **Spacing Rhythm:** Based on an 8px linear scale. 
- **Grid:** A 12-column desktop grid with wide 24px gutters. This provides the necessary breathing room for the "soft-edge" aesthetic.
- **Reflow:** On mobile, the multi-column dashboard collapses into a single-column stack. The side navigation transitions into a bottom bar or a hidden drawer.
- **Margins:** Generous external margins (40px on desktop) ensure the content feels like it's "floating" on a soft canvas rather than being cramped against the screen edges.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows. 

- **Surface Levels:** The primary background uses a subtle gray (`#F4F5F7`). Secondary containers (cards, sidebar) use pure white (`#FFFFFF`) to "pop" forward.
- **Shadows:** When used, shadows are extremely diffused ("Ambient"). Use a light tint of the secondary color (e.g., 4% opacity) with a large blur radius (20px+) and zero offset to simulate a soft natural light source.
- **Active States:** Depth is often communicated through color shifts (e.g., a white card becoming an Ink-colored tab) rather than physical elevation changes.

## Shapes

The "soft-edge" look is defined by a consistent, generous corner radius.

- **Standard Elements:** Buttons, small input fields, and chips use a `0.5rem` (8px) radius.
- **Large Containers:** Content cards and dashboard panels use `rounded-xl` (1.5rem / 24px) to create a friendly, approachable framing of information.
- **Icons:** Use rounded caps and joins to match the softness of the UI containers.

## Components

- **Cards:** The signature component. Pure white background, 24px padding, and 24px corner radius. They should include subtle 1px borders in a slightly darker gray than the background to maintain definition.
- **Primary Buttons:** High-contrast Ink (`#1A1A1A`) with white text, or Gold (`#FBB017`) for gamified actions.
- **Sidebar Tabs:** Inactive states are transparent with gray icons. Active states use a high-contrast dark background with a rounded-right shape that suggests it is "connected" to the main content area.
- **Progress Indicators:** Use the primary Gold for progress bars and "streaks" to reinforce positive feedback loops.
- **Input Fields:** Soft gray backgrounds (`#F4F5F7`) with no borders, transitioning to a primary gold border on focus.
- **Chips/Badges:** Small, low-profile containers with 8px radius, used for categories or status labels (e.g., "Active", "6 weeks").