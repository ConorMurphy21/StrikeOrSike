import { sprintf } from 'sprintf-js';

// types heavily inspired by the Rust Result API and npm 'rustic'
export type ResultOk<T> = T & {
  __kind: 'ok';
};

export type ResultSuccess = {
  __kind: 'success';
};

// Fits a LogEntry Type
class ResultErr {
  public message: string;
  public level: string;
  __kind: 'error' = 'error';

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
  return { __kind: 'ok', ...data };
}

export function Success(): ResultSuccess {
  return { __kind: 'success' };
}

export type Result<T> = ResultOk<T> | ResultErr;
// For results that don't return any data on success
export type VoidResult = ResultSuccess | ResultErr;

// Helper Guards
export function isOk<T>(result: Result<T>): result is ResultOk<T> {
  return result.__kind === 'ok';
}

export function isSuccess(result: VoidResult): result is ResultSuccess {
  return result.__kind === 'success';
}

export function isErr<T = null>(result: Result<T> | VoidResult): result is ResultErr {
  return result.__kind === 'error';
}
