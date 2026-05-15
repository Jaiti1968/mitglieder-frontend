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
  if (!value) {
    return null;
  }

  if (!isCompleteDate(value)) {
    return value;
  }

  const [day, month, year] = value.split(".");
  return `${year}-${month}-${day}`;
}

export function isCompleteDate(value) {
  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value ?? "")) {
    return false;
  }

  const [day, month, year] = value.split(".").map(Number);
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
