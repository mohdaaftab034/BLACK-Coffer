export function getUniqueValues(data, key) {
  return [...new Set(data.map((d) => d[key]).filter((v) => v !== '' && v != null))]
}

export function applyFilters(data, filters) {
  let result = [...data]
  if (filters.endYear) result = result.filter((d) => String(d.end_year) === String(filters.endYear))
  if (filters.topics?.length) result = result.filter((d) => filters.topics.includes(d.topic))
  if (filters.sectors?.length) result = result.filter((d) => filters.sectors.includes(d.sector))
  if (filters.regions?.length) result = result.filter((d) => filters.regions.includes(d.region))
  if (filters.pestle?.length) result = result.filter((d) => filters.pestle.includes(d.pestle))
  if (filters.source) result = result.filter((d) => d.source.toLowerCase().includes(String(filters.source).toLowerCase()))
  if (filters.swot?.length) result = result.filter((d) => filters.swot.includes(d.sector))
  if (filters.countries?.length) result = result.filter((d) => filters.countries.includes(d.country))
  if (filters.city) result = result.filter((d) => d.city?.toLowerCase().includes(String(filters.city).toLowerCase()))
  return result
}

export function computeAvg(data, key) {
  const vals = data.map((d) => Number(d[key])).filter((n) => !isNaN(n))
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

export function groupBy(data, key) {
  return data.reduce((acc, d) => {
    const k = d[key] || 'Unspecified'
    if (!acc[k]) acc[k] = []
    acc[k].push(d)
    return acc
  }, {})
}

export function groupAndAvg(data, groupKey, valueKey) {
  const grouped = groupBy(data, groupKey)
  return Object.entries(grouped).map(([name, items]) => ({
    name,
    value: computeAvg(items, valueKey),
    count: items.length,
  }))
}

export function groupAndSum(data, groupKey, valueKey) {
  const grouped = groupBy(data, groupKey)
  return Object.entries(grouped).map(([name, items]) => ({
    name,
    value: items.reduce((s, d) => s + Number(d[valueKey] || 0), 0),
    count: items.length,
  }))
}

export function getAggregates(data) {
  return {
    totalInsights: data.length,
    avgIntensity: computeAvg(data, 'intensity'),
    avgLikelihood: computeAvg(data, 'likelihood'),
    avgRelevance: computeAvg(data, 'relevance'),
    topSector: getTopItem(data, 'sector'),
  }
}

export function getTopItem(data, key) {
  const counts = {}
  data.forEach((d) => {
    const k = d[key] || 'Unspecified'
    counts[k] = (counts[k] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
}

export function getYearFromPublished(published) {
  if (!published) return null
  const year = new Date(published).getFullYear()
  return isNaN(year) ? null : year
}

export function getYearData(data) {
  const byYear = {}
  data.forEach((d) => {
    const year = getYearFromPublished(d.published)
    if (!year) return
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(d)
  })
  return Object.entries(byYear)
    .map(([year, items]) => ({
      year: Number(year),
      count: items.length,
      avgIntensity: computeAvg(items, 'intensity'),
      avgRelevance: computeAvg(items, 'relevance'),
    }))
    .sort((a, b) => a.year - b.year)
}

export function getHeatmapData(data, rowKey, colKey, valueKey = 'intensity') {
  const rows = [...new Set(data.map((d) => d[rowKey]).filter(Boolean))]
  const cols = [...new Set(data.map((d) => d[colKey]).filter(Boolean))]
  const grid = {}
  data.forEach((d) => {
    const r = d[rowKey]
    const c = d[colKey]
    if (!r || !c) return
    const key = `${r}|||${c}`
    if (!grid[key]) grid[key] = []
    grid[key].push(Number(d[valueKey]) || 0)
  })
  return rows.map((row) => ({
    row,
    values: cols.map((col) => {
      const vals = grid[`${row}|||${col}`] || []
      return {
        col,
        value: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
        count: vals.length,
      }
    }),
  }))
}