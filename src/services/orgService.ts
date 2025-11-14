import prisma from '@/prisma';

export default class OrgService {
  static async getAll() {
    return await prisma.organization.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  static async getById(id: number) {
    const organization = await prisma.organization.findUnique({
      where: {
        id
      }
    });
    return organization;
  }

  static async create(name: string) {
    return await prisma.organization.create({
      data: {
        name
      }
    });
  }

  static async update(id: number, name: string) {
    return await prisma.organization.update({
      where: {
        id
      },
      data: {
        name
      }
    });
  }

  static async delete(id: number) {
    return await prisma.organization.delete({
      where: {
        id
      }
    });
  }
}