import { formatKaufpreis } from "../payloads";
import { formatIsoDateToGerman } from "../dateHelpers";

export function createChorkleidungDefaults(chorkleidung = {}) {
  return {
    ehemaligeStimme: chorkleidung?.ehemaligeStimme ?? "",
    uebergabeAm: formatIsoDateToGerman(chorkleidung?.uebergabeAm),
    bemerkungUebergabe: chorkleidung?.bemerkungUebergabe ?? "",
    neubeschaffung: chorkleidung?.neubeschaffung ?? false,
    datumAnteil: formatIsoDateToGerman(chorkleidung?.datumAnteil),
    barzahlung: chorkleidung?.barzahlung ?? false,
    bearbeitungsstand: chorkleidung?.bearbeitungsstand ?? "",
    rueckgabeAm: formatIsoDateToGerman(chorkleidung?.rueckgabeAm),
    bemerkungRueckgabe: chorkleidung?.bemerkungRueckgabe ?? "",
    kaufdatum: formatIsoDateToGerman(chorkleidung?.kaufdatum),
    kaufpreis: formatKaufpreis(chorkleidung?.kaufpreis),
    sommerkleidung: chorkleidung?.sommerkleidung ?? false,
    sommerkleidungErhalten: formatIsoDateToGerman(
      chorkleidung?.sommerkleidungErhalten,
    ),
    sommerkleidungRueckgabe: formatIsoDateToGerman(
      chorkleidung?.sommerkleidungRueckgabe,
    ),
  };
}
