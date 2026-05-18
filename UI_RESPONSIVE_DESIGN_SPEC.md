# SCHOOL ERP — UI & RESPONSIVE DESIGN SPECIFICATION

> This document defines how every screen must look and behave across Android, iOS, and Web.
> Every component, layout, spacing, and breakpoint is specified here.
> Follow this exactly when building any screen in the auth module.

---

## Devices To Support

| Device | Screen Width | Notes |
|---|---|---|
| Android phone | 360px – 420px | Most common: 390px |
| iPhone | 375px – 430px | Most common: 390px |
| Android tablet | 600px – 840px | Portrait and landscape |
| iPad | 768px – 1024px | Portrait and landscape |
| Web browser | 1024px – 1440px+ | Desktop and laptop |

---

## Breakpoints

Define these in `constants/breakpoints.ts` and use throughout the app:

```ts
export const Breakpoints = {
  mobile: 0,      // 0px – 599px
  tablet: 600,    // 600px – 1023px
  desktop: 1024,  // 1024px and above
};
```

Use this hook in every screen:

```ts
// hooks/useBreakpoint.ts
import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '../constants/breakpoints';

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    isMobile: width < Breakpoints.tablet,
    isTablet: width >= Breakpoints.tablet && width < Breakpoints.desktop,
    isDesktop: width >= Breakpoints.desktop,
    width,
  };
}
```

---

## Layout Rules Per Breakpoint

### Mobile (< 600px)
- Full screen layout, no centering
- Content fills entire width with horizontal padding of 20px
- Card takes full width minus padding
- Font sizes normal (base)
- Buttons full width
- Logo size: 64px
- Single column layout

### Tablet (600px – 1023px)
- Content centered with max width of 520px
- Card has shadow and rounded corners
- Padding inside card: 32px
- Logo size: 80px
- Buttons full width inside card
- Background shows gradient or pattern behind card

### Desktop (1024px+)
- Two-column layout OR centered card
- Card max width: 480px, centered on screen
- Card has strong shadow and border
- Padding inside card: 40px
- Logo size: 96px
- Buttons full width inside card
- Left side can show illustration or school branding
- Background: light gray with subtle pattern

---

## Color System

Define in `constants/colors.ts`:

```ts
export const Colors = {
  // Primary
  primary: '#1E40AF',
  primaryLight: '#3B82F6',
  primaryDark: '#1E3A8A',
  primaryXLight: '#EFF6FF',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Neutrals
  white: '#FFFFFF',
  background: '#F3F4F6',
  cardBg: '#FFFFFF',
  border: '#E5E7EB',
  borderFocus: '#3B82F6',
  inputBg: '#F9FAFB',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // Gradient
  gradientStart: '#1E40AF',
  gradientEnd: '#3B82F6',
};
```

---

## Typography Scale

Define in `constants/typography.ts`:

```ts
export const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,

  // Weights (use as fontWeight values)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};
```

---

## Spacing System

Define in `constants/spacing.ts`:

```ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
};
```

---

## Reusable Component Specs

### Button component

```
Variants: primary | secondary | outline | ghost
Sizes: sm | md | lg

Height:
  sm → 36px
  md → 48px  ← default
  lg → 56px

Border radius: 12px
Font size: 15px (md), 13px (sm), 17px (lg)
Font weight: 600
Full width by default on all screens

Primary:
  Background: #1E40AF
  Text: #FFFFFF
  Pressed: #1E3A8A (darken)

Secondary:
  Background: #EFF6FF
  Text: #1E40AF
  Border: #BFDBFE

Outline:
  Background: transparent
  Text: #1E40AF
  Border: 1.5px #1E40AF

Loading state:
  Show ActivityIndicator (white for primary, blue for others)
  Disable press while loading

Disabled state:
  Opacity: 0.5
  No press feedback
```

### Input component

```
Height: 52px
Border radius: 12px
Border: 1.5px #E5E7EB
Background: #F9FAFB
Padding horizontal: 16px
Font size: 15px
Font color: #111827
Placeholder color: #9CA3AF

Focus state:
  Border color: #3B82F6
  Background: #FFFFFF
  Show subtle blue shadow: 0 0 0 3px rgba(59,130,246,0.15)

Error state:
  Border color: #EF4444
  Background: #FFF5F5
  Show error message below in red #EF4444, font size 12px

Label above input:
  Font size: 13px
  Font weight: 600
  Color: #374151
  Margin bottom: 6px

Icon inside input (left or right):
  Size: 20px
  Color: #9CA3AF (gray)
  Focus: #3B82F6 (blue)
```

