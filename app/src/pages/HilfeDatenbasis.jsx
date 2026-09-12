import { Card } from "@/components/ui/card";

const SECTIONS = [
  { id: "hauptwert", label: "Hauptwert-Regel" },
  { id: "passgenauigkeit", label: "Passgenauigkeit" },
  { id: "funnel", label: "Funnel-Stufen" },
  { id: "schaetzungen", label: "Schätzungen im Produkt" },
  { id: "beispieldaten", label: "Beispieldaten" },
  { id: "empfehlungen", label: "Empfehlungs-Engine" },
  { id: "score", label: "Qualitätssignal-Score" },
  { id: "quellen", label: "Datenquellen" },
];

function Section({ id, title, children }) {
  return (
    <Card className="mb-4 scroll-mt-4 p-5" id={id}>
      <h2 className="mb-2 font-heading text-sm font-medium text-foreground">{title}</h2>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">{children}</div>
    </Card>
  );
}

export default function HilfeDatenbasis() {
  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Hilfe &amp; Datenbasis</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Wie die Kennzahlen in diesem Dashboard berechnet werden, welche Werte echt gemessen, welche geschätzt und welche nur Beispieldaten
        sind.
      </p>

      <nav className="mb-6 flex flex-wrap gap-1.5" aria-label="Abschnitte">
        {SECTIONS.map((s) => (
          <a
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            href={`#${s.id}`}
            key={s.id}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <Section id="hauptwert" title="Hauptwert-Regel (Schritt 3)">
        <p>
          Für jede Kennzahl liegen teils zwei Quellen vor: eigene Messung (Personalwerk-Tracking) und Fremdmessung der Stellenbörse. Es
          gilt: Sind beide vorhanden, zählt der höhere Wert als Hauptwert. Liefert nur eine Quelle einen Wert, wird dieser verwendet. Die
          Quelle wird überall als Badge ausgewiesen ("Quelle: eigene Messung" / "Quelle: Börse").
        </p>
      </Section>

      <Section id="passgenauigkeit" title="Passgenauigkeit &amp; Cluster-Vergleich">
        <p>
          Vergleicht die kumulierten eigenen Klicks einer Anzeige mit dem Median vergleichbarer Anzeigen im selben Skill-Cluster (reale
          Cluster-Daten). Ab 115 % des Medians gilt eine Anzeige als "Top", ab 85 % als "Beobachten", darunter als "Handlungsbedarf". Die
          Cluster-Serie wird dabei nur bis zum heutigen Datum berücksichtigt — Tage in der Zukunft (die bei laufenden Buchungen bereits als
          Reihe angelegt sind) fließen nicht ein, um keine unerreichten Werte als Ist-Stand auszugeben.
        </p>
      </Section>

      <Section id="funnel" title="Funnel-Stufen">
        <p>
          Impressions → Klicks → Hits (≥ 3 Sek. angesehen) → Interaktionen → Gestartete Bewerbungen. Hits und Interaktionen dürfen laut
          Vorgabe geschätzt werden, wenn keine Messung vorliegt; Impressions, Klicks und Gestartete Bewerbungen nie — fehlen diese, wird
          das explizit als "keine Daten" ausgewiesen statt eine Schätzung vorzutäuschen.
        </p>
      </Section>

      <Section id="schaetzungen" title="Schätzungen im Produkt">
        <p>Für folgende Bereiche liegen keine separaten Live-Messungen je Stellenbörse vor. Es wird dieselbe Methode überall verwendet:</p>
        <ul className="list-inside list-disc">
          <li>
            <span className="font-medium text-foreground">Mehrbörsen-Aufteilung:</span> Bei Anzeigen mit mehreren gebuchten Börsen werden
            Klicks, Bewerbungen und Kosten laufzeitgewichtet auf die Börsen verteilt (Anteil der jeweiligen Buchungsdauer an der
            Gesamtlaufzeit, mit leichten Tag-zu-Tag-Schwankungen für unterscheidbare Kurven).
          </li>
          <li>
            <span className="font-medium text-foreground">Budgetverbrauch:</span> Stellenanzeigen sind Festpreis-Buchungen, kein
            variables Werbebudget. "Verbraucht"/"Verbleibend" ist der Anteil der bereits verstrichenen Laufzeit am Gesamtpreis.
          </li>
          <li>
            <span className="font-medium text-foreground">Portal-Performance:</span> Bei Einzelbörsen-Anzeigen sind Klicks/Bewerbungen/
            Kosten exakt. Bei Mehrbörsen-Anzeigen fließt die oben beschriebene Schätzung ein — solche Zeilen sind mit einem Hinweis
            gekennzeichnet.
          </li>
        </ul>
      </Section>

      <Section id="beispieldaten" title="Beispieldaten">
        <p>
          Auf der Seite "Candidate Journey" sind die Stufen nach "Gestartete Bewerbungen" (Abgeschlossene Bewerbungen, Qualifizierte
          Bewerbungen, Interviews, Einstellungen) <span className="font-medium text-foreground">keine echten Messwerte</span>. Dafür
          liegen in der aktuellen Datenbasis keine Zahlen vor. Sie sind als plausible Beispiel-Verhältnisse dargestellt, damit der
          vollständige Bewerberlauf gemäß Konzept sichtbar ist — optisch klar getrennt (gestrichelter Rahmen, "Beispiel"-Badge) und ohne
          Verrechnung in andere Kennzahlen.
        </p>
      </Section>

      <Section id="empfehlungen" title="Empfehlungs-Engine">
        <p>
          Alle Empfehlungen werden ausschließlich regelbasiert aus den oben beschriebenen echten (bzw. offen als Schätzung markierten)
          Kennzahlen abgeleitet — Passgenauigkeit, Restlaufzeit, Kosten je Börse, Klick-/Bewerbungsverhältnis im Vergleich zum
          Portfolio-Median. Es gibt keine Empfehlungen für Social Media, Programmatic Recruiting oder Employer Branding, da dafür keine
          Datengrundlage im Projekt existiert — statt Platzhalter mit erfundenen Zahlen zu zeigen, entfallen diese Kategorien bewusst.
        </p>
      </Section>

      <Section id="score" title="Qualitätssignal-Score">
        <p>
          Der Score (0–100) auf der Übersicht deckt bewusst nur zwei Dimensionen ab, für die echte Daten vorliegen: 60 % Anteil Anzeigen
          mit Passgenauigkeit "Top"/"Beobachten", 40 % Anteil Anzeigen mit Bewerbungsstart-Quote im bzw. über dem Portfolio-Median.
          Weitere im Konzept vorgesehene Faktoren (z. B. Skill-Passung im Detail, regionale Eignung, Kosteneffizienz je Börse) fehlen
          bewusst, solange dafür keine belastbare Datengrundlage vorliegt.
        </p>
      </Section>

      <Section id="quellen" title="Datenquellen">
        <ul className="list-inside list-disc">
          <li>
            <span className="font-mono text-xs">advertisements.json</span> — Stellenanzeigen mit KPIs, Kosten, Cluster-Vergleich und
            Tagesverläufen (Basis für fast alle Ansichten).
          </li>
          <li>
            <span className="font-mono text-xs">boersen-kpis-table.json</span> — Tracking-Fähigkeiten von 100+ Stellenbörsen (welche
            Kennzahl über welche Quelle grundsätzlich messbar wäre), <span className="font-medium text-foreground">keine
            Performance-Zahlen</span> für nicht gebuchte Börsen.
          </li>
          <li>
            <span className="font-mono text-xs">interval-kpis.json</span> — monatlich aggregierte Kennzahlen für die KPI-Leiste der
            Übersicht.
          </li>
          <li>
            <span className="font-mono text-xs">customer.json</span> — Stammdaten des Mandanten.
          </li>
        </ul>
      </Section>
    </div>
  );
}
