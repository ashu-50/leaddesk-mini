import { SetMetadata } from '@nestjs/common';
import type { CustomDecorator } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';

/**
 * Sets the human-readable `message` field of the standard API envelope.
 * Keeps controllers declarative — they never build the envelope by hand.
 */
export const ResponseMessage = (message: string): CustomDecorator<string> =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
