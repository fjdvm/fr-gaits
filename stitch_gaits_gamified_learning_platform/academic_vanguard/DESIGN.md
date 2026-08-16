---
name: Academic Vanguard
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5a413d'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e706c'
  outline-variant: '#e2bfb9'
  surface-tint: '#b22b1d'
  primary: '#570000'
  on-primary: '#ffffff'
  primary-container: '#800000'
  on-primary-container: '#ff8371'
  inverse-primary: '#ffb4a8'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd400'
  on-secondary-container: '#6e5c00'
  tertiary: '#00137f'
  on-tertiary: '#ffffff'
  tertiary-container: '#0021b9'
  on-tertiary-container: '#94a0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#8f0f07'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#dfe0ff'
  tertiary-fixed-dim: '#bcc2ff'
  on-tertiary-fixed: '#000c61'
  on-tertiary-fixed-variant: '#1830c2'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  surface-alt: '#F8F9FA'
  status-heart: '#FF3131'
  status-success: '#28A745'
  status-warning: '#FFBF00'
  text-secondary: '#708090'
  xp-fill: '#FFD700'
  streak-flame: '#FF4500'
typography:
  display-hero:
    fontFamily: DM Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1280px
---

## Brand & Style

This design system establishes a high-performance educational environment that bridges the gap between a prestigious university portal and a modern RPG interface. The brand personality is "The Scholar-Hero"—disciplined, authoritative, yet fueled by the dopamine loops of quest-based progression.

The visual style is **Corporate-Modern with Bold Gamification**. It utilizes high-contrast colors and professional typography but introduces "chunky" interactive elements and high-chroma accents to signify achievement. Layouts are clean and structured to minimize cognitive load during learning, while feedback mechanisms (modals, toasts, level-ups) employ tactile, energetic visual cues inspired by contemporary mastery-based platforms.

## Colors

The palette is anchored by **Maroon**, lending an air of academic tradition and "Ivy League" credibility. This is balanced by **Gold**, reserved exclusively for rewards, progress, and high-value feedback, ensuring that gamified elements are immediately distinguishable from standard UI chrome.

- **Primary (Maroon):** Used for global navigation, primary actions, and branding.
- **Accent (Gold):** Used for XP bars, badges, and positive reinforcement.
- **Backgrounds:** Pure White serves as the primary canvas to keep the focus on content. Off-White (#F8F9FA) is used for secondary surface tiers like sidebars or card containers.
- **Semantic Colors:** Heart Red is used for health/lives; Success Green for completed quests; Warning Amber for critical system alerts.

## Typography

The system utilizes **DM Sans** for its geometric clarity and modern professional feel. To achieve the "Gamified" look without sacrificing readability, we rely on heavy weights (700+) for headlines and labels, creating a "chunky" hierarchy that feels robust and interactive.

Headlines should use tight line-height and slight negative letter-spacing for a high-impact, editorial look. Body text maintains generous line-height for long-form educational content. All labels and buttons use uppercase or bold weights to mimic RPG stat-sheets.

## Layout & Spacing

The design system employs a **12-column fixed grid** for desktop and a **fluid single-column** layout for mobile. 

- **Vertical Rhythm:** Built on an 8px base unit.
- **Margins:** 40px on desktop to provide a "premium" academic feel; 16px on mobile to maximize content real estate.
- **Sidebars:** A fixed 280px left-hand sidebar is used for main quest navigation, utilizing the primary Maroon color to frame the white content area.
- **Content Blocks:** Information is grouped in distinct cards with 24px internal padding, creating clear separation between different study modules.

## Elevation & Depth

This system avoids heavy drop shadows in favor of **Tonal Layers** and **Tactile Outlines**. 

- **Surface 0:** Pure white background.
- **Surface 1:** Off-white backgrounds for nested lists or inactive sidebar states.
- **Cards:** Use a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to lift from the background. 
- **Active State:** When a card or element is focused, it gains a 2px solid Maroon or Gold border rather than a shadow increase, maintaining a clean, structured appearance.
- **Buttons:** Employ a subtle bottom-offset shadow (2px) to give them a "clickable" physical button feel, reminiscent of game UI.

## Shapes

The shape language is consistently **Rounded**. A 0.625rem (10px) base radius is applied to all cards and primary containers. This "softness" balances the aggressive Maroon color, making the platform feel approachable for students.

Interactive elements like buttons and input fields follow this 10px radius. Progress bars and "pills" use a full-radius (pill-shaped) design to emphasize the fluid nature of growth and progress.

## Components

### Buttons
- **Primary:** Solid Maroon background, White text, 10px border radius. On hover, apply a 2px bottom shadow to simulate a physical press.
- **Secondary:** Gold background with Black text, used strictly for "Level Up" or "Claim Reward" actions.

### XP Bars & Progress
- **Container:** Slate Gray background, 12px height, fully rounded.
- **Fill:** Gold (#FFD700) with a subtle diagonal stripe pattern for "Active" states.
- **Labels:** XP values (e.g., "450 / 1000") sit above the bar in `label-bold` style.

### Quest Cards
- White background, 10px radius, 1px light gray border.
- **Hover State:** The left border thickens to 4px Maroon, and the card lifts slightly.
- **Status Icons:** Checkmarks in Success Green or lock icons in Slate Gray.

### Streak Flames & Badges
- **Streak Flame:** Uses a vibrant gradient from Warning Amber to Heart Red. Accompanied by a bold number count.
- **Badges:** Circular containers with Gold borders. The interior icon uses high-contrast vector art.

### Input Fields
- 10px radius, 2px Light Gray border. Focused state changes border to Maroon.
- Labels are always positioned above the field in `label-bold` to maintain the "form-heavy" academic look.