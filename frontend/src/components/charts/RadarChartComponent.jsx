import { useEffect, useState } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import CardShell from './CardShell'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-card border border-subtle rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-medium text-text-primary">{d.payload.name || d.name}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-text-secondary mt-0.5">
          {p.name}: <span className="text-text-primary font-medium">{p.value.toFixed(1)}</span>
        </p>
      ))}
    </div>
  )
}

export default function RadarChartComponent({ data = [], title = '' }) {
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
  const axisColor = isDark ? '#B0B8CC' : '#5B5F73'
  const tickColor = isDark ? '#7C86A4' : '#8B90A5'

  const color1 = isDark ? '#818CF8' : '#4F46E5'
  const color2 = isDark ? '#22D3EE' : '#06B6D4'

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
        <RadarChart data={data}>
          <PolarGrid stroke={gridColor} strokeOpacity={isDark ? 0.5 : 0.7} />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: axisColor, fontSize: 11 }}
          />
          <PolarRadiusAxis
            tick={{ fill: tickColor, fontSize: 10 }}
            stroke={gridColor}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Avg Intensity"
            dataKey="avgIntensity"
            stroke={color1}
            fill={color1}
            fillOpacity={0.2}
            strokeWidth={2}
            animationDuration={800}
          />
          <Radar
            name="Avg Relevance"
            dataKey="avgRelevance"
            stroke={color2}
            fill={color2}
            fillOpacity={0.2}
            strokeWidth={2}
            animationDuration={800}
          />
        </RadarChart>
      </ResponsiveContainer>
    </CardShell>
  )
}
