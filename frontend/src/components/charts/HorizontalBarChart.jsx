import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import CardShell from './CardShell'

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#DC2626', '#D97706', '#EA580C', '#16A34A', '#8B9DC3']

export default function HorizontalBarChart({ data = [], title = '', valueLabel = '' }) {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current || !data.length) return

    const el = ref.current.closest('[data-chart-context]') || document.documentElement
    const isDark = el.classList.contains('dark')
    const axisColor = isDark ? '#B0B8CC' : '#5B5F73'
    const valueColor = isDark ? '#7C86A4' : '#8B90A5'

    const width = ref.current.clientWidth
    const height = Math.max(data.length * 40 + 40, 60)
    const margin = { top: 20, right: 60, bottom: 20, left: 120 }

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const sorted = [...data].sort((a, b) => b.value - a.value)

    const yScale = d3
      .scaleBand()
      .domain(sorted.map((d) => d.name))
      .range([0, innerH])
      .padding(0.25)

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sorted, (d) => d.value) * 1.1 || 1])
      .range([0, innerW])

    const colorScale = d3.scaleOrdinal(COLORS)

    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll('text')
      .attr('fill', axisColor)
      .attr('font-size', '11px')
      .attr('font-weight', 500)

    g.selectAll('.domain').remove()

    sorted.forEach((d, i) => {
      const bar = g.append('rect')
        .attr('y', yScale(d.name))
        .attr('x', 0)
        .attr('height', yScale.bandwidth())
        .attr('fill', colorScale(i))
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('opacity', 0.85)
        .attr('width', 0)

      bar
        .transition()
        .duration(600)
        .delay(i * 80)
        .ease(d3.easeCubicOut)
        .attr('width', xScale(d.value))

      g.append('text')
        .attr('x', xScale(d.value) + 8)
        .attr('y', yScale(d.name) + yScale.bandwidth() / 2 + 4)
        .attr('fill', valueColor)
        .attr('font-size', '11px')
        .text(d.value.toFixed(d.value % 1 === 0 ? 0 : 1))
    })

    return () => svg.selectAll('*').remove()
  }, [data])

  if (!data.length) {
    return (
      <CardShell title={title}>
        <div className="flex items-center justify-center h-48 text-text-muted text-sm">No data</div>
      </CardShell>
    )
  }

  return (
    <CardShell title={title}>
      <div data-chart-context>
        <svg ref={ref} className="w-full" />
      </div>
    </CardShell>
  )
}
