import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { campaign } from "@/lib/socialMedia";

const SENTIMENT_COLORS = { positive: "var(--success)", neutral: "var(--sg-grey-500)", negative: "var(--destructive)" };

export default function CommunityAnalysis() {
  const { positive, neutral, negative, topThemes, commonQuestions } = campaign.community;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Stimmungsbild</p>
        <div className="mb-3 flex h-3 overflow-hidden rounded-full">
          <div style={{ width: `${positive}%`, background: SENTIMENT_COLORS.positive }} />
          <div style={{ width: `${neutral}%`, background: SENTIMENT_COLORS.neutral }} />
          <div style={{ width: `${negative}%`, background: SENTIMENT_COLORS.negative }} />
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ThumbsUp className="size-3.5" style={{ color: SENTIMENT_COLORS.positive }} />
              Positive Reaktionen
            </span>
            <span className="font-mono font-semibold text-foreground">{positive} %</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="size-3.5" style={{ color: SENTIMENT_COLORS.neutral }} />
              Neutral
            </span>
            <span className="font-mono font-semibold text-foreground">{neutral} %</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ThumbsDown className="size-3.5" style={{ color: SENTIMENT_COLORS.negative }} />
              Negativ
            </span>
            <span className="font-mono font-semibold text-foreground">{negative} %</span>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Häufige Themen</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {topThemes.map((t) => (
            <span
              className="rounded-full border px-2.5 py-1 text-[0.68rem] font-medium"
              key={t.label}
              style={{ borderColor: `color-mix(in oklab, ${SENTIMENT_COLORS[t.sentiment]} 40%, transparent)`, color: SENTIMENT_COLORS[t.sentiment] }}
            >
              {t.label}
            </span>
          ))}
        </div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Häufige Fragen</p>
        <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          {commonQuestions.map((q) => (
            <li key={q}>„{q}“</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
