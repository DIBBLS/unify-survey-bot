export default function SurveyDetailLoading() {
  return (
    <div>
      <div className="stats-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: '120px' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '400px' }} />
    </div>
  )
}
