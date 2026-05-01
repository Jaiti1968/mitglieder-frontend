import { useEffect } from "react";

export function useUnsavedChanges(shouldBlock) {
  useEffect(() => {
    if (!shouldBlock) return;

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlock]);
}