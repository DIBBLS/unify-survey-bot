const SHIMMER =
  'animate-[shimmer_1.5s_infinite] rounded-md bg-[linear-gradient(90deg,var(--muted)_25%,var(--border)_50%,var(--muted)_75%)] bg-[length:200%_100%]'

export default function SurveyDetailLoading() {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={SHIMMER} style={{ height: '120px' }} />
        ))}
      </div>
      <div className={SHIMMER} style={{ height: '400px' }} />
    </div>
  )
}
