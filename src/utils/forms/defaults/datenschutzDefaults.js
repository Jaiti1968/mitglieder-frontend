export function createDatenschutzDefaults(datenschutz = {}) {
  return {
    datumDatenschutz: datenschutz?.datumDatenschutz ?? "",
    datenschutzNr14: datenschutz?.datenschutzNr14 ?? false,
    datenschutzNr15: datenschutz?.datenschutzNr15 ?? false,
    datenschutzNr16: datenschutz?.datenschutzNr16 ?? false,
    datenschutzNr17: datenschutz?.datenschutzNr17 ?? false,
    datenschutzNr18: datenschutz?.datenschutzNr18 ?? false,
  };
}
