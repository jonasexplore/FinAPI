import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found", 404);
    }
  }

  export class SameUser extends AppError {
    constructor() {
      super("sender user and receiver user are some person", 409);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("InsufficientFunds", 400);
    }
  }
}
