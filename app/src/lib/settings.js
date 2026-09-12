import { useState } from "react";

const STORAGE_KEY = "pwrk-dashboard:einstellungen";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

// Liest eine gespeicherte Einstellung außerhalb von React-Komponenten (z. B.
// als Initialwert für useState), ohne Re-Render-Kopplung.
export function readSetting(key, defaultValue) {
  const value = readAll()[key];
  return value === undefined ? defaultValue : value;
}

export function useSetting(key, defaultValue) {
  const [value, setValue] = useState(() => readSetting(key, defaultValue));

  const update = (next) => {
    const all = readAll();
    all[key] = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setValue(next);
  };

  return [value, update];
}
