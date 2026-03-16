# Interactive Document – Auth Screens Design  
## 1. Login & Sign Up Screens: Google-Inspired Polish

**Objective**  
Create minimalist, trust-building authentication screens for both login and sign-up. Use centered cards, subtle elevation, clear visual hierarchy, and prominent blue primary actions — closely aligned with modern Google Workspace / account sign-in and sign-up experiences. The designs emphasize simplicity, accessibility, reduced friction, and a cohesive look between the two flows so users feel they are part of the same polished product.

### Key Design Decisions (Shared Across Login & Sign Up)

- **Layout**  
  Full-screen centered container:  
  `flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900`

- **Container**  
  MUI `Card` component with:  
  - moderate shadow (`shadow-lg`)  
  - generous internal padding (`p-8`)  
  - rounded corners (`rounded-xl`)  
  - constrained width (`max-w-sm w-full`)

- **Inputs**  
  `TextField` outlined variant, fullWidth, with clear, concise labels

- **Primary Action**  
  Contained `Button` (primary blue) for the main CTA ("Sign in" or "Create account")  
  - large size  
  - full width  
  - disabled + loading text during submission

- **Secondary Links**  
  Typography `body2` with underlined hover links for flow switching:  
  "Already have an account? Sign in" ↔ "Don't have an account? Create one"  
  Additional login link: "Forgot password?"

- **Optional Social Login**  
  Outlined button for Google OAuth (to reduce signup friction)

- **Animation**  
  Subtle entry: MUI `Fade` with 400ms timeout

- **Form Handling**  
  - `react-hook-form` for real-time validation and error states  
  - TanStack Query mutation for API calls (`/auth/login`, `/auth/register`)  
  - Inline error messages (red helper text via `error` + `helperText`)  
  - Button shows loading state (`disabled` + "Signing in..." / "Creating account...")

- **Consistency Requirements**  
  - Identical card styling, typography scale, spacing, color palette  
  - Matching hover/focus states and dark mode support  
  - Reusable components encouraged (see MUI Library suggestions below)

### 1.1 Login Screen

**Purpose**  
Authenticate returning users

**Main action**  
"Sign in"

**Fields**  
- Email  
- Password

**Secondary links**  
- "Forgot password?"  
- "Create account"

**Reference Implementation** (`app/login/page.tsx`)

```tsx
import { Card, TextField, Button, Typography, Fade, Link } from '@interactive-document/material-ui';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api'; // your Fastify API client

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const mutation = useMutation((data) => api.post('/auth/login', data));

  const onSubmit = (data) => mutation.mutate(data, {
    onSuccess: () => window.location.href = '/dashboard',
    onError: (err) => console.error('Login failed:', err),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Fade in timeout={400}>
        <Card className="p-8 max-w-sm w-full shadow-lg rounded-xl">
          <Typography variant="h5" className="text-center mb-6 font-medium">
            Sign in to Interactive Document
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <TextField
              label="Email"
              fullWidth
              {...register('email', { required: true })}
              error={!!errors.email}
              helperText={errors.email ? 'Email is required' : ''}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register('password', { required: true })}
              error={!!errors.password}
              helperText={errors.password ? 'Password is required' : ''}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              type="submit"
              className="py-3"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <Typography variant="body2" className="text-center mt-6 text-gray-600 dark:text-gray-400">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
            {' '}•{' '}
            <Link href="/register" className="text-blue-600 hover:underline">Create account</Link>
          </Typography>
        </Card>
      </Fade>
    </div>
  );
}
```