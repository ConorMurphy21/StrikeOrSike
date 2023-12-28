import { sprintf } from 'sprintf-js';

// types heavily inspired by the Rust Result API and npm 'rustic'
export enum ResultKind {
  Ok,
  Success,
  Err
}

export type ResultOk<T> = T & {
  __kind: ResultKind.Ok;
};

export type ResultSuccess = {
  __kind: ResultKind.Success;
};

type ApiResultErr = {
  message: string;
  level: string;
  __kind: ResultKind.Err;
};

// Fits a LogEntry Type
class ResultErr {
  public message: string;
  public level: string;
  __kind: ResultKind.Err = ResultKind.Err;

  constructor(error: string, level = 'error') {
    this.message = error;
    this.level = level;
  }

  wrap(wrapperMessage: string): ResultErr {
    return new ResultErr(sprintf(wrapperMessage, this.message), this.level);
  }
}

// Construct ResultErr with given log level
export function Warn(message: string): ResultErr {
  return new ResultErr(message, 'warning');
}

export function Err(message: string): ResultErr {
  return new ResultErr(message);
}

export function Info(message: string): ResultErr {
  return new ResultErr(message, 'info');
}

// Construct Ok result
export function Ok<T>(data: T): ResultOk<T> {
  return { __kind: ResultKind.Ok, ...data };
}

export function Success(): ResultSuccess {
  return { __kind: ResultKind.Success };
}

export type Result<T> = ResultOk<T> | ResultErr;
export type ApiResult<T> = (ResultOk<T> | ApiResultErr) & { success: boolean };
// For results that don't return any data on success
export type VoidResult = ResultSuccess | ResultErr;

// Helper Guards
export function isOk<T>(result: Result<T>): result is ResultOk<T> {
  return result.__kind === ResultKind.Ok;
}

export function isSuccess(result: VoidResult): result is ResultSuccess {
  return result.__kind === ResultKind.Success;
}

export function isErr<T = null>(result: Result<T> | VoidResult): result is ResultErr {
  return result.__kind === ResultKind.Err;
}
