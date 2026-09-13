import { Calendar, ChevronDown, Download, Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/funnel";
import { campaign } from "@/lib/socialMedia";

export default function SocialMediaHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--pw-navy-800)] text-white">
          <Megaphone className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">Social Media Kampagnen</h1>
          <p className="text-sm text-muted-foreground">Reichweite. Engagement. Bewerbungen.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm hover:bg-muted/40"
          type="button"
        >
          <span className="text-xs text-muted-foreground">Kampagne</span>
          <span className="font-medium text-foreground">{campaign.name}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Aktiv
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Users className="size-3.5" />
          {campaign.platformCount} Plattformen
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Calendar className="size-3.5" />
          {formatDate(campaign.dateRange.from)} – {formatDate(campaign.dateRange.to)}
        </span>
        <Button size="sm" variant="outline">
          <Download className="size-3.5" />
          Export
        </Button>
      </div>
    </div>
  );
}
