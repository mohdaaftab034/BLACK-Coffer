import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import CardShell from './CardShell'

const SECTOR_COLORS = {
  Energy: '#4F46E5',
  Technology: '#7C3AED',
  'Financial Services': '#06B6D4',
  Healthcare: '#DC2626',
  Agriculture: '#D97706',
  Manufacturing: '#EA580C',
  Environmental: '#16A34A',
  Other: '#8B9DC3',
}

export default function BubbleChart({ data = [] }) {
  const ref = useRef()
  const tooltipRef = useRef()

  useEffect(() => {
    if (!ref.current || !data.length) return

    const el = ref.current.closest('[data-chart-context]') || document.documentElement
    const isDark = el.classList.contains('dark')
    const axisColor = isDark ? '#7C86A4' : '#8B90A5'
    const gridColor = isDark ? '#2D3550' : '#E7E9F0'
    const tooltipBg = isDark ? '#1A1F2E' : '#FFFFFF'
    const tooltipBorder = isDark ? '#2D3550' : '#E7E9F0'
    const tooltipText = isDark ? '#B0B8CC' : '#5B5F73'
    const tooltipStrong = isDark ? '#FFFFFF' : '#12131A'

    const container = ref.current.parentElement
    const width = container ? container.clientWidth : ref.current.clientWidth
    const isMobile = width < 500
    const height = isMobile ? 350 : 500
    const margin = { top: 40, right: 20, bottom: 40, left: 60 }

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const valid = data.filter(
      (d) => d.intensity > 0 || d.likelihood > 0 || d.relevance > 0
    )

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(valid, (d) => d.likelihood) || 1])
      .range([0, innerW])
      .nice()

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(valid, (d) => d.relevance) || 1])
      .range([innerH, 0])
      .nice()

    const rScale = d3
      .scaleSqrt()
      .domain([0, d3.max(valid, (d) => d.intensity) || 1])
      .range([8, 55])

    const colorScale = d3
      .scaleOrdinal()
      .domain(Object.keys(SECTOR_COLORS))
      .range(Object.values(SECTOR_COLORS))

    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6))

    const yAxis = g
      .append('g')
      .call(d3.axisLeft(yScale).ticks(6))

    g.selectAll('.domain').attr('stroke', gridColor)
    g.selectAll('.tick line').attr('stroke', gridColor)
    g.selectAll('.tick text').attr('fill', axisColor).attr('font-size', '11px')

    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 30)
      .attr('text-anchor', 'middle')
      .attr('fill', axisColor)
      .attr('font-size', '11px')
      .text('Likelihood')

    g.append('text')
      .attr('x', -40)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', axisColor)
      .attr('font-size', '11px')
      .attr('transform', 'rotate(-90)')
      .text('Relevance')

    const tooltip = d3.select(tooltipRef.current)

    const bubbles = g
      .selectAll('circle')
      .data(valid)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.likelihood))
      .attr('cy', (d) => yScale(d.relevance))
      .attr('r', 0)
      .attr('fill', (d) => colorScale(d.sector || 'Other'))
      .attr('opacity', 0.75)
      .attr('stroke', isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)')
      .attr('stroke-width', 1)
      .on('mouseenter', function (e, d) {
        d3.select(this).transition().duration(200).attr('opacity', 1).attr('stroke-width', 2)
        tooltip
          .style('opacity', 1)
          .style('left', `${e.pageX + 12}px`)
          .style('top', `${e.pageY - 12}px`).html(`
            <div style="font-size:12px;font-weight:600;margin-bottom:4px;color:${tooltipStrong}">${d.title || d.insight}</div>
            <div style="display:flex;gap:12px;font-size:11px;color:${tooltipText};">
              <span>Intensity: <strong style="color:${tooltipStrong}">${d.intensity}</strong></span>
              <span>Likelihood: <strong style="color:${tooltipStrong}">${d.likelihood}</strong></span>
              <span>Relevance: <strong style="color:${tooltipStrong}">${d.relevance}</strong></span>
            </div>
            <div style="font-size:10px;color:${axisColor};margin-top:4px;">${d.sector} \u00B7 ${d.region}</div>
          `)
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(200).attr('opacity', 0.75).attr('stroke', isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)')
        tooltip.style('opacity', 0)
      })

    bubbles
      .transition()
      .duration(800)
      .delay((_, i) => i * 15)
      .ease(d3.easeElasticOut.amplitude(0.5).period(0.4))
      .attr('r', (d) => rScale(d.intensity))

    g.append('g')
      .selectAll('text')
      .data(valid.filter((d) => d.intensity > 5))
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.likelihood))
      .attr('y', (d) => yScale(d.relevance) + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '8px')
      .attr('font-weight', 500)
      .attr('opacity', 0.8)
      .text((d) => (d.topic || '').substring(0, 8))

    return () => svg.selectAll('*').remove()
  }, [data])

  if (!data.length) {
    return (
      <CardShell title="Insights Bubble Map">
        <div className="flex items-center justify-center h-64 text-text-muted text-sm">No data</div>
      </CardShell>
    )
  }

  return (
    <CardShell title="Insights Bubble Map" className="overflow-hidden">
      <div data-chart-context>
        <div className="relative">
          <svg ref={ref} className="w-full" style={{ minHeight: 'min(500px, 80vw)' }} />
          <div
            ref={tooltipRef}
            className="fixed pointer-events-none rounded-xl px-4 py-3 shadow-lg z-50"
            style={{
              opacity: 0,
              transition: 'opacity 0.2s',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
              <div key={sector} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-text-secondary">{sector}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  )
}
