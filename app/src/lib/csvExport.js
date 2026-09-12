// Einfacher CSV-Export (Semikolon-getrennt, UTF-8-BOM) für Excel/DE-Gebietsschema.
// Kein Server-Endpunkt vorhanden — der Export läuft rein clientseitig aus den
// bereits in der jeweiligen Ansicht verwendeten echten Daten.
function escapeCsvCell(value) {
  const str = value == null ? "" : String(value);
  if (/[;"\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(";"));
  const csv = "﻿" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
