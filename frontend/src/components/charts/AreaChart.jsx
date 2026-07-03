import { useEffect, useState } from 'react'
import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import CardShell from './CardShell'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-subtle rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-text-secondary mt-0.5">
          {p.name}: <span className="text-text-primary font-medium">{p.value.toFixed(1)}</span>
        </p>
      ))}
    </div>
  )
}

export default function AreaChartComponent({ data = [], title = '', dataKeys = [], colors = [] }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    const el = document.documentElement
    setTheme(el.classList.contains('dark') ? 'dark' : 'light')
    const obs = new MutationObserver(() => {
      setTheme(el.classList.contains('dark') ? 'dark' : 'light')
    })
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const isDark = theme === 'dark'
  const gridColor = isDark ? '#2D3550' : '#E7E9F0'
  const axisColor = isDark ? '#7C86A4' : '#8B90A5'

  if (!data.length) {
    return (
      <CardShell title={title}>
        <div className="flex items-center justify-center h-64 text-text-muted text-sm">No data</div>
      </CardShell>
    )
  }

  return (
    <CardShell title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsArea data={data}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i] || '#4F46E5'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[i] || '#4F46E5'} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={isDark ? 0.4 : 0.6} />
          <XAxis
            dataKey="year"
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: axisColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i] || '#4F46E5'}
              fill={`url(#gradient-${key})`}
              strokeWidth={2}
              animationDuration={800}
            />
          ))}
        </RechartsArea>
      </ResponsiveContainer>
    </CardShell>
  )
}
