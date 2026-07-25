'use client';

/* eslint-disable react-hooks/incompatible-library --
 * react-hook-form returns new function identities on each render, so the
 * React Compiler declines to memoise this component. That is expected and
 * harmless here: nothing from `useForm` is passed into a memoised child.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { SendIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api-error';
import { BUDGET_LABELS } from '@/lib/constants';
import { BUDGET_RANGES } from '@/types/lead';
import { useCreateLead } from '../hooks/use-create-lead';
import {
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  createLeadSchema,
  type CreateLeadInput,
} from '../schemas/lead.schema';

/**
 * The public capture form.
 *
 * Validation runs on blur and then on every change once a field has been
 * corrected, so nobody is told they are wrong while they are still halfway
 * through typing.
 */
export function LeadForm() {
  const createLead = useCreateLead();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { name: '', email: '', message: '' },
  });

  const messageLength = watch('message')?.length ?? 0;
  const isBusy = isSubmitting || createLead.isPending;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createLead.mutateAsync(values);

      toast.success('Enquiry sent', {
        description: 'We reply to everything within one working day.',
      });

      reset();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.displayMessage : 'Your enquiry could not be sent',
      );
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="lead-name">Your name</FieldLabel>
          <Input
            id="lead-name"
            autoComplete="name"
            placeholder="Ananya Sharma"
            aria-invalid={errors.name ? true : undefined}
            disabled={isBusy}
            {...register('name')}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </Field>

        <Field data-invalid={errors.email ? true : undefined}>
          <FieldLabel htmlFor="lead-email">Email</FieldLabel>
          <Input
            id="lead-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@studio.com"
            aria-invalid={errors.email ? true : undefined}
            disabled={isBusy}
            {...register('email')}
          />
          <FieldDescription>This is where the reply goes.</FieldDescription>
          <FieldError>{errors.email?.message}</FieldError>
        </Field>

        <Field data-invalid={errors.budget ? true : undefined}>
          <FieldLabel htmlFor="lead-budget">Budget range</FieldLabel>
          <Controller
            control={control}
            name="budget"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isBusy}>
                <SelectTrigger
                  id="lead-budget"
                  aria-invalid={errors.budget ? true : undefined}
                  className="w-full"
                >
                  <SelectValue placeholder="Pick the closest range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {BUDGET_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {BUDGET_LABELS[range]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldDescription>An estimate is fine — it only sets expectations.</FieldDescription>
          <FieldError>{errors.budget?.message}</FieldError>
        </Field>

        <Field data-invalid={errors.message ? true : undefined}>
          <FieldLabel htmlFor="lead-message">What do you need?</FieldLabel>
          <Textarea
            id="lead-message"
            rows={5}
            placeholder="A few sentences about the project, the timeline and what success looks like."
            aria-invalid={errors.message ? true : undefined}
            disabled={isBusy}
            {...register('message')}
          />
          <FieldDescription>
            <span className="tabular font-mono text-xs">
              {messageLength}/{MESSAGE_MAX_LENGTH}
            </span>{' '}
            · at least {MESSAGE_MIN_LENGTH} characters
          </FieldDescription>
          <FieldError>{errors.message?.message}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          We use your details to reply to this enquiry, nothing else.
        </p>
        <Button type="submit" disabled={isBusy} className="sm:w-auto">
          {isBusy ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
          {isBusy ? 'Sending…' : 'Send enquiry'}
        </Button>
      </div>
    </form>
  );
}
