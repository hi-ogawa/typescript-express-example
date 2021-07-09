import "reflect-metadata";
import { describe, it } from "mocha";
import { strictEqual } from "assert";
import { Memoize } from "./utils";

describe("utils", () => {
  describe("Memoize", async () => {
    it("works", async () => {
      let counter1 = 0;
      class C1 {
        @Memoize()
        tick() {
          counter1 += 1;
          return counter1;
        }
      }
      const x1 = new C1();
      const y1 = new C1();
      strictEqual(counter1, 0);
      strictEqual(x1.tick(), 1);
      strictEqual(counter1, 1);
      strictEqual(x1.tick(), 1);
      strictEqual(counter1, 1);
      strictEqual(y1.tick(), 2);
      strictEqual(counter1, 2);
      strictEqual(y1.tick(), 2);
      strictEqual(counter1, 2);
      strictEqual((x1 as any).__memoize__tick.get("[]"), 1);

      let counter2 = 0;
      class C2 {
        tick() {
          counter2 += 1;
          return counter2;
        }
      }
      const x2 = new C2();
      const y2 = new C2();
      strictEqual(counter2, 0);
      strictEqual(x2.tick(), 1);
      strictEqual(counter2, 1);
      strictEqual(x2.tick(), 2);
      strictEqual(counter2, 2);
      strictEqual(y2.tick(), 3);
      strictEqual(counter2, 3);
      strictEqual(y2.tick(), 4);
      strictEqual(counter2, 4);
    });
  });
});
