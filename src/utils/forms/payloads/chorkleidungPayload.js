import { parseKaufpreis } from "../validators";

export function createChorkleidungPayload(values) {
  return {
    ehemaligeStimme: values?.ehemaligeStimme ?? "",
    uebergabeAm: values?.uebergabeAm || null,
    bemerkungUebergabe: values?.bemerkungUebergabe ?? "",
    neubeschaffung: values?.neubeschaffung === true,
    datumAnteil: values?.datumAnteil || null,
    barzahlung: values?.barzahlung === true,
    bearbeitungsstand: values?.bearbeitungsstand ?? "",
    rueckgabeAm: values?.rueckgabeAm || null,
    bemerkungRueckgabe: values?.bemerkungRueckgabe ?? "",
    kaufdatum: values?.kaufdatum || null,
    kaufpreis: parseKaufpreis(values?.kaufpreis),
    sommerkleidung: values?.sommerkleidung === true,
    sommerkleidungErhalten: values?.sommerkleidungErhalten || null,
    sommerkleidungRueckgabe: values?.sommerkleidungRueckgabe || null,
  };
}

export function formatKaufpreis(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsedValue = parseKaufpreis(value);

  if (parsedValue === null || Number.isNaN(parsedValue)) {
    return value;
  }

  return parsedValue.toFixed(2).replace(".", ",");
}