### Card component

```
Background: #FFFFFF
Border radius:
  Mobile: 0px (full screen, no card visible)
  Tablet: 20px
  Desktop: 20px

Shadow:
  Mobile: none
  Tablet: 0 4px 24px rgba(0,0,0,0.08)
  Desktop: 0 8px 40px rgba(0,0,0,0.10)

Border:
  Mobile: none
  Tablet: 1px solid #F3F4F6
  Desktop: 1px solid #F3F4F6

Padding:
  Mobile: 24px horizontal, screen fills naturally
  Tablet: 32px all sides
  Desktop: 40px all sides

Max width:
  Mobile: 100%
  Tablet: 520px centered
  Desktop: 480px centered
```

### RoleSelector component

```
Design: 3 tab pills in a row
Container:
  Background: #F3F4F6
  Border radius: 12px
  Padding: 4px
  Full width

Each tab:
  Height: 40px
  Border radius: 10px
  Font size: 14px
  Font weight: 500

Active tab:
  Background: #FFFFFF
  Text color: #1E40AF
  Shadow: 0 1px 4px rgba(0,0,0,0.10)

Inactive tab:
  Background: transparent
  Text color: #6B7280

Icons in tabs:
  Admin: shield icon
  Teacher: book-open icon
  Parent: users icon
  Size: 16px, margin right 6px
```

### OTPInput component

```
6 individual boxes in a row
Gap between boxes: 10px

Each box:
  Width: 48px
  Height: 56px
  Border radius: 12px
  Border: 1.5px solid #E5E7EB
  Background: #F9FAFB
  Font size: 22px
  Font weight: 700
  Text align: center
  Color: #111827

Active/focused box:
  Border: 2px solid #3B82F6
  Background: #FFFFFF
  Shadow: 0 0 0 3px rgba(59,130,246,0.15)

Filled box:
  Border: 1.5px solid #10B981
  Background: #F0FDF4

Error state:
  Border: 1.5px solid #EF4444
  Shake animation (horizontal, 300ms)

On mobile: boxes shrink to 44px width if screen < 360px
On tablet/web: boxes can be 52px wide
```

### PasswordStrength indicator

```
Shows below new password field
4 bar segments in a row
Gap: 4px

Strength levels:
  Empty:  all gray (#E5E7EB)
  Weak:   1 bar red (#EF4444)
  Fair:   2 bars orange (#F59E0B)
  Good:   3 bars blue (#3B82F6)
  Strong: 4 bars green (#10B981)

Label right of bars:
  Font size: 12px
  Color matches active bar color
  Text: "Weak" | "Fair" | "Good" | "Strong"

Bar height: 4px
Bar border radius: 2px
Animate fill with 300ms transition
```

---

## Screen-by-Screen Specs

---

### Splash Screen

```
Layout: centered, full screen

Background:
  Gradient from #1E40AF (top) to #3B82F6 (bottom)

Content (centered vertically and horizontally):
  - School logo (white, 96px × 96px)
  - App name "School ERP" (white, 28px, bold)
  - Tagline "Smart School Management" (white 70% opacity, 14px)
  - Loading dots animation below (3 dots, fade in/out sequence)

Loading dots:
  Each dot: 8px circle, white
  Gap: 8px
  Animation: dot 1 fades first, then dot 2, then dot 3, loop
  Each dot delay: 200ms
  Duration: 600ms per dot

Auto navigate to login after 2.5 seconds

All devices: same full-screen gradient layout
```

---

### Login Screen

#### Mobile layout
```
No card visible — content directly on white background

Top section (gradient header):
  Height: 220px
  Background: gradient #1E40AF → #3B82F6
  Content centered:
    - Logo (white, 64px) top
    - "Welcome Back" (white, 26px bold) below
    - "Sign in to your account" (white 70%, 14px) below

Bottom section (white, full width):
  Padding: 24px horizontal
  Border radius top: 28px (overlaps the gradient header)
  Pulls up slightly over the gradient

  Elements in order:
    1. RoleSelector (full width)
       Margin top: -20px (overlaps header bottom slightly)
    2. Spacing: 24px
    3. Input: "Email or Mobile"
    4. Spacing: 16px
    5. PasswordInput: "Password"
    6. Row: "Remember me" checkbox LEFT | "Forgot Password?" link RIGHT
       Margin top: 12px
    7. Spacing: 28px
    8. Login Button (full width, height 52px)
```

