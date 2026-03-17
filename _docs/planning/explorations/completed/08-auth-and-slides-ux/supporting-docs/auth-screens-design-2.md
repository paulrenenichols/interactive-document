### 1.2 Sign Up Screen

**Purpose**  
Onboard new users quickly and confidently with a clean, familiar form that matches the login screen's aesthetic.

**Main action**  
"Create account"

**Fields**

- Email
- Password
- Confirm password

**Secondary link**  
"Already have an account? Sign in"

**Reference Implementation** (`app/register/page.tsx`)

```tsx
import {
  Card,
  TextField,
  Button,
  Typography,
  Fade,
  Link,
} from '@interactive-document/material-ui';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch('password');
  const mutation = useMutation((data) => api.post('/auth/register', data));

  const onSubmit = (data) =>
    mutation.mutate(data, {
      onSuccess: () => (window.location.href = '/dashboard'),
      onError: (err) => console.error('Registration failed:', err),
    });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Fade in timeout={400}>
        <Card className="p-8 max-w-sm w-full shadow-lg rounded-xl">
          <Typography variant="h5" className="text-center mb-6 font-medium">
            Create your Interactive Document account
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
              {...register('password', { required: true, minLength: 8 })}
              error={!!errors.password}
              helperText={
                errors.password ? 'Password must be at least 8 characters' : ''
              }
            />
            <TextField
              label="Confirm password"
              type="password"
              fullWidth
              {...register('confirmPassword', {
                required: true,
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
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
              {mutation.isPending ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <Typography
            variant="body2"
            className="text-center mt-6 text-gray-600 dark:text-gray-400"
          >
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </Typography>
        </Card>
      </Fade>
    </div>
  );
}
```

