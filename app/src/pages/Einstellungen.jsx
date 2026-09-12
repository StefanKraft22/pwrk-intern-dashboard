import { Check } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ZEITRAUM_OPTIONS } from "@/components/layout/GlobalFilters";
import { useSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function SavedHint({ show }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-success">
      <Check className="size-3.5" /> Gespeichert
    </span>
  );
}

function useSavedFlash() {
  const [saved, setSaved] = useState(false);
  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return [saved, flash];
}

export default function Einstellungen() {
  const [defaultZeitraum, setDefaultZeitraum] = useSetting("defaultZeitraum", "all");
  const [zeitraumSaved, flashZeitraum] = useSavedFlash();

  const [notificationsMuted, setNotificationsMuted] = useSetting("notificationsMuted", false);
  const [mutedSaved, flashMuted] = useSavedFlash();

  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Einstellungen</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Änderungen werden sofort im Browser gespeichert und wirken sich direkt auf das Dashboard aus.
      </p>

      <Card className="mb-4 p-5">
        <h2 className="mb-1 font-heading text-sm font-medium text-foreground">Standard-Zeitraum (Übersicht)</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Vorauswahl für den Zeitraum-Filter auf der Übersicht, bezogen auf das Schaltdatum der Anzeigen.
        </p>
        <div className="flex items-center gap-3">
          <select
            className={SELECT_CLASS}
            onChange={(e) => {
              setDefaultZeitraum(e.target.value);
              flashZeitraum();
            }}
            value={defaultZeitraum}
          >
            {ZEITRAUM_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <SavedHint show={zeitraumSaved} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 font-heading text-sm font-medium text-foreground">Benachrichtigungen</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Der rote Zähler auf der Glocke oben rechts kann stummgeschaltet werden. Die Benachrichtigungen selbst bleiben über die Glocke
          weiterhin abrufbar.
        </p>
        <div className="flex items-center gap-3">
          <button
            aria-pressed={notificationsMuted}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              notificationsMuted ? "bg-muted-foreground/40" : "bg-[var(--pw-navy-800)]"
            )}
            onClick={() => {
              setNotificationsMuted(!notificationsMuted);
              flashMuted();
            }}
            type="button"
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform",
                notificationsMuted && "translate-x-5"
              )}
            />
          </button>
          <span className="text-sm text-foreground">Badge-Zähler {notificationsMuted ? "stummgeschaltet" : "aktiv"}</span>
          <SavedHint show={mutedSaved} />
        </div>
      </Card>
    </div>
  );
}
