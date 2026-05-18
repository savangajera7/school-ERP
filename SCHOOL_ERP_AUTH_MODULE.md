# SCHOOL ERP — AUTH MODULE DEVELOPMENT DOCUMENT

> **Scope:** Authentication module only. Do NOT build dashboard or ERP modules.
> **Goal:** Production-quality auth UI foundation, ready for .NET backend integration later.

---

## Project Overview

Build a modern School ERP frontend app with role-based authentication for:

| Role | Login Required |
|---|---|
| Admin | ✅ |
| Teacher | ✅ |
| Parent | ✅ |
| Student | ❌ (Std 1–8, not required) |

**Target Platforms:** Android · iOS · Web

---

## Technology Stack

| Purpose | Technology |
|---|---|
| Framework | React Native Expo |
| Web Support | React Native Web |
| Language | TypeScript |
| Styling | NativeWind (Tailwind for RN) |
| Navigation | Expo Router |
| Forms | React Hook Form |
| Validation | Zod |
| API Calls | Axios |
| API Cache | TanStack Query |
| State Management | Zustand |

---

## AI Coding Rules

Follow these strictly:

```
- TypeScript only — no JavaScript
- Expo Router for all navigation
- NativeWind only for styling — no StyleSheet unless absolutely necessary
- Functional components only — no class components
- React Hook Form for all forms
- Zod for all validation schemas
- Zustand for auth state management
- TanStack Query for all API calls
- Reusable components — no repeated UI code
- No inline styles
- Mobile-first responsive layouts (works on phone, tablet, web)
- Clean folder structure with proper naming conventions
- Modular architecture — small focused components
- No hardcoded values — use constants
- Dark/light theme compatible design
- Modern ERP UI style — clean, minimal, professional
```

---

## Step 1 — Project Setup

### Create Expo Project

```bash
npx create-expo-app school-erp -t expo-template-blank-typescript
cd school-erp
```

### Install Packages

```bash
npm install nativewind
npm install react-native-safe-area-context
npm install react-native-screens
npm install expo-router
npm install react-hook-form
npm install zod
npm install @hookform/resolvers
npm install zustand
npm install axios
npm install @tanstack/react-query
npm install react-native-svg
npm install expo-linear-gradient
npm install react-native-reanimated
```

### Configure NativeWind

Create/update the following files:

**`tailwind.config.js`**
```js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
```

**`babel.config.js`**
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**`global.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Import `global.css` in the root `_layout.tsx`.

---

## Step 2 — Folder Structure

Create this exact structure inside the project:

```
src/
 ├── app/
 │    ├── _layout.tsx              ← Root layout (QueryClient + auth guard)
 │    ├── index.tsx                ← Splash screen
 │    ├── (auth)/
 │    │    ├── _layout.tsx         ← Auth stack layout
 │    │    ├── login.tsx
 │    │    ├── forgot-password.tsx
 │    │    ├── otp.tsx
 │    │    └── reset-password.tsx
 │    └── (app)/
 │         └── dashboard.tsx       ← Placeholder only, not built yet
 │
 ├── components/
 │    ├── ui/
 │    │    ├── Button.tsx
 │    │    ├── Input.tsx
 │    │    ├── PasswordInput.tsx
 │    │    ├── Card.tsx
 │    │    ├── Loader.tsx
 │    │    └── Header.tsx
 │    ├── forms/
 │    │    └── FormField.tsx
 │    └── auth/
 │         ├── RoleSelector.tsx
 │         └── OTPInput.tsx
 │
 ├── services/
 │    ├── api/
 │    │    └── axiosInstance.ts
 │    └── auth/
 │         └── authService.ts
 │
 ├── store/
 │    └── authStore.ts
 │
 ├── hooks/
 │    └── useAuth.ts
 │
 ├── types/
 │    └── auth.types.ts
 │
 ├── utils/
 │    └── helpers.ts
 │
 └── constants/
      ├── colors.ts
      └── api.ts
