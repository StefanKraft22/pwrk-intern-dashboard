import { Card } from "@/components/ui/card";

export default function ComingSoon({ icon: Icon, title, description, plannedFor }) {
  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">{title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>

      <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        {Icon && (
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-6" strokeWidth={1.75} />
          </span>
        )}
        <p className="font-heading text-base font-medium text-foreground">Dieser Bereich ist in Vorbereitung</p>
        {plannedFor && <p className="max-w-md text-sm text-muted-foreground">{plannedFor}</p>}
      </Card>
    </div>
  );
}
