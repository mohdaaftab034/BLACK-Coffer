import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Globe2 } from 'lucide-react'
import { useFilterStore } from '../store/filterStore'
import { getFilteredData } from '../services/api'
import { groupAndAvg, computeAvg } from '../utils/dataHelpers'
import FilterBar from '../components/filters/FilterBar'
import HorizontalBarChart from '../components/charts/HorizontalBarChart'

function CountryDetailCard({ country, data, onClose }) {
  const avgIntensity = computeAvg(data, 'intensity')
  const avgLikelihood = computeAvg(data, 'likelihood')
  const topSectors = useMemo(() => {
    const groups = {}
    data.forEach((d) => {
      const s = d.sector || 'Other'
      if (!groups[s]) groups[s] = 0
      groups[s]++
    })
    return Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-bold text-text-primary">{country || 'World'}</h3>
        <span className="text-xs text-text-muted">{data.length} insights</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Avg Intensity', value: avgIntensity, color: '#00D4FF' },
          { label: 'Avg Likelihood', value: avgLikelihood, color: '#06D6A0' },
          { label: 'Avg Relevance', value: computeAvg(data, 'relevance'), color: '#7C3AED' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-xl md:text-2xl font-bold font-display text-text-primary" style={{ color: stat.color }}>
              {stat.value.toFixed(1)}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Top Sectors</h4>
      <div className="space-y-2">
        {topSectors.map(([sector, count]) => (
          <div key={sector} className="flex items-center gap-3">
            <span className="text-sm text-text-primary flex-1 truncate">{sector}</span>
            <div className="flex-1 h-2 bg-surface-elevated/50 rounded-full overflow-hidden max-w-[120px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / topSectors[0][1]) * 100}%` }}
                className="h-full rounded-full bg-gradient-to-r from-accent-1 to-accent-2"
              />
            </div>
            <span className="text-xs text-text-muted w-8 text-right shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Geography() {
  const filters = useFilterStore()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)

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
      setSelectedCountry(null)
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

  const countryData = useMemo(() => {
    const groups = {}
    data.forEach((d) => {
      const c = d.country || 'Unknown'
      if (!groups[c]) groups[c] = []
      groups[c].push(d)
    })
    return Object.entries(groups)
      .map(([country, items]) => ({
        country,
        count: items.length,
        avgIntensity: computeAvg(items, 'intensity'),
        items,
      }))
      .sort((a, b) => b.count - a.count)
  }, [data])

  const regionData = useMemo(() =>
    groupAndAvg(data, 'region', 'intensity').sort((a, b) => b.count - a.count),
    [data]
  )

  if (error) {
    return (
      <div className="space-y-6">
        <FilterBar />
        <h1 className="text-xl font-display font-bold text-text-primary">Geography</h1>
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-6 text-center">
          <p className="text-danger text-sm mb-3">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-danger/10 border border-danger/30 rounded-lg text-xs font-medium text-danger hover:bg-danger/20 transition-all duration-150">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[300px] md:h-[400px] bg-surface-elevated/50 rounded-xl" />
            <div className="h-[300px] md:h-[400px] bg-surface-elevated/50 rounded-xl" />
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
          <Globe2 size={24} className="text-accent-1 shrink-0" />
          <h1 className="text-xl font-display font-bold text-text-primary">Geography</h1>
        </div>
        <p className="text-xs text-text-muted">
          {countryData.length} countries &middot; {data.length} total insights
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <HorizontalBarChart
          data={regionData.map((d) => ({ name: d.name, value: d.count }))}
          title="Insights by Region"
        />

        <div className="bg-card backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-text-primary mb-4 font-display">
            Top Countries
          </h3>
          <div className="space-y-1">
            {countryData.slice(0, 15).map((d, i) => (
              <motion.button
                key={d.country}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedCountry(d)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 min-h-[44px] ${
                  selectedCountry?.country === d.country
                    ? 'bg-accent-1/10 border border-accent-1/20'
                    : 'hover:bg-surface-hover border border-transparent'
                }`}
              >
                <span className="text-xs font-bold text-text-muted w-6 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-primary truncate">{d.country}</span>
                    <span className="text-xs text-text-muted shrink-0 ml-2">{d.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-surface-elevated/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.count / countryData[0].count) * 100}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-accent-1 to-accent-2"
                    />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {selectedCountry && (
        <CountryDetailCard
          country={selectedCountry.country}
          data={selectedCountry.items}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {!data.length && (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Globe2 size={48} className="opacity-30 mb-4" />
          <p className="text-sm">No geographic data matches current filters</p>
        </div>
      )}
    </div>
  )
}
