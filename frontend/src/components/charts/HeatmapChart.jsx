import CardShell from './CardShell'

export default function HeatmapChart({ data = [], title = '' }) {
  if (!data.length) {
    return (
      <CardShell title={title}>
        <div className="flex items-center justify-center h-64 text-text-muted text-sm">No data</div>
      </CardShell>
    )
  }

  const allValues = data.flatMap((r) => r.values.map((v) => v.value))
  const maxVal = Math.max(...allValues, 1)
  const cols = data[0]?.values.map((v) => v.col) || []

  return (
    <CardShell title={title}>
      <div className="overflow-auto">
        <div className="min-w-[400px]">
          <div className="flex mb-2">
            <div className="w-[120px] shrink-0" />
            {cols.map((col) => (
              <div
                key={col}
                className="flex-1 text-center text-[10px] text-text-muted font-medium truncate px-1"
              >
                {col}
              </div>
            ))}
          </div>
          {data.map((row) => (
            <div key={row.row} className="flex items-center mb-1">
              <div className="w-[120px] shrink-0 text-xs text-text-secondary font-medium truncate pr-2">
                {row.row}
              </div>
              {row.values.map((cell) => {
                const intensity = cell.value / maxVal
                return (
                  <div
                    key={cell.col}
                    className="flex-1 h-8 rounded-md flex items-center justify-center text-[10px] font-medium mx-0.5"
                    style={{
                      backgroundColor: `rgba(79, 70, 229, ${0.1 + intensity * 0.6})`,
                      color: intensity > 0.5 ? '#fff' : 'var(--text-secondary)',
                    }}
                    title={`${row.row} / ${cell.col}: ${cell.value.toFixed(1)} (${cell.count} items)`}
                  >
                    {cell.value > 0 ? cell.value.toFixed(1) : '-'}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  )
}
