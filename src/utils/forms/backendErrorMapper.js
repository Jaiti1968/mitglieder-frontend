export function mapBackendValidationErrors(
  error,
  setError,
  allowedFields = null,
) {
  if (!Array.isArray(error?.validationErrors)) {
    return false;
  }

  let hasMappedError = false;

  error.validationErrors.forEach((validationError) => {
    if (!validationError?.field) {
      return;
    }

    if (allowedFields && !allowedFields.includes(validationError.field)) {
      return;
    }

    setError(validationError.field, {
      type: "server",
      message: validationError.message || "Ungültiger Wert",
    });

    hasMappedError = true;
  });

  return hasMappedError;
}

export function hasBackendValidationErrors(error) {
  return (
    Array.isArray(error?.validationErrors) && error.validationErrors.length > 0
  );
}
