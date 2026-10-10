export default function SurveysLoading() {
  return (
    <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6"
        >
          <div className="h-5 w-2/3 animate-pulse rounded-md bg-foreground-mist" />
          <div className="h-4 w-full animate-pulse rounded-md bg-foreground-mist" />
          <div className="h-4 w-1/2 animate-pulse rounded-md bg-foreground-mist" />
          <div className="mt-auto flex gap-2 pt-2">
            <div className="h-9 flex-1 animate-pulse rounded-md bg-foreground-mist" />
            <div className="h-9 flex-1 animate-pulse rounded-md bg-foreground-mist" />
          </div>
        </div>
      ))}
    </div>
  )
}
