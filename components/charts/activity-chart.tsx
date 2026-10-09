'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'

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

const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

export function ActivityChart({ data }: { data: ActivityDatum[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const reduce = useReducedMotion()
  const plotRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  const peak = data.reduce((max, d) => Math.max(max, d.count), 0)
  const top = yMax(peak)
  const ticks = [top, top / 2, 0]
  const n = data.length

  // Glide the shared tooltip to the hovered column. Retargeting the same
  // spring keeps motion continuous between columns (no unmount flicker);
  // it only unmounts when the pointer leaves the whole chart.
  useEffect(() => {
    if (hovered === null || reduce) return
    const plot = plotRef.current
    if (!plot || n === 0) return
    const width = plot.getBoundingClientRect().width
    if (width === 0) return
    const center = ((hovered + 0.5) / n) * width
    const half = (tipRef.current?.offsetWidth ?? 0) / 2 + 2
    const target = Math.min(Math.max(center, half), Math.max(half, width - half))
    const controls = animate(x, target, {
      type: 'spring',
      stiffness: 400,
      damping: 32,
    })
    return () => controls.stop()
  }, [hovered, n, reduce, x])

  const hoveredDatum = hovered !== null ? data[hovered] : null

  return (
    <div
      role="img"
      aria-label={`Responses per day, peak ${peak}`}
      data-slot="activity-chart"
      onMouseLeave={() => setHovered(null)}
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

        {/* Plot: full-column hit areas, no hover background anywhere */}
        <div ref={plotRef} className="relative h-[180px] flex-1">
          {ticks.map((tick) => (
            <div
              key={tick}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-border"
              style={{ top: `${(1 - tick / top) * 100}%` }}
            />
          ))}

          {/* Shared tooltip: glides in x, fades/rises on enter, reverses on exit */}
          {!reduce && (
            <AnimatePresence>
              {hoveredDatum !== null && (
                <motion.div
                  key="activity-tip"
                  className="pointer-events-none absolute left-0 top-0 z-10"
                  style={{ x }}
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: 6,
                    scale: 0.97,
                    transition: { duration: 0.12, ease: 'easeOut' },
                  }}
                  transition={{ duration: 0.19, ease: EASE_OUT }}
                >
                  <div
                    ref={tipRef}
                    className="-translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-center"
                  >
                    <div className="text-xs font-medium text-popover-foreground">
                      {hoveredDatum.day}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {hoveredDatum.count}{' '}
                      {hoveredDatum.count === 1 ? 'response' : 'responses'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {reduce && hoveredDatum !== null && hovered !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-center"
              style={{ left: `${((hovered + 0.5) / n) * 100}%` }}
            >
              <div className="text-xs font-medium text-popover-foreground">
                {hoveredDatum.day}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {hoveredDatum.count}{' '}
                {hoveredDatum.count === 1 ? 'response' : 'responses'}
              </div>
            </div>
          )}

          <div className="absolute inset-0 flex items-stretch">
            {data.map((d, i) => {
              const pct = top === 0 ? 0 : (d.count / top) * 100
              const isHovered = hovered === i
              return (
                <div
                  key={d.day}
                  className="relative flex h-full flex-1 flex-col items-center justify-end"
                  onMouseEnter={() => setHovered(i)}
                >
                  {d.count > 0 ? (
                    <>
                      <span className="mb-1 text-[11px] tabular-nums text-foreground">
                        {d.count}
                      </span>
                      <motion.div
                        className="w-[70%] max-w-[32px] rounded-t-[4px] bg-chart-1"
                        initial={reduce ? false : { height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{
                          duration: 0.7,
                          ease: EASE_OUT,
                          delay: reduce ? 0 : i * 0.05,
                        }}
                      />
                    </>
                  ) : (
                    <div
                      className={`h-[3px] w-[70%] max-w-[32px] rounded-full ${reduce ? '' : 'transition-colors'} ${isHovered ? 'bg-muted-foreground' : 'bg-chart-3'}`}
                    />
                  )}
                </div>
              )
            })}
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
  )
}
