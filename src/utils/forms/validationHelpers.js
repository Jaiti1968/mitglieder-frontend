import { isCompleteDate, isDateBefore, isDateInFuture } from "./dateHelpers";

export function createValidationError(field, message) {
  return {
    field,
    message,
  };
}

export function validateRequired(validationErrors, field, value, message) {
  if (!String(value ?? "").trim()) {
    validationErrors.push(createValidationError(field, message));
  }
}

export function validateMaxLength(
  validationErrors,
  field,
  value,
  maxLength,
  message,
) {
  if (String(value ?? "").length > maxLength) {
    validationErrors.push(createValidationError(field, message));
  }
}

export function validateEmail(validationErrors, field, value, message) {
  const email = value ?? "";

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    validationErrors.push(createValidationError(field, message));
  }
}

export function validatePostalCode(validationErrors, field, value, message) {
  const postalCode = String(value ?? "").trim();

  if (postalCode && !/^\d{5}$/.test(postalCode)) {
    validationErrors.push(createValidationError(field, message));
  }
}

export function validateCompleteDate(validationErrors, field, value, message) {
  if (value && !isCompleteDate(value)) {
    validationErrors.push(createValidationError(field, message));
  }
}

export function validateDateRange(
  validationErrors,
  startField,
  startValue,
  endField,
  endValue,
  message,
) {
  if (isDateBefore(endValue, startValue)) {
    validationErrors.push(createValidationError(endField, message));
  }
}

export function validateNotFutureDate(validationErrors, field, value, message) {
  if (isDateInFuture(value)) {
    validationErrors.push(createValidationError(field, message));
  }
}