```

---

## Step 3 — Auth Screens

### Screen 1: Splash Screen (`app/index.tsx`)

**Features:**
- School ERP logo (SVG or image)
- App name displayed prominently
- Smooth loading animation (fade or pulse)
- Auto-redirect to login after ~2 seconds
- Modern clean background with gradient

**UI Style:** Centered layout · Blue gradient · White text · Minimal

---

### Screen 2: Login Screen (`app/(auth)/login.tsx`)

**Form Fields:**
- Email or Mobile number (single field)
- Password

**Features:**
- Show / hide password toggle
- Remember me checkbox
- Forgot password link → navigates to forgot-password screen
- Login button (shows loading state on submit)
- Role selector (Admin / Teacher / Parent)

**Validation (Zod):**
```ts
z.object({
  identifier: z.string().min(1, "Email or mobile is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "teacher", "parent"]),
})
```

**UI Style:**
- Gradient header with school logo/name
- White card with soft shadow and rounded corners
- Role selector as tabs or segmented control (3 options)
- Responsive: stacked on mobile, card-centered on web/tablet

---

### Screen 3: Forgot Password Screen (`app/(auth)/forgot-password.tsx`)

**Form Fields:**
- Email or Mobile number

**Features:**
- Send OTP button
- Validation error messages
- Back to login link

**Validation (Zod):**
```ts
z.object({
  identifier: z.string().min(1, "Email or mobile is required"),
})
```

**UI Style:** Same card layout consistency as login · Clean and focused

---

### Screen 4: OTP Verification Screen (`app/(auth)/otp.tsx`)

**Form Fields:**
- 6-digit OTP (individual input boxes)

**Features:**
- Auto-focus next box on input
- Auto-submit when all 6 digits entered
- Resend OTP button
- 60-second countdown timer (disables resend until timer ends)
- Verify OTP button

**UI Style:** Large individual OTP input boxes · Centered · Modern UX

---

### Screen 5: Reset Password Screen (`app/(auth)/reset-password.tsx`)

**Form Fields:**
- New Password
- Confirm Password

**Features:**
- Show/hide toggle on both fields
- Password strength indicator (Weak / Medium / Strong)
- Confirm password must match validation
- Submit button

**Validation (Zod):**
```ts
z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
```

---

## Step 4 — Zustand Auth Store (`store/authStore.ts`)

Create a Zustand store with:

**State:**
```ts
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userData: UserData | null;
  role: "admin" | "teacher" | "parent" | null;
  isAuthenticated: boolean;
}
```

**Actions:**
```ts
login(token: string, refreshToken: string, user: UserData, role: Role): void
logout(): void
refreshSession(newToken: string): void
setUser(user: UserData): void
```

Use `persist` middleware to store tokens securely via AsyncStorage.

---

## Step 5 — Axios Setup (`services/api/axiosInstance.ts`)

**Create an Axios base instance with:**
- Base URL from environment variable (`EXPO_PUBLIC_API_URL`)
- Default headers including `Content-Type: application/json`
- Request interceptor: attach `Authorization: Bearer <token>` from Zustand store
- Response interceptor:
  - On 401: attempt token refresh via `POST /refresh-token`
  - If refresh succeeds: retry original request
  - If refresh fails: call `logout()` and redirect to login
- Global error handling for network errors

---

## Step 6 — Auth Service (`services/auth/authService.ts`)

**Mock all API responses for now. Do NOT connect real APIs.**

Create async functions with mock delays (`setTimeout`) simulating API calls:

```ts
loginUser(data: LoginPayload): Promise<LoginResponse>
forgotPassword(identifier: string): Promise<{ message: string }>
verifyOTP(identifier: string, otp: string): Promise<{ token: string }>
resetPassword(token: string, password: string): Promise<{ message: string }>
refreshToken(refreshToken: string): Promise<{ accessToken: string }>
getProfile(): Promise<UserData>
```

**Expected real API endpoints (for future integration):**
```
POST /login
POST /forgot-password
POST /verify-otp
POST /reset-password
POST /refresh-token
GET  /profile
```

---

## Step 7 — Types (`types/auth.types.ts`)

```ts
export type Role = "admin" | "teacher" | "parent";

