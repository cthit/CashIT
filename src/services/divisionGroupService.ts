import GammaService from "./gammaService";

export default class DivisionGroupService {

  static async getUserActiveGroupsWithPosts(cid: string) {
    return (await this.getUserGroupsWithPosts(cid)).filter((g) =>
      GammaService.isGroupActive(g.group)
    );
  }

  static async getUserGroupsWithPosts(cid: string) {
    return (await GammaService.getUser(cid)).groups;
  }

  static async getUserActiveGroups(cid: string) {
    return (await this.getUserActiveGroupsWithPosts(cid)).map((g) => g.group);
  }

  static async getUserGroups(cid: string) {
    return (await GammaService.getUser(cid)).groups;
  }

  static async isUserActive(cid: string): Promise<boolean> {
    return GammaService.getUser(cid).then((user) => {
      return user.groups.some((g) => GammaService.isGroupActive(g.group));
    });
  }
}
