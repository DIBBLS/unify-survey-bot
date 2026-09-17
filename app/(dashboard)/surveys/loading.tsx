export default function SurveysLoading() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton" style={{ height: '260px' }} />
      ))}
    </div>
  )
}
