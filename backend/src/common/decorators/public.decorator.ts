import { SetMetadata } from '@nestjs/common';
import type { CustomDecorator } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Authentication is enabled globally (see `APP_GUARD` in `AppModule`).
 * `@Public()` is the explicit, greppable opt-out for the handful of
 * endpoints the public website needs.
 */
export const Public = (): CustomDecorator<string> => SetMetadata(IS_PUBLIC_KEY, true);
