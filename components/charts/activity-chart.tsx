interface ActivityDatum {
  day: string
  count: number
}

/** Next "sensible" y-axis max at or above the data peak (baseline grid: 0/2/4). */
function yMax(peak: number): number {
  if (peak <= 4) return 4
  if (peak <= 6) return 6
  if (peak <= 8) return 8
  if (peak <= 10) return 10
  return Math.ceil(peak / 5) * 5
}

export function ActivityChart({ data }: { data: ActivityDatum[] }) {
  const peak = data.reduce((max, d) => Math.max(max, d.count), 0)
  const top = yMax(peak)
  const ticks = [top, top / 2, 0]

  return (
    <div
      role="img"
      aria-label={`Responses per day, peak ${peak}`}
      data-slot="activity-chart"
    >
      <div className="flex gap-2">
        {/* Y-axis labels */}
        <div
          aria-hidden="true"
          className="flex h-[180px] w-6 shrink-0 flex-col items-end justify-between py-0 text-[11px] tabular-nums text-muted-foreground"
        >
          {ticks.map((tick) => (
            <span key={tick} className="leading-none">
              {tick}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div className="relative h-[180px] flex-1">
          {ticks.map((tick) => (
            <div
              key={tick}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-border"
              style={{ top: `${(1 - tick / top) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-stretch">
            {data.map((d) => (
              <div
                key={d.day}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                {d.count > 0 ? (
                  <>
                    <span className="mb-1 text-[11px] tabular-nums text-foreground">
                      {d.count}
                    </span>
                    <div
                      className="w-[70%] max-w-[32px] rounded-t-[4px] bg-chart-1"
                      style={{ height: `${(d.count / top) * 100}%` }}
                    />
                  </>
                ) : (
                  <div className="h-[3px] w-[70%] max-w-[32px] rounded-full bg-chart-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X labels */}
      <div aria-hidden="true" className="mt-2 grid grid-cols-7 pl-8 text-center">
        {data.map((d) => (
          <span
            key={d.day}
            className="truncate text-[12px] text-muted-foreground"
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
