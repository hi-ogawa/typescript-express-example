import {
  Column,
  BeforeInsert,
  BeforeUpdate,
  getMetadataArgsStorage,
  BaseEntity,
} from "typeorm";
import {
  validate,
  registerDecorator,
  ValidationOptions,
  ValidationError,
} from "class-validator";
import { Result } from "../utils-result";

export class Timestamps {
  @Column({ nullable: false })
  createdAt!: Date;

  @Column({ nullable: false })
  updatedAt!: Date;

  @BeforeInsert()
  onBeforeInsert() {
    this.createdAt = this.updatedAt = new Date();
  }

  @BeforeUpdate()
  onBeforeUpdate() {
    this.updatedAt = new Date();
  }
}

// NOT USED: Hacky way to make timestamps automatically before I know embedded column supports listeners (see `class Timestamps`)
export function AutoTimestamps(
  [createdAt, updatedAt] = ["createdAt", "updatedAt"]
): ClassDecorator {
  return function ({ prototype }: any) {
    // Runtime checks
    const { columns } = getMetadataArgsStorage();
    for (const name of [createdAt, updatedAt]) {
      if (Reflect.getMetadata("design:type", prototype, name) !== Date) {
        throw new Error("[AutoTimestamps] Column type is not Date: ${name}");
      }
      if (
        !columns.some(
          ({ target, propertyName }) =>
            target === prototype.constructor && propertyName === name
        )
      ) {
        throw new Error(`[AutoTimestamps] Column is undefined: ${name}`);
      }
    }

    // Define listeners
    const createdAtListener = `__AutoTimestamps__${createdAt}`;
    const updatedAtListener = `__AutoTimestamps__${updatedAt}`;
    prototype[createdAtListener] = function () {
      this[createdAt] = this[updatedAt] = new Date();
    };
    prototype[updatedAtListener] = function () {
      this[updatedAt] = new Date();
    };
    BeforeInsert()(prototype, createdAtListener);
    BeforeUpdate()(prototype, updatedAtListener);
  };
}

// cf. https://github.com/rails/rails/blob/main/activerecord/lib/active_record/validations/uniqueness.rb
export function IsUnique(validationOptions?: ValidationOptions) {
  return function (prototype: Object, propertyName: string) {
    // Runtime check
    const klass = prototype.constructor;
    if (!(prototype instanceof BaseEntity)) {
      throw new Error(
        `[IsUnique] ${klass.name} class doesn't inherit from BaseEntity`
      );
    }
    // Register
    registerDecorator({
      name: "isUnique",
      target: klass,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        async validate(value: any) {
          const count = await (klass as any)
            .createQueryBuilder()
            .where({ [propertyName]: value })
            .getCount();
          return count == 0;
        },
      },
    });
  };
}

export type ValidationResult<T> = Result<T, ValidationError[]>;

export async function validateAndSave<T extends BaseEntity>(
  object: T
): Promise<ValidationResult<T>> {
  const errors = await validate(object as object);
  if (errors.length > 0) {
    return Result.Err(errors);
  }
  await object.save();
  return Result.Ok(object);
}
