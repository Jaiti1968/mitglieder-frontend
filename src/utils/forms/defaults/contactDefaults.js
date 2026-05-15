export function createKontaktDefaults(kontakt = {}) {
  return {
    telefonPrivat: kontakt?.telefonPrivat ?? "",
    telefonGeschaeftlich: kontakt?.telefonGeschaeftlich ?? "",
    mobiltelefon: kontakt?.mobiltelefon ?? "",
    email: kontakt?.email ?? "",
    adresszusatz: kontakt?.adresszusatz ?? "",
    briefanrede: kontakt?.briefanrede ?? "",
  };
}
