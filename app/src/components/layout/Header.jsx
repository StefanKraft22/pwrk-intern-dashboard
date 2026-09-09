import customer from "@/data/customer.json";

export default function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <p className="font-heading text-sm font-medium text-foreground">{customer.name}</p>
        <p className="text-xs text-muted-foreground">Kundennr. {customer.customerNumber}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-success" />
        </span>
        Daten aktuell
      </div>
    </header>
  );
}
