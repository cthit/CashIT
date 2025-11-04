import prisma from '@/prisma';

export default class OrgService {
  static async getAll() {
    return await prisma.organization.findMany({
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
}