#### Tablet layout
```
Full screen background: #F3F4F6

Centered card (max 520px wide):
  Padding: 32px
  Shadow and border radius: 20px

  Inside card:
    - Logo centered (80px)
    - "Welcome Back" centered (24px bold) below logo
    - "School ERP" subtitle (14px, muted) below
    - Divider line
    - RoleSelector
    - Spacing: 20px
    - Email input
    - Password input
    - Remember me + Forgot password row
    - Login button

  Behind card: subtle blue gradient blob or pattern
```

#### Desktop layout
```
Two column layout:

Left column (50% width):
  Background: gradient #1E40AF → #1E3A8A
  Content centered:
    - School logo large (120px)
    - App name large (36px, white, bold)
    - Tagline (16px, white 70%)
    - 3 feature points with icons:
        ✓ Manage Students & Teachers
        ✓ Track Attendance & Fees
        ✓ Parent Communication Portal
    - Each point: checkmark icon + 14px white text

Right column (50% width):
  Background: #F3F4F6
  Card centered vertically:
    Max width 440px, padding 40px
    Same card content as tablet layout
```

---

### Forgot Password Screen

#### Mobile layout
```
Back button (top left): arrow icon + "Back"

Top area:
  Icon: email/key icon in blue circle (64px circle, 32px icon)
  Title: "Forgot Password?" (22px, bold)
  Subtitle: "Enter your email or mobile. We'll send an OTP." (14px, muted, centered)
  Margin from top: 60px

Content:
  Padding: 24px
  Input: "Email or Mobile"
  Spacing: 24px
  Button: "Send OTP" (full width)
  Spacing: 20px
  "Remember your password? Sign In" link (centered, 14px)
```

#### Tablet / Desktop layout
```
Centered card same as login tablet layout
Max width: 440px
Same content as mobile, just inside card with padding
```

---

### OTP Screen

#### Mobile layout
```
Back button top left

Top area (centered):
  Icon: phone/message icon in blue circle (64px)
  Title: "Verify OTP" (22px bold)
  Subtitle: "Enter the 6-digit OTP sent to" (14px muted)
  Identifier shown bold below subtitle (phone/email)

OTP input row:
  6 boxes in a row, centered
  Full width up to 340px max, centered horizontally
  Margin top: 32px

Below OTP boxes:
  Countdown timer centered:
    "Resend OTP in 0:45" (14px, muted)
    OR
    "Resend OTP" link (blue, 14px) when timer reaches 0

  Spacing: 32px
  Verify OTP button (full width)
```

#### Tablet / Desktop layout
```
Centered card, max 440px
Same content, OTP boxes centered inside card
```

---

### Reset Password Screen

#### Mobile layout
```
Back button top left

Top area:
  Icon: lock icon in blue circle (64px)
  Title: "Reset Password" (22px bold)
  Subtitle: "Create a strong new password" (14px muted)

Content:
  Padding: 24px
  New Password input (with show/hide)
  Password strength bar (shows immediately when typing)
  Spacing: 16px
  Confirm Password input (with show/hide)
  Spacing: 28px
  Reset Password button (full width)
```

#### Tablet / Desktop layout
```
Centered card, max 440px, same content inside
```

---

## Animation Specs

```
Screen transitions:
  Type: slide from right (push navigation)
  Duration: 280ms
  Easing: ease-in-out

Button press:
  Scale down to 0.97 on press
  Duration: 100ms

Input focus:
  Border color transition: 150ms
  Shadow fade in: 200ms

OTP box fill:
  Scale pulse: 1.0 → 1.08 → 1.0
  Duration: 200ms

Role tab switch:
  Background slide animation: 200ms ease

Error shake (OTP wrong):
  translateX: 0 → -8 → 8 → -6 → 6 → 0
  Duration: 300ms

Loading spinner:
  Rotate continuously
  Duration: 800ms per rotation

Splash dots:
  Opacity: 0.3 → 1.0 → 0.3
  Stagger: 200ms between each dot
```

---

## Platform-Specific Fixes

### iOS specific
```tsx
// Safe area — wrap every screen root with SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';

// Keyboard avoiding — use KeyboardAvoidingView on login/forms
import { KeyboardAvoidingView, Platform } from 'react-native';
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

// Bottom home bar — add paddingBottom: 20 on last button
// to avoid the iOS home indicator overlap

// Input return key — use returnKeyType="next" and ref focus chain
// so tapping Next on keyboard moves to next field
```

