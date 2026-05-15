export function createMitgliedschaftDefaults(mitgliedschaft = {}) {
  return {
    eintritt: mitgliedschaft?.eintritt ?? "",
    austritt: mitgliedschaft?.austritt ?? "",
    mitgliedsstatusId: mitgliedschaft?.mitgliedsstatusId ?? "",
    stimmeId: mitgliedschaft?.stimmeId ?? "",
    kammerchor: mitgliedschaft?.kammerchor ?? false,
  };
}
