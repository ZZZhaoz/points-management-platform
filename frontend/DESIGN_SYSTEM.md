# LoyaltyHub Design System Guide

## Overview

This document describes the comprehensive design system implemented for the LoyaltyHub frontend. The design is professional, polished, fun, and quirky - perfect for a modern loyalty program application.

## Design Principles

1. **Professional**: Clean, modern, and trustworthy
2. **Polished**: Attention to detail, smooth animations, consistent spacing
3. **Fun & Quirky**: Playful emojis, vibrant colors, engaging interactions
4. **Accessible**: Clear typography, good contrast, responsive design

## Color Palette

### Primary Colors
- **Primary**: `#6366f1` (Indigo) - Main brand color
- **Primary Dark**: `#4f46e5` - Hover states
- **Primary Light**: `#818cf8` - Light accents
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` - Eye-catching gradients

### Accent Colors (Playful & Energetic)
- **Purple**: `#a855f7`
- **Pink**: `#ec4899`
- **Orange**: `#f97316`
- **Teal**: `#14b8a6`
- **Yellow**: `#eab308`

### Semantic Colors
- **Success**: `#10b981` (Green) - Positive actions, confirmations
- **Warning**: `#f59e0b` (Amber) - Warnings, important notices
- **Error**: `#ef4444` (Red) - Errors, destructive actions
- **Info**: `#3b82f6` (Blue) - Information, tips

### Neutral Colors
- Gray scale from `--gray-50` (lightest) to `--gray-900` (darkest)
- Used for backgrounds, borders, and text

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Headings
- **H1**: 2.5rem, bold, gradient text (for page titles)
- **H2**: 2rem, bold
- **H3**: 1.5rem, bold
- **H4**: 1.25rem, bold

### Body Text
- Base font size: 1rem (16px)
- Line height: 1.6
- Colors: `--text-primary`, `--text-secondary`, `--text-tertiary`

## Spacing System

Using CSS custom properties for consistent spacing:
- `--space-xs`: 0.25rem (4px)
- `--space-sm`: 0.5rem (8px)
- `--space-md`: 1rem (16px)
- `--space-lg`: 1.5rem (24px)
- `--space-xl`: 2rem (32px)
- `--space-2xl`: 3rem (48px)
- `--space-3xl`: 4rem (64px)

## Components

### Buttons

All buttons use the `.btn` base class with variants:

```jsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="error">Error</Button>
<Button variant="outline">Outline</Button>
```

Button sizes:
- `size="sm"` - Small
- `size="md"` - Medium (default)
- `size="lg"` - Large

### Cards

Use the Card components for content containers:

```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/global/Card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

### Forms

Use the Input component for form fields:

```jsx
<Input
  label="Field Label"
  placeholder="Placeholder text"
  value={value}
  onChange={setValue}
  required
  error={errorMessage}
/>
```

### Alerts

Use alert classes for messages:

```jsx
<div className="alert alert-success">Success message</div>
<div className="alert alert-warning">Warning message</div>
<div className="alert alert-error">Error message</div>
<div className="alert alert-info">Info message</div>
```

### Badges

For status indicators and labels:

```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-error">Error</span>
```

## Page Structure

### Standard Page Layout

```jsx
<div className="page-container">
  <div className="page-header">
    <h1 className="page-title">Page Title 🎨</h1>
    <p className="page-subtitle">Page description</p>
  </div>
  
  {/* Page content */}
</div>
```

### Authentication Pages

Use the shared auth page styles:

```jsx
import "./auth/AuthPage.css";

<div className="auth-page">
  <div className="auth-container">
    <div className="auth-header">
      <span className="auth-icon">🎁</span>
      <h1 className="auth-title">Page Title</h1>
      <p className="auth-subtitle">Description</p>
    </div>
    {/* Form content */}
  </div>
</div>
```

## Loading & Empty States

### Loading State
```jsx
<div className="loading-container">
  <div className="loading-spinner"></div>
  <p>Loading...</p>
