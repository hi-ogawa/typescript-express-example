import { Entity, BaseEntity, Column } from "typeorm";
import bcrypt from "bcrypt";
import { Timestamps } from "./utils";

export interface AuthenticationParameters {
  username: string;
  password: string;
}

const BCRYPT_ROUNDS = 10;

@Entity("users")
export class User extends BaseEntity {
  @Column({ primary: true, generated: true })
  id!: number;

  @Column({ nullable: false, unique: true })
  username!: string;

  @Column({ nullable: false })
  passwordHash!: string;

  @Column(() => Timestamps)
  timestamps: Timestamps = new Timestamps();

  verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  toResponse() {
    return { username: this.username };
  }

  static async register(
    params: Partial<AuthenticationParameters>
  ): Promise<User | undefined> {
    const { username, password } = params;
    if (!username || !password) {
      return undefined;
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    try {
      const user = this.create({ username, passwordHash });
      await user.save();
      return user;
    } catch (e) {
      return undefined;
    }
  }

  static async login(
    params: Partial<AuthenticationParameters>
  ): Promise<User | undefined> {
    const { username, password } = params;
    if (!username || !password) {
      return undefined;
    }
    const user = await this.findOne({ username });
    if (user && (await user.verifyPassword(password!))) {
      return user;
    }
    return undefined;
  }
}
