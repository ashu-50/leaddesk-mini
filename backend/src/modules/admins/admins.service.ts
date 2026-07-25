import { Injectable } from '@nestjs/common';
import type { Admin } from '@prisma/client';
import { AdminsRepository } from './admins.repository';

/** Owns everything about the Admin aggregate except credentials verification. */
@Injectable()
export class AdminsService {
  constructor(private readonly adminsRepository: AdminsRepository) {}

  findByEmail(email: string): Promise<Admin | null> {
    return this.adminsRepository.findByEmail(email);
  }

  findById(id: string): Promise<Admin | null> {
    return this.adminsRepository.findById(id);
  }
}
