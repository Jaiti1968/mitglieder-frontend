export function createMitgliedschaftPayload(values) {
  return {
    eintritt: values?.eintritt || null,
    austritt: values?.austritt || null,
    mitgliedsstatusId: values?.mitgliedsstatusId
      ? Number(values.mitgliedsstatusId)
      : null,
    stimmeId: values?.stimmeId ? Number(values.stimmeId) : null,
    kammerchor: values?.kammerchor === true,
  };
}
