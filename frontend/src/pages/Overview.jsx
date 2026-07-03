import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFilterStore } from '../store/filterStore'
import { getFilteredData } from '../services/api'
import {
  getAggregates,
  groupAndAvg,
} from '../utils/dataHelpers'
import FilterBar from '../components/filters/FilterBar'
import KpiCards from '../components/charts/KpiCards'
import BubbleChart from '../components/charts/BubbleChart'
import HorizontalBarChart from '../components/charts/HorizontalBarChart'
import DonutChart from '../components/charts/DonutChart'
import AreaChartComponent from '../components/charts/AreaChart'
import RadarChartComponent from '../components/charts/RadarChartComponent'

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface-elevated/50 rounded-xl h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-elevated/50 rounded-xl h-[300px] md:h-[500px]" />
        <div className="bg-surface-elevated/50 rounded-xl h-[300px] md:h-[500px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface-elevated/50 rounded-xl h-[250px] md:h-[350px]" />
        ))}
      </div>
    </div>
  )
}

function getYearData(data) {
  const groups = {}
  data.forEach((d) => {
    const y = d.endYear || d.startYear || d.published
    if (!y) return
    const year = String(y).length === 4 ? String(y) : new Date(y).getFullYear()
    if (!groups[year]) groups[year] = { intensities: [], relevances: [] }
    groups[year].intensities.push(Number(d.intensity) || 0)
    groups[year].relevances.push(Number(d.relevance) || 0)
  })
  return Object.entries(groups)
    .map(([year, vals]) => ({
      year: Number(year),
      avgIntensity: vals.intensities.length
        ? vals.intensities.reduce((s, v) => s + v, 0) / vals.intensities.length
        : 0,
      avgRelevance: vals.relevances.length
        ? vals.relevances.reduce((s, v) => s + v, 0) / vals.relevances.length
        : 0,
    }))
    .sort((a, b) => a.year - b.year)
}

export default function Overview() {
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

  if (error) {
    return (
      <div className="space-y-4">
        <FilterBar />
        <h1 className="text-xl font-display font-bold text-text-primary">Overview</h1>
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
          <p className="text-danger text-sm mb-3">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-danger/10 border border-danger/30 rounded-lg text-xs font-medium text-danger hover:bg-danger/20 transition-all">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) return <LoadingSkeleton />

  const aggregates = getAggregates(data)
  const sectorIntensity = groupAndAvg(data, 'sector', 'intensity').sort(
    (a, b) => b.value - a.value
  )
  const topicData = groupAndAvg(data, 'topic', 'intensity').sort(
    (a, b) => b.count - a.count
  )
  const regionData = groupAndAvg(data, 'region', 'intensity').sort(
    (a, b) => b.count - a.count
  )
  const yearData = getYearData(data)
  const pestleData = groupAndAvg(data, 'pestle', 'intensity')

  const pestleRadarData = pestleData.map((d) => {
    const items = data.filter((x) => x.pestle === d.name)
    return {
      name: d.name,
      avgIntensity: d.value,
      avgRelevance: items.length
        ? items.reduce((s, x) => s + Number(x.relevance || 0), 0) / items.length
        : 0,
    }
  })

  return (
    <div className="space-y-6">
      <FilterBar />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl font-display font-bold text-text-primary mb-1">Overview</h1>
        <p className="text-xs text-text-muted">
          {data.length} insights found
        </p>
      </motion.div>

      <KpiCards aggregates={aggregates} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 font-display">
            Insights Bubble Map
          </h3>
          <BubbleChart data={data} />
        </motion.div>

        <HorizontalBarChart
          data={sectorIntensity}
          title="Intensity by Sector"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <DonutChart data={topicData} title="Topics Distribution" />
        <AreaChartComponent
          data={yearData}
          title="Relevance & Intensity Over Years"
          dataKeys={['avgIntensity', 'avgRelevance']}
          colors={['#00D4FF', '#7C3AED']}
        />
        <RadarChartComponent data={pestleRadarData} title="PESTLE Radar Breakdown (Intensity & Relevance)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <HorizontalBarChart
          data={regionData.map((d) => ({ name: d.name, value: d.count }))}
          title="Region-wise Insights"
        />
        <div className="bg-card backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-text-primary mb-4 font-display">
            PESTLE Category Breakdown
          </h3>
          {pestleData.length > 0 ? (
            <RadarChartComponent data={pestleRadarData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-text-muted text-sm">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
