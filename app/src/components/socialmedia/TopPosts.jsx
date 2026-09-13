import { formatNumber } from "@/lib/funnel";
import { campaign, PLATFORM_META } from "@/lib/socialMedia";

export default function TopPosts() {
  return (
    <div className="flex flex-col gap-2.5">
      {campaign.topPosts.map((post, i) => {
        const meta = PLATFORM_META[post.platform];
        const Icon = meta.Icon;
        return (
          <div className="flex items-center gap-2.5" key={post.id}>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[0.62rem] font-medium text-muted-foreground">
              {i + 1}
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: meta.color }}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">{post.title}</p>
              <p className="text-[0.68rem] text-muted-foreground">
                {meta.name} · {post.type}
              </p>
            </div>
            <span className="shrink-0 font-mono text-xs font-medium tabular-nums text-foreground">{formatNumber(post.engagements)}</span>
          </div>
        );
      })}
    </div>
  );
}
