export function formatIsoDateToGerman(value) {
  if (!value) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function parseGermanDateToIso(value) {
  const normalizedValue = normalizeGermanDateInput(value);

  if (!normalizedValue) {
    return null;
  }

  if (!isCompleteDate(normalizedValue)) {
    return value;
  }

  const [day, month, year] = normalizedValue.split(".");
  return `${year}-${month}-${day}`;
}

export function normalizeGermanDateInput(value) {
  const trimmedValue = String(value ?? "").trim();

  if (!trimmedValue) {
    return "";
  }

  const match = trimmedValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

  if (!match) {
    return trimmedValue;
  }

  const [, day, month, year] = match;
  const normalizedValue = `${day.padStart(2, "0")}.${month.padStart(
    2,
    "0",
  )}.${year}`;

  return isCompleteDate(normalizedValue) ? normalizedValue : trimmedValue;
}

export function isCompleteDate(value) {
  const normalizedValue = normalizeStrictGermanDate(value);

  if (!normalizedValue) {
    return false;
  }

  const [day, month, year] = normalizedValue.split(".").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isDateBefore(firstDate, secondDate) {
  if (!isCompleteDate(firstDate) || !isCompleteDate(secondDate)) {
    return false;
  }

  return parseGermanDateToIso(firstDate) < parseGermanDateToIso(secondDate);
}

export function isDateInFuture(value) {
  if (!isCompleteDate(value)) {
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);
  return parseGermanDateToIso(value) > today;
}

function normalizeStrictGermanDate(value) {
  const trimmedValue = String(value ?? "").trim();

  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(trimmedValue)) {
    return "";
  }

  return trimmedValue;
}
