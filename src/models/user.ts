import { Entity, BaseEntity, Column } from "typeorm";
import bcrypt from "bcrypt";
import { Jws, safeJsonParse } from "../utils";
import { Timestamps } from "./utils";

export interface AuthenticationParameters {
  username: string;
  password: string;
}

const BCRYPT_ROUNDS = 10;
const JWS_ALG = "HS256";
const JWS_SECRET = "deadbeaf"; // TODO: Put into config
const jws = new Jws(JWS_ALG, JWS_SECRET);

//
// TODO
// - Validations
//   - username uniqueness
//   - username length
//   - username format [a-zA-Z0-9\-\_\.]+
//   - password length
//

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
    return { username: this.username, token: this.generateToken() };
  }

  generateToken(): string {
    return jws.payloadToToken(
      JSON.stringify({ id: this.id, username: this.username })
    );
  }

  static async register(
    params: Partial<AuthenticationParameters>
  ): Promise<User | undefined> {
    const { username, password } = params;
    if (!username || !password) {
      return;
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    try {
      const user = this.create({ username, passwordHash });
      await user.save();
      return user;
    } catch (e) {
      return;
    }
  }

  static async login(
    params: Partial<AuthenticationParameters>
  ): Promise<User | undefined> {
    const { username, password } = params;
    if (!username || !password) {
      return;
    }
    const user = await this.findOne({ username });
    if (user && (await user.verifyPassword(password!))) {
      return user;
    }
    return;
  }

  static async findByToken(token: string): Promise<User | undefined> {
    const stringPayload = jws.tokenToPayload(token);
    if (!stringPayload) {
      return;
    }
    const payload = safeJsonParse(stringPayload);
    if (!payload?.id) {
      return;
    }
    const user = this.findOne({ id: payload.id });
    if (!user) {
      return;
    }
    return user;
  }
}
