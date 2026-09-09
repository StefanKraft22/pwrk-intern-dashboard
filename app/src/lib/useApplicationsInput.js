import { useEffect, useState } from "react";

const STORAGE_KEY = "pwrk-dashboard:eingegangene-bewerbungen";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

// Persistiert den vom Kunden eingetragenen Wert "Eingegangene Bewerbungen" je
// Anzeige dauerhaft im Browser, sodass er beim naechsten Login vorbelegt ist.
// (Kein Backend vorhanden — in einer produktiven Anbindung wuerde dieser Wert
// serverseitig beim Kunden-Account gespeichert bzw. bei BMS-Nutzung aus dem
// PPG Recruiting System gezogen.)
export function useApplicationsInput(adId) {
  const [value, setValue] = useState(() => readAll()[adId] ?? null);

  useEffect(() => {
    setValue(readAll()[adId] ?? null);
  }, [adId]);

  const save = (next) => {
    const all = readAll();
    if (next == null || next === "") {
      delete all[adId];
    } else {
      all[adId] = next;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setValue(next === "" ? null : next);
  };

  return [value, save];
}
