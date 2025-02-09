import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth/auth';
import DivisionGroupService from './divisionGroupService';
import { Session } from 'next-auth';
import GammaService from './gammaService';
import ExpenseService from './expenseService';
import InvoiceService from './invoiceService';
import NameListService from './nameListService';

/**
 * Service for handling the session of the current user
 */
export default class SessionService {
  private static async getSession() {
    return await getServerSession(authConfig);
  }

  static async getUser(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user;
  }

  static async getGammaUser(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await GammaService.getUser(session?.user?.id!)
      : null;
  }

  static async getActiveGroups(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await DivisionGroupService.getUserActiveGroups(session?.user?.id!)
      : [];
  }

  static async getGroups(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await DivisionGroupService.getUserGroups(session?.user?.id!)
      : [];
  }

  static async getSuperGroups(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    const groups = this.getGroups(session);
    return session?.user?.id
      ? (await groups).map((g) => {
          return {
            post: g.post,
            group: g.group.superGroup
          };
        })
      : [];
  }

  static async getInvoices(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await InvoiceService.getForUser(session?.user?.id!)
      : [];
  }

  static async getExpenses(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await ExpenseService.getForUser(session?.user?.id!)
      : [];
  }

  static async getNameLists(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await NameListService.getForUser(session?.user?.id!)
      : [];
  }

  static async getActiveGroupsWithPosts(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await DivisionGroupService.getUserActiveGroupsWithPosts(
          session?.user?.id!
        )
      : [];
  }

  static async getGroupsWithPosts(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await DivisionGroupService.getUserGroupsWithPosts(session?.user?.id!)
      : [];
  }

  static async canEditGroup(gammaSuperGroupId: string, s?: Session | null) {
    const session = s ?? (await SessionService.getSession());

    const activeGroups = session?.user?.id
      ? await DivisionGroupService.getUserActiveGroups(session?.user?.id!)
      : [];
    return activeGroups.some((g) => g.superGroup!.id === gammaSuperGroupId);
  }

  static async isTreasurerInGroup(gammaGroupId: string, s?: Session | null) {
    const session = s ?? (await SessionService.getSession());

    const groups = session?.user?.id
      ? await DivisionGroupService.getUserGroupsWithPosts(session?.user?.id!)
      : [];

    const post = groups.find((g) => g.group.id === gammaGroupId)?.post;
    if (!post) {
      return false;
    }

    const treasurerPostId = process.env.TREASURER_POST_ID;
    return post.id === treasurerPostId;
  }

  static async isActive(s?: Session | null) {
    const session = s ?? (await SessionService.getSession());
    return session?.user?.id
      ? await DivisionGroupService.isUserActive(session?.user?.id!)
      : false;
  }

  static async isDivisionTreasurer(s?: Session | null) {
    const session = s ?? (await this.getSession());

    const adminGroups = (process.env.BOARD_GROUP || 'styrit').split(',');
    const groups = this.getActiveGroupsWithPosts();

    return session?.user?.id
      ? (await groups).some(
          (g) =>
            g.post.id === process.env.TREASURER_POST_ID &&
            adminGroups.includes(g.group.superGroup!.name)
        )
      : false;
  }
}
