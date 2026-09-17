export default function DashboardLoading() {
  return (
    <div>
      <div className="stats-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: '120px' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '280px', marginBottom: '28px' }} />
      <div className="skeleton" style={{ height: '320px' }} />
    </div>
  )
}
