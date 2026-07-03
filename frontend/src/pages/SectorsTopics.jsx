import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart } from 'lucide-react'
import { useFilterStore } from '../store/filterStore'
import { getFilteredData } from '../services/api'
import { groupAndAvg, computeAvg, getHeatmapData } from '../utils/dataHelpers'
import FilterBar from '../components/filters/FilterBar'
import HorizontalBarChart from '../components/charts/HorizontalBarChart'
import HeatmapChart from '../components/charts/HeatmapChart'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function GroupedBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-subtle rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(1)}
        </p>
      ))}
    </div>
  )
}

export default function SectorsTopics() {
  const filters = useFilterStore()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = () => {
    setLoading(true)
    setError(null)
    getFilteredData({
      endYear: filters.endYear,
      topics: filters.topics,
      sectors: filters.sectors,
      regions: filters.regions,
      pestle: filters.pestle,
      source: filters.source,
      swot: filters.swot,
      countries: filters.countries,
      city: filters.city,
    }).then((result) => {
      setData(result)
      setLoading(false)
    }).catch((err) => {
      setError(err.message || 'Failed to load data')
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [
    filters.endYear, filters.topics, filters.sectors, filters.regions,
    filters.pestle, filters.source, filters.swot, filters.countries, filters.city,
  ])

  const sectorComparison = useMemo(() => {
    const sectors = [...new Set(data.map((d) => d.sector).filter(Boolean))]
    return sectors.map((sec) => {
      const items = data.filter((d) => d.sector === sec)
      return {
        name: sec,
        avgIntensity: computeAvg(items, 'intensity'),
        avgLikelihood: computeAvg(items, 'likelihood'),
        avgRelevance: computeAvg(items, 'relevance'),
        count: items.length,
      }
    }).sort((a, b) => b.count - a.count)
  }, [data])

  const topicData = useMemo(() =>
    groupAndAvg(data, 'topic', 'intensity').sort((a, b) => b.count - a.count),
    [data]
  )

  const heatmapData = useMemo(() =>
    getHeatmapData(data, 'sector', 'pestle', 'intensity'),
    [data]
  )

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
  const legendColor = isDark ? '#B0B8CC' : '#5B5F73'

  if (error) {
    return (
      <div className="space-y-6">
        <FilterBar />
        <h1 className="text-xl font-display font-bold text-text-primary">Sectors & Topics</h1>
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
          <p className="text-danger text-sm mb-3">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-danger/10 border border-danger/30 rounded-lg text-xs font-medium text-danger hover:bg-danger/20 transition-all">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <FilterBar />
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-elevated/50 rounded-xl w-48" />
          <div className="h-[300px] md:h-[400px] bg-surface-elevated/50 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[250px] md:h-[350px] bg-surface-elevated/50 rounded-xl" />
            <div className="h-[250px] md:h-[350px] bg-surface-elevated/50 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FilterBar />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-1">
          <PieChart size={24} className="text-accent-2 shrink-0" />
          <h1 className="text-xl font-display font-bold text-text-primary">Sectors & Topics</h1>
        </div>
        <p className="text-xs text-text-muted">
          {data.length} insights across {sectorComparison.length} sectors
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-text-primary mb-4 font-display">
          Sector Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sectorComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={isDark ? 0.4 : 0.6} />
            <XAxis
              dataKey="name"
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} tickLine={false} />
            <Tooltip content={<GroupedBarTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: legendColor }}
              formatter={(value) => <span style={{ color: legendColor }}>{value.replace('avg', 'Avg ')}</span>}
            />
            <Bar dataKey="avgIntensity" name="Intensity" fill={isDark ? '#818CF8' : '#4F46E5'} radius={[4, 4, 0, 0]} animationDuration={800} />
            <Bar dataKey="avgLikelihood" name="Likelihood" fill={isDark ? '#22D3EE' : '#06B6D4'} radius={[4, 4, 0, 0]} animationDuration={800} />
            <Bar dataKey="avgRelevance" name="Relevance" fill={isDark ? '#4ADE80' : '#16A34A'} radius={[4, 4, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <HorizontalBarChart
          data={topicData.map((d) => ({ name: d.name, value: d.count }))}
          title="Topic Frequency"
        />
        <HeatmapChart data={heatmapData} title="Sector \u00D7 PESTLE Heatmap (Avg Intensity)" />
      </div>

      {!data.length && (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <PieChart size={48} className="opacity-30 mb-4" />
          <p className="text-sm">No data matches current filters</p>
        </div>
      )}
    </div>
  )
}
