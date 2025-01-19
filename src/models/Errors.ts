import { HTTP_STATUS } from "~/constants/httpStatus";
import { USER_MESSAGES } from "~/constants/messages";

type EntityValidationErrorType = Record<
  string,
  {
    msg: string;
    [key: string]: any;
  }>;


export class ErrorWithStatus {
  status: number;
  message: string;

  constructor({ status, message }: { status: number; message: string }) {
    this.status = status;
    this.message = message;
  }
}

export class EntityValidationError extends ErrorWithStatus {
  errors: EntityValidationErrorType;

  constructor({ message = USER_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: EntityValidationErrorType }) {
    super({ status: HTTP_STATUS.UNPROCESSABLE_ENTITY, message });
    this.errors = errors;
  }
}