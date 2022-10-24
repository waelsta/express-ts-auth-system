export type ErrorHandler = {
  name: string;
  message: string;
  statusCode: number;
};

export class AppError extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class CustomError extends AppError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
  }
}
