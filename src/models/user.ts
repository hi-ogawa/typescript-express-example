export interface AuthenticationParameters {
  username: string;
  password: string;
}

export default class User {
  static register(params: Partial<AuthenticationParameters>): User | undefined {
    const { username, password } = params;
    if (!username || !password) {
      return undefined;
    }
    // TODO
    const user = new User();
    return user;
  }

  toJson(): any {
    // TODO
    return {
      username: "xxx",
      token: "xxx",
    };
  }
}
