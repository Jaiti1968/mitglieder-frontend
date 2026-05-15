export function createKontaktPayload(values) {
  return {
    telefonPrivat: values.telefonPrivat ?? "",
    telefonGeschaeftlich: values.telefonGeschaeftlich ?? "",
    mobiltelefon: values.mobiltelefon ?? "",
    email: values.email ?? "",
    adresszusatz: values.adresszusatz ?? "",
    briefanrede: values.briefanrede ?? "",
  };
}