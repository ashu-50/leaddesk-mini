'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

/**
 * Form layout primitives. Every form in the app is built from these, which is
 * what keeps label spacing, description placement and error styling identical
 * between the public enquiry form and the admin sign-in form.
 */
function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn('group/field-group flex w-full flex-col gap-5', className)}
      {...props}
    />
  );
}

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field"
      role="group"
      className={cn(
        'group/field flex w-full flex-col gap-2 data-[invalid=true]:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'w-fit gap-1 group-data-[disabled=true]/field:opacity-50 group-data-[invalid=true]/field:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-sm leading-normal font-normal text-muted-foreground group-data-[invalid=true]/field:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<'p'> & { children?: React.ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  );
}

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn('flex flex-col gap-5 disabled:opacity-60', className)}
      {...props}
    />
  );
}

function FieldLegend({ className, ...props }: React.ComponentProps<'legend'>) {
  return (
    <legend
      data-slot="field-legend"
      className={cn('mb-1 text-sm font-medium', className)}
      {...props}
    />
  );
}

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError, FieldSet, FieldLegend };
