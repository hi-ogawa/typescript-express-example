import {
  Column,
  BeforeInsert,
  BeforeUpdate,
  getMetadataArgsStorage,
} from "typeorm";

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
