export function isCompleteDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");
}

export function toDateOnly(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

export function isDateBefore(firstDate, secondDate) {
  if (!isCompleteDate(firstDate) || !isCompleteDate(secondDate)) {
    return false;
  }

  return firstDate < secondDate;
}

export function isDateInFuture(value) {
  if (!isCompleteDate(value)) {
    return false;
  }

  const selectedDate = new Date(value);
  const now = new Date();

  return selectedDate > now;
}
