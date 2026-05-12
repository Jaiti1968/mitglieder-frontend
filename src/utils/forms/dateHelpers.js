export function isCompleteDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
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

  return firstDate < secondDate;
}

export function isDateInFuture(value) {
  if (!isCompleteDate(value)) {
    return false;
  }

  const today = new Date().toISOString().slice(0, 10);
  return value > today;
}