export interface UserData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  schoolName: string;
  avatar?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}
```

---

## Step 8 — Reusable UI Components

### `components/ui/Button.tsx`
Props: `label`, `onPress`, `loading`, `variant` (primary/secondary/outline), `disabled`, `fullWidth`

### `components/ui/Input.tsx`
Props: `label`, `placeholder`, `value`, `onChangeText`, `error`, `keyboardType`, `autoCapitalize`

### `components/ui/PasswordInput.tsx`
Extends Input with built-in show/hide toggle icon

### `components/ui/Card.tsx`
White card container with soft shadow and rounded corners. Props: `children`, `className`

### `components/ui/Loader.tsx`
Full-screen or inline loading spinner using `ActivityIndicator`

### `components/ui/Header.tsx`
Gradient header bar. Props: `title`, `subtitle`, `showBack`

### `components/auth/RoleSelector.tsx`
Segmented tabs for Admin / Teacher / Parent selection. Props: `selected`, `onChange`

### `components/auth/OTPInput.tsx`
6-box OTP input with auto-focus. Props: `value`, `onChange`, `onComplete`

### `components/forms/FormField.tsx`
Wrapper combining React Hook Form `Controller` with Input. Handles error display.

---

## Step 9 — Design Tokens (`constants/colors.ts`)

```ts
export const Colors = {
  primary: "#1E40AF",       // Blue 700
  primaryLight: "#3B82F6",  // Blue 500
  primaryDark: "#1E3A8A",   // Blue 900
  secondary: "#FFFFFF",
  background: "#F3F4F6",    // Gray 100
  card: "#FFFFFF",
  border: "#E5E7EB",        // Gray 200
  text: "#111827",          // Gray 900
  textSecondary: "#6B7280", // Gray 500
  error: "#EF4444",         // Red 500
  success: "#10B981",       // Green 500
  warning: "#F59E0B",       // Amber 500
};
```

---

## Design Requirements Summary

| Property | Spec |
|---|---|
| Style | Modern ERP · Minimal · Professional |
| Primary Color | Blue (`#1E40AF`) |
| Background | Light Gray (`#F3F4F6`) |
| Cards | White · Soft shadow · Rounded corners (`rounded-2xl`) |
| Typography | Clean · Readable · Mobile-friendly spacing |
| Animations | Smooth · Subtle · No heavy animations |
| Responsive | Phone · Tablet · Web browser |

---

## Deliverables Checklist

- [ ] Expo project created with TypeScript
- [ ] NativeWind configured (tailwind + babel + css)
- [ ] Expo Router configured with auth/app route groups
- [ ] Folder structure created as specified
- [ ] `constants/colors.ts` created
- [ ] `types/auth.types.ts` created
- [ ] Zustand auth store with persist
- [ ] Axios base instance with interceptors
- [ ] Mock auth service for all 6 endpoints
- [ ] Reusable UI components (Button, Input, PasswordInput, Card, Loader, Header)
- [ ] Auth components (RoleSelector, OTPInput, FormField)
- [ ] Splash screen with animation
- [ ] Login screen with role selector + form validation
- [ ] Forgot password screen with form validation
- [ ] OTP screen with auto-focus + countdown timer
- [ ] Reset password screen with strength indicator
- [ ] Responsive layouts on mobile + tablet + web

---

## What NOT To Build

- ❌ Dashboard screens
- ❌ ERP modules (attendance, fees, grades, etc.)
- ❌ Real API integration (use mocks only)
- ❌ Student login
- ❌ Registration / signup flow