</div>
```

### Empty State
```jsx
<div className="empty-state">
  <div className="empty-state-icon">📭</div>
  <div className="empty-state-title">No items found</div>
  <div className="empty-state-text">Check back later!</div>
</div>
```

## Transaction Type Colors

Use consistent colors for transaction types:
- **Purchase**: Green (`var(--success)`)
- **Redemption**: Orange (`var(--warning)`)
- **Adjustment**: Purple (`var(--accent-purple)`)
- **Transfer**: Blue (`var(--info)`)
- **Event**: Red (`var(--error)`)

## Icons & Emojis

We use emojis for a fun, approachable feel:
- 🎁 Promotions
- ⭐ Points
- 📱 QR Codes
- 💸 Transactions
- 🎪 Events
- 👤 Users
- 💰 Cashier
- 👔 Manager
- 👑 Superuser

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Considerations
- Stack elements vertically
- Reduce font sizes
- Increase touch targets
- Simplify navigation

## Animation Guidelines

### Transitions
- Fast: 150ms
- Base: 200ms
- Slow: 300ms

### Common Animations
- Fade in: `animation: fadeIn 0.3s ease-out`
- Slide in: `animation: slideIn 0.3s ease-out`
- Hover lift: `transform: translateY(-2px)`

## Shadows

Use shadow utilities for depth:
- `--shadow-sm`: Subtle elevation
- `--shadow-md`: Default cards
- `--shadow-lg`: Elevated cards
- `--shadow-xl`: Modals, dropdowns
- `--shadow-colored`: Special emphasis

## Best Practices

1. **Always use CSS variables** from the design system
2. **Consistent spacing** using the spacing scale
3. **Accessible colors** with sufficient contrast
4. **Mobile-first** responsive design
5. **Loading states** for all async operations
6. **Error handling** with clear messages
7. **Empty states** for better UX
8. **Fun but professional** - use emojis sparingly

## Updated Pages

### ✅ Completed
- ✅ Design System (index.css)
- ✅ Layout Components (Header, Footer, NavBar)
- ✅ Authentication Pages (Login, ForgotPassword, ResetPassword)
- ✅ Dashboard
- ✅ Profile Page
- ✅ Promotions Page (updated CSS)

### 🚧 In Progress / To Update

#### Regular User Pages
- UserQRPage
- TransferPage
- RedemptionPage
- RedemptionQRPage
- EventsListPage
- EventDetailPage
- TransactionsListPage

#### Cashier Pages
- transactions.jsx (Create Transaction)
- RedemptionTransaction.jsx

#### Organizer Pages
- Events.jsx
- EventDetail.jsx
- EventEdit.jsx
- AwardPoints.jsx

#### Manager Pages (May need to be created)
- Users list page
- All transactions page
- Transaction detail page
- Promotions CRUD pages
- Events CRUD pages

#### Superuser Pages
- UserPromotion.jsx

#### Other Pages
- ChangePassword.jsx

## Implementation Tips

1. **Start with the page structure** - use `page-container` and `page-header`
2. **Use existing components** - Button, Input, Card, etc.
3. **Follow the color scheme** - use semantic colors appropriately
4. **Add loading/empty states** - improve UX
5. **Make it responsive** - test on mobile
6. **Add playful touches** - emojis, animations, gradients
7. **Keep it consistent** - follow existing patterns

## Quick Reference

### CSS Variables
All design tokens are in `/frontend/client/src/index.css` as CSS custom properties.

### Component Location
- Global components: `/frontend/client/src/components/global/`
- Layout components: `/frontend/client/src/components/layout/`
- Page-specific components: `/frontend/client/src/components/{feature}/`

### Import Pattern
```jsx
import Button from "../components/global/Button";
import Input from "../components/global/Input";
import { Card, CardHeader, CardTitle, CardContent } from "../components/global/Card";
```

---

**Remember**: Keep it professional, polished, fun, and quirky! 🎨✨

