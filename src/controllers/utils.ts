import { ValidationError } from "class-validator";

export type Action = () => Promise<void>;

export type ResponseStatus = "success" | "error";

export interface ResponseJson {
  status: ResponseStatus;
  data: any;
}

type SerializedValidationError = Pick<
  ValidationError,
  "property" | "constraints"
>;

export function serializeValidationErrors(
  errors: ValidationError[]
): SerializedValidationError[] {
  return errors.map(({ property, constraints }) => ({ property, constraints }));
}
