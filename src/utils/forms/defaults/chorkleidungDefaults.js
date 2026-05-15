import { formatKaufpreis } from "../payloads";

export function createChorkleidungDefaults(chorkleidung = {}) {
  return {
    ehemaligeStimme: chorkleidung?.ehemaligeStimme ?? "",
    uebergabeAm: chorkleidung?.uebergabeAm ?? "",
    bemerkungUebergabe: chorkleidung?.bemerkungUebergabe ?? "",
    neubeschaffung: chorkleidung?.neubeschaffung ?? false,
    datumAnteil: chorkleidung?.datumAnteil ?? "",
    barzahlung: chorkleidung?.barzahlung ?? false,
    bearbeitungsstand: chorkleidung?.bearbeitungsstand ?? "",
    rueckgabeAm: chorkleidung?.rueckgabeAm ?? "",
    bemerkungRueckgabe: chorkleidung?.bemerkungRueckgabe ?? "",
    kaufdatum: chorkleidung?.kaufdatum ?? "",
    kaufpreis: formatKaufpreis(chorkleidung?.kaufpreis),
    sommerkleidung: chorkleidung?.sommerkleidung ?? false,
    sommerkleidungErhalten: chorkleidung?.sommerkleidungErhalten ?? "",
    sommerkleidungRueckgabe: chorkleidung?.sommerkleidungRueckgabe ?? "",
  };
}