### Android specific
```tsx
// Status bar — use translucent status bar on gradient screens
import { StatusBar } from 'expo-status-bar';
<StatusBar style="light" translucent backgroundColor="transparent" />

// Keyboard — use KeyboardAvoidingView
behavior={Platform.OS === 'android' ? 'height' : 'padding'}

// Ripple effect on buttons — use Pressable with android_ripple
android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}

// Back button — handle Android hardware back button
// on OTP and Reset Password screens to go back properly
```

### Web specific
```tsx
// Max width container — on web wrap screens with:
<View style={{ flex: 1, alignItems: 'center', backgroundColor: '#F3F4F6' }}>
  <View style={{ width: '100%', maxWidth: 1200, flex: 1 }}>
    ...
  </View>
</View>

// Cursor pointer on buttons and links
// In NativeWind use: className="cursor-pointer"

// Focus outline on inputs — keep browser default outline
// or style it with blue border to match design

// Hover states on buttons
// className="hover:opacity-90 transition-opacity"

// Scrollable forms — use ScrollView with
// contentContainerStyle={{ flexGrow: 1 }}
// so short screens don't show blank space below

// No touch ripple on web — conditionally skip android_ripple
// when Platform.OS === 'web'
```

---

## NativeWind Class Reference

Use these consistent classes everywhere:

```
Backgrounds:
  bg-white         → card backgrounds
  bg-gray-50       → screen backgrounds
  bg-blue-700      → primary buttons, headers
  bg-blue-50       → role selector active tab

Text:
  text-gray-900    → primary text
  text-gray-500    → secondary/muted text
  text-gray-400    → placeholder text
  text-blue-700    → links, active states
  text-white       → text on dark backgrounds

Borders:
  border-gray-200  → default input border
  border-blue-500  → focused input border
  border-red-400   → error input border

Radius:
  rounded-xl       → inputs, buttons (12px)
  rounded-2xl      → cards (16px)
  rounded-full     → pills, avatars

Shadows:
  shadow-sm        → subtle card shadow
  shadow-md        → default card shadow
  shadow-lg        → elevated card shadow

Padding:
  p-5              → card mobile padding (20px)
  p-8              → card tablet padding (32px)
  p-10             → card desktop padding (40px)
  px-5 py-3        → button padding

Typography:
  text-sm          → 14px labels, captions
  text-base        → 16px body text
  text-lg          → 18px subheadings
  text-xl          → 20px headings
  text-2xl         → 24px screen titles
  font-medium      → 500 weight
  font-semibold    → 600 weight
  font-bold        → 700 weight
```

---

## File Structure For UI

```
src/
 └── components/
      └── ui/
           ├── Button.tsx          ← variant + size + loading
           ├── Input.tsx           ← label + error + icon slots
           ├── PasswordInput.tsx   ← show/hide toggle built in
           ├── Card.tsx            ← responsive padding + shadow
           ├── OTPInput.tsx        ← 6 boxes + auto focus + shake
           ├── RoleSelector.tsx    ← 3 animated tabs
           ├── PasswordStrength.tsx← 4 bar strength indicator
           ├── Loader.tsx          ← full screen + inline variants
           ├── Header.tsx          ← gradient header block
           ├── BackButton.tsx      ← arrow + label, platform aware
           └── KeyboardView.tsx    ← KeyboardAvoidingView wrapper
```

---

## Screen Wrapper Template

Every auth screen must use this wrapper:

```tsx
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function AnyScreen() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Screen content here */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

---

## Checklist — Before Marking Any Screen Done

Test every screen against this list:

- [ ] Renders correctly on 375px wide (iPhone SE size)
- [ ] Renders correctly on 390px wide (standard phone)
- [ ] Renders correctly on 768px wide (tablet portrait)
- [ ] Renders correctly on 1280px wide (desktop browser)
- [ ] Keyboard does not cover inputs on Android
- [ ] Keyboard does not cover inputs on iOS
- [ ] Safe area respected on iPhone (notch + home bar)
- [ ] All text is readable (no overflow, no clipping)
- [ ] Buttons are minimum 48px tall (touch target)
- [ ] Error messages display correctly under inputs
- [ ] Loading state shows on button press
- [ ] Back navigation works correctly
- [ ] No horizontal scroll on any screen
- [ ] Gradient header looks correct on all sizes
- [ ] Role selector tabs fit in one row on all sizes
- [ ] OTP boxes all fit in one row on small screens
- [ ] Password strength bar visible and animates
- [ ] Web version has max-width container (not stretched)
- [ ] Web version has hover states on buttons and links
- [ ] Animations are smooth (no jank)
