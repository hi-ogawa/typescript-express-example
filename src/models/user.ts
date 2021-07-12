import { Entity, BaseEntity, Column } from "typeorm";
import bcrypt from "bcrypt";
import {
  Length,
  Matches,
  IsAscii,
  ValidateIf,
  IsNotEmpty,
} from "class-validator";
import { Jws, parseJson } from "../utils";
import {
  Timestamps,
  IsUnique,
  validateAndSave,
  ValidationResult,
} from "./utils";

interface CreateParams {
  username: string;
  password: string;
}

const BCRYPT_ROUNDS = 10;
const JWS_ALG = "HS256";
const JWS_SECRET = "deadbeaf"; // TODO: Put into config
const jws = new Jws(JWS_ALG, JWS_SECRET);

@Entity("users")
export class User extends BaseEntity {
  @Column({ primary: true, generated: true })
  id!: number;

  @Column({ nullable: false, unique: true })
  @Matches(/^[a-zA-Z0-9\-\_\.]*$/)
  @Length(1, 128)
  @IsUnique({ message: "username '$value' is already taken" })
  username!: string;

  // Not a column
  @IsAscii()
  @Length(8, 72)
  @ValidateIf((it: any) => it.password !== undefined)
  password: string | undefined;

  @Column({ nullable: false })
  @IsNotEmpty({ message: "password should not be empty" }) // Use `passwordHash` to check if `password` is empty upon creation
  passwordHash!: string;

  @Column(() => Timestamps)
  timestamps: Timestamps = new Timestamps();

  async setPassword(password?: string) {
    if (password === undefined) {
      return;
    }
    this.password = password;
    this.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

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

  static async createWithPassword(
    params: Partial<CreateParams>
  ): Promise<User> {
    const { username, password } = params;
    const user = this.create({ username });
    await user.setPassword(password);
    return user;
  }

  static async register(
    params: Partial<CreateParams>
  ): Promise<ValidationResult<User>> {
    const user = await this.createWithPassword(params);
    return await validateAndSave(user);
  }

  static async findByToken(token: string): Promise<User | undefined> {
    const stringPayload = jws.tokenToPayload(token);
    if (!stringPayload) {
      return;
    }
    const result = parseJson(stringPayload);
    if (!result.ok || !result.data.id) {
      return;
    }
    const user = this.findOne({ id: result.data.id });
    if (!user) {
      return;
    }
    return user;
  }
}
