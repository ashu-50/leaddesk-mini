'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogInIcon, TriangleAlertIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/lib/api-error';
import { useLogin } from '../hooks/use-login';
import { loginSchema, type LoginInput } from '../schemas/login.schema';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const login = useLogin(redirectTo);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const isBusy = isSubmitting || login.isPending;

  const failureMessage =
    login.error instanceof ApiError
      ? login.error.displayMessage
      : login.error
        ? 'Sign in failed. Try again.'
        : null;

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {failureMessage ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Could not sign in</AlertTitle>
          <AlertDescription>{failureMessage}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={errors.email ? true : undefined}>
          <FieldLabel htmlFor="admin-email">Email</FieldLabel>
          <Input
            id="admin-email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoFocus
            placeholder="admin@leaddesk.dev"
            aria-invalid={errors.email ? true : undefined}
            disabled={isBusy}
            {...register('email')}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>

        <Field data-invalid={errors.password ? true : undefined}>
          <FieldLabel htmlFor="admin-password">Password</FieldLabel>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={errors.password ? true : undefined}
            disabled={isBusy}
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isBusy} size="lg">
        {isBusy ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" />}
        {isBusy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
