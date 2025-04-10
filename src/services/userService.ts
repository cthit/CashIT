import prisma from '@/prisma';

export default class UserService {
  static async getById(gammaUserId: string) {
    return await prisma.user.findUnique({
      where: {
        gammaUserId
      }
    });
  }

  static async editEmail(gammaUserId: string, email: string | null) {
    return await prisma.user.upsert({
      where: {
        gammaUserId
      },
      update: {
        forwardEmail: email
      },
      create: {
        gammaUserId,
        forwardEmail: email
      }
    });
  }
}
