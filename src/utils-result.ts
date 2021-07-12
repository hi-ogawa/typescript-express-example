//
// Interfaces
//

export type Result<T, E> = ResultOk<T, E> | ResultErr<T, E>;

export namespace Result {
  export function Ok<T, E>(t: T): Result<T, E> {
    return new ResultOk(t);
  }

  export function Err<T, E>(e: E): Result<T, E> {
    return new ResultErr(e);
  }
}

//
// Implementation via abstract class/method and discriminated union
//

abstract class ResultBase<T, E> {
  abstract match<U>(f: (t: T) => U, g: (e: E) => U): U;

  bind(f: (t: T) => Result<T, E>): Result<T, E> {
    return this.match(
      (t) => f(t),
      (e) => Result.Err(e)
    );
  }

  map<U>(f: (t: T) => U): Result<U, E> {
    return this.match(
      (t) => Result.Ok(f(t)),
      (e) => Result.Err(e)
    );
  }
}

class ResultOk<T, E> extends ResultBase<T, E> {
  readonly ok: true = true;
  constructor(public data: T) {
    super();
  }
  match<U>(f: (t: T) => U, _: (e: E) => U): U {
    return f(this.data);
  }
}

class ResultErr<T, E> extends ResultBase<T, E> {
  readonly ok: false = false;
  constructor(public data: E) {
    super();
  }
  match<U>(_: (t: T) => U, g: (e: E) => U): U {
    return g(this.data);
  }
}
