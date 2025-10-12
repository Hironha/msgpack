export type Result<T, E> = Ok<T> | Err<E>;

const OK = "ok" as const;

export class Ok<T> {
  public readonly kind = OK;
  public readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  static empty(): Ok<void> {
    return new Ok(undefined);
  }

  /**
   * @throws {Error} Throws an error if unwrapping an `Err` variant
   */
  static unwrap<T, E>(result: Result<T, E>): T {
    if (result.kind !== OK) {
      throw new Error("Invalid ok unwrap of result variant");
    }
    return result.value;
  }

  static is<T, E>(result: Result<T, E>): result is Ok<T> {
    return result.kind === OK;
  }
}

const ERR = "err" as const;

export class Err<E> {
  public readonly kind = ERR;
  public readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  static empty(): Ok<void> {
    return new Ok(undefined);
  }

  /**
   * @throws {Error} Throws an error if unwrapping an `Ok` variant
   */
  static unwrap<T, E>(result: Result<T, E>): E {
    if (result.kind !== ERR) {
      throw new Error("Invalid error unwrap of a result");
    }
    return result.error;
  }

  static is<T, E>(result: Result<T, E>): result is Err<E> {
    return result.kind === ERR;
  }
}
