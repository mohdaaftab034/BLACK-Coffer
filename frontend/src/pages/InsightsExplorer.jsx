import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  X,
  ChevronRight,
} from 'lucide-react'
import { useFilterStore } from '../store/filterStore'
import { getFilteredData } from '../services/api'
import FilterBar from '../components/filters/FilterBar'

export default function InsightsExplorer() {
  const filters = useFilterStore()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('published')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [selectedRow, setSelectedRow] = useState(null)
  const perPage = 15

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
      setPage(1)
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

  const sorted = useMemo(() => {
    let items = [...data]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.sector?.toLowerCase().includes(q) ||
          d.topic?.toLowerCase().includes(q) ||
          d.country?.toLowerCase().includes(q) ||
          d.region?.toLowerCase().includes(q) ||
          d.source?.toLowerCase().includes(q)
      )
    }
    items.sort((a, b) => {
      let va = a[sortKey] ?? ''
      let vb = b[sortKey] ?? ''
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return items
  }, [data, search, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / perPage)
  const pageData = sorted.slice((page - 1) * perPage, page * perPage)

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const exportCSV = () => {
    const headers = ['Title', 'Sector', 'Topic', 'Country', 'Region', 'Intensity', 'Likelihood', 'Relevance', 'Source', 'Published']
    const rows = sorted.map((d) => [
      `"${(d.title || '').replace(/"/g, '""')}"`,
      d.sector,
      d.topic,
      d.country,
      d.region,
      d.intensity,
      d.likelihood,
      d.relevance,
      d.source,
      d.published,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'insights_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const sortIcon = (key) => {
    if (sortKey !== key) return null
    return sortDir === 'asc' ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <FilterBar />
        <h1 className="text-xl font-display font-bold text-text-primary">Insights Explorer</h1>
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
      <div className="space-y-4">
        <FilterBar />
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-surface-elevated/50 rounded-xl w-48" />
          <div className="h-8 bg-surface-elevated/50 rounded-xl w-full" />
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-elevated/40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <FilterBar />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">Insights Explorer</h1>
          <p className="text-xs text-text-muted">{sorted.length} insights</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-1/10 border border-accent-1/30 rounded-xl text-xs font-medium text-accent-1 hover:bg-accent-1/20 transition-all duration-150 min-h-[44px]"
        >
          <Download size={14} />
          <span className="hidden xs:inline">Export CSV</span>
          <span className="xs:hidden">CSV</span>
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title, sector, topic, country..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-surface/60 border border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-1/40 transition-all duration-150"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-subtle">
                {[
                  { key: 'title', label: 'Title', className: 'min-w-[200px]' },
                  { key: 'sector', label: 'Sector' },
                  { key: 'topic', label: 'Topic' },
                  { key: 'country', label: 'Country' },
                  { key: 'region', label: 'Region' },
                  { key: 'intensity', label: 'Intensity', className: 'text-center' },
                  { key: 'likelihood', label: 'Like', className: 'text-center' },
                  { key: 'relevance', label: 'Rel', className: 'text-center' },
                  { key: 'source', label: 'Source' },
                  { key: 'published', label: 'Published' },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors select-none ${col.className || ''}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {sortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((d, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedRow(d)}
                  className="border-b border-subtle hover:bg-surface-hover transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-3 py-3 text-text-primary text-xs max-w-[200px] truncate">
                    {d.title || d.insight}
                  </td>
                  <td className="px-3 py-3 text-xs text-text-secondary">{d.sector}</td>
                  <td className="px-3 py-3 text-xs">
                    <span className="bg-surface-elevated/50 text-text-secondary px-2 py-0.5 rounded-md text-[10px]">
                      {d.topic}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-text-secondary">{d.country}</td>
                  <td className="px-3 py-3 text-xs text-text-secondary">{d.region}</td>
                  <td className="px-3 py-3 text-xs text-center font-medium">
                    <span className={`px-2 py-0.5 rounded-md ${
                      d.intensity > 7 ? 'text-accent-1 bg-accent-1/10' :
                      d.intensity > 4 ? 'text-accent-2 bg-accent-2/10' :
                      'text-text-muted bg-surface-elevated/50'
                    }`}>
                      {d.intensity}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-center text-text-muted">{d.likelihood}</td>
                  <td className="px-3 py-3 text-xs text-center text-text-muted">{d.relevance}</td>
                  <td className="px-3 py-3 text-xs text-text-secondary">{d.source}</td>
                  <td className="px-3 py-3 text-xs text-text-muted whitespace-nowrap">
                    {d.published ? new Date(d.published).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-subtle">
            <p className="text-xs text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated/50 border border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 min-h-[36px]"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-elevated/50 border border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 min-h-[36px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {pageData.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedRow(d)}
            className="bg-card/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-subtle cursor-pointer active:scale-[0.98] transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2 flex-1">
                {d.title || d.insight}
              </p>
              <ChevronRight size={16} className="text-text-muted shrink-0 mt-0.5" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
              {d.sector && <span>{d.sector}</span>}
              {d.topic && (
                <span className="bg-surface-elevated/50 text-text-secondary px-1.5 py-0.5 rounded text-[10px]">
                  {d.topic}
                </span>
              )}
              {d.country && <span>{d.country}</span>}
              {d.region && <span>{d.region}</span>}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-subtle">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted">Intensity</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                  d.intensity > 7 ? 'text-accent-1 bg-accent-1/10' :
                  d.intensity > 4 ? 'text-accent-2 bg-accent-2/10' :
                  'text-text-muted bg-surface-elevated/50'
                }`}>
                  {d.intensity}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted">Like</span>
                <span className="text-xs text-text-secondary">{d.likelihood}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted">Rel</span>
                <span className="text-xs text-text-secondary">{d.relevance}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 pb-4">
            <p className="text-xs text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-surface-elevated/50 border border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 min-h-[44px]"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-surface-elevated/50 border border-subtle text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 min-h-[44px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      <AnimatePresence>
        {selectedRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRow(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg bg-surface h-full overflow-auto"
            >
              <div className="sticky top-0 bg-surface/90 backdrop-blur-md p-4 flex items-center justify-between border-b border-subtle">
                <h3 className="font-display font-semibold text-text-primary">Detail</h3>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-text-muted mb-1">Title</p>
                  <p className="text-sm text-text-primary font-medium">{selectedRow.title || selectedRow.insight}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Sector', value: selectedRow.sector },
                    { label: 'Topic', value: selectedRow.topic },
                    { label: 'Country', value: selectedRow.country },
                    { label: 'Region', value: selectedRow.region },
                    { label: 'PESTLE', value: selectedRow.pestle },
                    { label: 'Source', value: selectedRow.source },
                    { label: 'Intensity', value: selectedRow.intensity },
                    { label: 'Likelihood', value: selectedRow.likelihood },
                    { label: 'Relevance', value: selectedRow.relevance },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-text-muted">{f.label}</p>
                      <p className="text-sm text-text-primary">{f.value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Published</p>
                  <p className="text-sm text-text-primary">{selectedRow.published || 'N/A'}</p>
                </div>
                {selectedRow.url && (
                  <a
                    href={selectedRow.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent-1/10 border border-accent-1/30 rounded-xl text-xs font-medium text-accent-1 hover:bg-accent-1/20 transition-all duration-150 inline-flex min-h-[44px]"
                  >
                    <ExternalLink size={14} />
                    View Source
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
