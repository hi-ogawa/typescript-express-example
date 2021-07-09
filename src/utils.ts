import jws from "jws";

export function sleep(msec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, msec));
}

export function safeJsonParse(s: string): any {
  try {
    return JSON.parse(s);
  } catch (_) {}
}

export class Jws {
  constructor(private algorithm: jws.Algorithm, private secret: string) {}

  payloadToToken(payload: string): string {
    return jws.sign({
      header: { alg: this.algorithm },
      payload: payload,
      secret: this.secret,
    });
  }

  tokenToPayload(token: string): string | undefined {
    if (!jws.verify(token, this.algorithm, this.secret)) {
      return;
    }
    const { header, payload } = jws.decode(token);
    if (header?.alg !== this.algorithm) {
      return;
    }
    return payload;
  }
}

//
// Hacky method/getter memoization via decorator
//
function memoizeSelf(cacheName: string, oldMethod: Function): Function {
  return function (this: any, ...args: any[]) {
    // Initialize Cache for the first time
    if (this[cacheName] === undefined) {
      this[cacheName] = new Map();
    }
    const cache = this[cacheName] as Map<string, any>;
    const key = JSON.stringify(args);
    // Cache hit
    if (cache.has(key)) {
      return cache.get(key);
    }
    // Cache miss
    const result = (oldMethod as any).apply(this, args);
    cache.set(key, result);
    return result;
  };
}

export function MemoizeGetter(): MethodDecorator {
  return function (_target, propertyName, descriptor: any) {
    const cacheName = `__memoize_getter__${String(propertyName)}`;
    descriptor.get = memoizeSelf(cacheName, descriptor.get);
  };
}

export function Memoize(): MethodDecorator {
  return function (_prototype, propertyName, descriptor: any) {
    const cacheName = `__memoize__${String(propertyName)}`;
    descriptor.value = memoizeSelf(cacheName, descriptor.value);
  };
}
