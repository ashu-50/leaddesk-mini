import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Genuinely cross-cutting infrastructure, so `@Global()` is warranted here —
 * feature modules never re-import it and never construct their own client.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
