import { useRef } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import CardShell from './CardShell'

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#DC2626', '#D97706', '#EA580C', '#16A34A', '#8B9DC3']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-card border border-subtle rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-medium text-text-primary">{d.name}</p>
      <p className="text-xs text-text-secondary mt-1">
        Count: <span className="text-text-primary font-medium">{d.payload.count || d.value}</span>
      </p>
      {d.payload.pct && (
        <p className="text-xs text-text-secondary">
          Share: <span className="text-text-primary font-medium">{d.payload.pct}%</span>
        </p>
      )}
    </div>
  )
}

export default function DonutChart({ data = [], title = '' }) {
  const wrapperRef = useRef(null)

  const total = data.reduce((s, d) => s + d.value, 0)
  const enriched = data.map((d) => ({
    ...d,
    pct: total ? ((d.value / total) * 100).toFixed(1) : 0,
  }))

  if (!data.length) {
    return (
      <CardShell title={title}>
        <div className="flex items-center justify-center h-64 text-text-muted text-sm">No data</div>
      </CardShell>
    )
  }

  return (
    <CardShell title={title}>
      <div ref={wrapperRef} data-chart-context>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {enriched.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value) => (
                <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  )
}
