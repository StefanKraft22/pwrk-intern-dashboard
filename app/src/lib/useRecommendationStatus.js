import { useState } from "react";

const STORAGE_KEY = "pwrk-dashboard:empfehlungen-status";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

// Persistiert den Bearbeitungsstatus einer Empfehlung (erledigt/abgelehnt)
// lokal im Browser. Kein Backend vorhanden — die Aktionen wirken nur auf die
// Ansicht in diesem Browser, nicht auf ein echtes Aufgabensystem.
export function useRecommendationStatus() {
  const [statusMap, setStatusMap] = useState(() => readAll());

  const setStatus = (id, status) => {
    const all = readAll();
    if (status == null) {
      delete all[id];
    } else {
      all[id] = status;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setStatusMap(all);
  };

  return [statusMap, setStatus];
}
