const SHIMMER =
  'animate-[shimmer_1.5s_infinite] rounded-md bg-[linear-gradient(90deg,var(--surface-2)_25%,var(--border)_50%,var(--surface-2)_75%)] bg-[length:200%_100%]'

export default function SurveysLoading() {
  return (
    <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(360px,1fr))]">
      {[0, 1, 2].map((i) => (
        <div key={i} className={SHIMMER} style={{ height: '260px' }} />
      ))}
    </div>
  )
}
