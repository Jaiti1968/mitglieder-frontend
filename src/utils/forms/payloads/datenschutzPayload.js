export function createDatenschutzPayload(values) {
  return {
    datumDatenschutz: values?.datumDatenschutz || null,
    datenschutzNr14: values?.datenschutzNr14 === true,
    datenschutzNr15: values?.datenschutzNr15 === true,
    datenschutzNr16: values?.datenschutzNr16 === true,
    datenschutzNr17: values?.datenschutzNr17 === true,
    datenschutzNr18: values?.datenschutzNr18 === true,
  };
}
