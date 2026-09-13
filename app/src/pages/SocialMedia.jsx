import { Euro, Eye, Heart, Layers, MousePointerClick, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import SocialMediaHeader from "@/components/socialmedia/SocialMediaHeader";
import SocialKpiCard from "@/components/socialmedia/SocialKpiCard";
import ReachEngagementChart from "@/components/socialmedia/ReachEngagementChart";
import PlatformDistribution from "@/components/socialmedia/PlatformDistribution";
import TopPosts from "@/components/socialmedia/TopPosts";
import AudiencePerformance from "@/components/socialmedia/AudiencePerformance";
import PlatformDetails from "@/components/socialmedia/PlatformDetails";
import Demographics from "@/components/socialmedia/Demographics";
import CostEfficiency from "@/components/socialmedia/CostEfficiency";
import ConversionFunnel from "@/components/socialmedia/ConversionFunnel";
import ContentPerformance from "@/components/socialmedia/ContentPerformance";
import PostingTimeHeatmap from "@/components/socialmedia/PostingTimeHeatmap";
import CampaignComparison from "@/components/socialmedia/CampaignComparison";
import CommunityAnalysis from "@/components/socialmedia/CommunityAnalysis";
import AIRecommendations from "@/components/socialmedia/AIRecommendations";
import { campaign, formatEuro } from "@/lib/socialMedia";

export default function SocialMedia() {
  const k = campaign.kpis;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <SocialMediaHeader />

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SocialKpiCard delta={k.reach.deltaPercent} icon={Eye} iconColor="var(--pw-navy-800)" label="Reichweite" spark={k.reach.spark} value={k.reach.value.toLocaleString("de-DE")} />
        <SocialKpiCard
          delta={k.impressions.deltaPercent}
          icon={Layers}
          iconColor="var(--sg-blue-700)"
          label="Impressionen"
          spark={k.impressions.spark}
          value={k.impressions.value.toLocaleString("de-DE")}
        />
        <SocialKpiCard
          delta={k.engagements.deltaPercent}
          icon={Heart}
          iconColor="var(--sg-terracotta-500)"
          label="Engagements"
          spark={k.engagements.spark}
          value={k.engagements.value.toLocaleString("de-DE")}
        />
        <SocialKpiCard
          delta={k.linkClicks.deltaPercent}
          icon={MousePointerClick}
          iconColor="var(--pw-navy-400)"
          label="Klicks auf Link"
          spark={k.linkClicks.spark}
          value={k.linkClicks.value.toLocaleString("de-DE")}
        />
        <SocialKpiCard
          delta={k.applications.deltaPercent}
          icon={UserPlus}
          iconColor="var(--sg-gold-700)"
          label="Generierte Bewerbungen"
          spark={k.applications.spark}
          value={k.applications.value.toLocaleString("de-DE")}
        />
        <SocialKpiCard
          delta={k.costPerApplication.deltaPercent}
          icon={Euro}
          invert
          iconColor="var(--pw-red-500)"
          label="Kosten pro Bewerbung"
          spark={k.costPerApplication.spark}
          value={formatEuro(k.costPerApplication.value)}
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-1 font-heading text-base font-medium">Reichweite &amp; Engagement im Zeitverlauf</h2>
          <p className="mb-3 text-xs text-muted-foreground">Serien lassen sich über die Legende ein- und ausblenden.</p>
          <ReachEngagementChart />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-heading text-base font-medium">Anteil der Plattformen</h2>
          <PlatformDistribution />
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-heading text-base font-medium">Top Beiträge</h2>
          <p className="mb-3 text-[0.68rem] text-muted-foreground">Sortiert nach Engagement</p>
          <TopPosts />
        </Card>
      </section>

      <section className="mb-6">
        <Card className="p-5">
          <h2 className="mb-1 font-heading text-base font-medium">Zielgruppen-Performance</h2>
          <p className="mb-3 text-xs text-muted-foreground">Reichweite, Engagement, Klicks und Bewerbungen je Segment.</p>
          <AudiencePerformance />
        </Card>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Plattformen im Detail</h2>
        <PlatformDetails />
      </section>

      <section className="mb-6">
        <Card className="p-5">
          <h2 className="mb-3 font-heading text-base font-medium">Demografie &amp; Standort</h2>
          <Demographics />
        </Card>
      </section>

      <section className="mb-6">
        <Card className="p-5">
          <h2 className="mb-1 font-heading text-base font-medium">Kosten &amp; Effizienz</h2>
          <p className="mb-3 text-xs text-muted-foreground">Kampagnenbudget, Verbrauch und Kostenentwicklung — Daily (Momentanwert) und Lifetime (kumuliert) je Kostenart.</p>
          <CostEfficiency />
        </Card>
      </section>

      <section className="mb-6">
        <Card className="p-5">
          <h2 className="mb-1 font-heading text-base font-medium">Von der Reichweite zur Bewerbung</h2>
          <p className="mb-4 text-xs text-muted-foreground">Vollständiger Recruiting-Funnel über den gesamten Kampagnenzeitraum.</p>
          <ConversionFunnel />
        </Card>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-heading text-base font-medium">Content-Performance</h2>
          <ContentPerformance />
        </Card>
        <Card className="p-5">
          <h2 className="mb-1 font-heading text-base font-medium">Beste Posting-Zeiten</h2>
          <p className="mb-3 text-xs text-muted-foreground">Engagement nach Wochentag und Uhrzeit.</p>
          <PostingTimeHeatmap />
        </Card>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Kampagnenvergleich</h2>
        <Card className="overflow-x-auto p-0">
          <CampaignComparison />
        </Card>
      </section>

      <section className="mb-6">
        <Card className="p-5">
          <h2 className="mb-3 font-heading text-base font-medium">Community &amp; Resonanz</h2>
          <CommunityAnalysis />
        </Card>
      </section>

      <section>
        <Card className="border-[var(--pw-navy-800)]/20 bg-[var(--pw-navy-800)]/[0.04] p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--pw-navy-800)]" />
            <h2 className="font-heading text-base font-medium">KI-Analyse &amp; Handlungsempfehlungen</h2>
          </div>
          <AIRecommendations />
        </Card>
      </section>
    </div>
  );
}
