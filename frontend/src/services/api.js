const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

async function request(endpoint, params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      if (value.length) query.set(key, value.join(','))
    } else {
      query.set(key, String(value))
    }
  })
  const qs = query.toString()
  const url = `${BASE_URL}${endpoint}${qs ? `?${qs}` : ''}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `API error: ${res.status}`)
  }
  return res.json()
}

export async function getFilteredData(filters = {}) {
  const params = {}
  if (filters.endYear) params.endYear = filters.endYear
  if (filters.topics?.length) params.topic = filters.topics
  if (filters.sectors?.length) params.sector = filters.sectors
  if (filters.regions?.length) params.region = filters.regions
  if (filters.pestle?.length) params.pestle = filters.pestle
  if (filters.source) params.source = filters.source
  if (filters.swot?.length) params.swot = filters.swot
  if (filters.countries?.length) params.country = filters.countries
  if (filters.city) params.city = filters.city
  if (filters.search) params.search = filters.search
  params.limit = filters.limit || 10000
  const result = await request('/insights', params)
  return result.data || []
}

export async function getUniqueFilterOptions() {
  const result = await request('/insights/filters')
  return result.data || {}
}

export async function getStats(filters = {}) {
  const params = {}
  if (filters.endYear) params.endYear = filters.endYear
  if (filters.topics?.length) params.topic = filters.topics
  if (filters.sectors?.length) params.sector = filters.sectors
  if (filters.regions?.length) params.region = filters.regions
  if (filters.pestle?.length) params.pestle = filters.pestle
  if (filters.source) params.source = filters.source
  if (filters.swot?.length) params.swot = filters.swot
  if (filters.countries?.length) params.country = filters.countries
  if (filters.city) params.city = filters.city
  return request('/insights/stats', params)
}

export async function getInsightById(id) {
  return request(`/insights/${id}`)
}
