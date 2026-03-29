import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já está em uso');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmailWithHash(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // ─── Novos métodos para refresh token ────────────────────────────────────

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateRefreshToken(id: string, refreshTokenHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }

  async clearRefreshToken(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash: null },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Usuário não encontrado');

    let passwordHash: string | undefined;
    if (dto.password) passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        name: dto.name,
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Usuário não encontrado');

    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }
}
