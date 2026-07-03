import { motion } from 'framer-motion'
import { TrendingUp, Activity, Target, Zap } from 'lucide-react'

const kpiConfig = [
  {
    key: 'totalInsights',
    label: 'Total Insights',
    icon: Activity,
    accent: '#4F46E5',
    suffix: '',
    decimals: 0,
  },
  {
    key: 'avgIntensity',
    label: 'Avg Intensity',
    icon: Zap,
    accent: '#7C3AED',
    suffix: '',
    decimals: 1,
  },
  {
    key: 'avgLikelihood',
    label: 'Avg Likelihood',
    icon: TrendingUp,
    accent: '#06B6D4',
    suffix: '',
    decimals: 1,
  },
  {
    key: 'avgRelevance',
    label: 'Avg Relevance',
    icon: Activity,
    accent: '#16A34A',
    suffix: '',
    decimals: 1,
  },
  {
    key: 'topSector',
    label: 'Top Sector',
    icon: Target,
    accent: '#D97706',
    format: 'text',
    decimals: 0,
  },
]

function AnimatedNumber({ value, decimals = 0 }) {
  const display = typeof value === 'number' ? value.toFixed(decimals) : value
  return <span>{display}</span>
}

export default function KpiCards({ aggregates }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {kpiConfig.map((kpi, i) => {
        const val = aggregates[kpi.key]
        const Icon = kpi.icon

        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
            className="relative group"
          >
            <div className="bg-card rounded-xl p-4 hover:bg-card-hover transition-all duration-300 cursor-default h-full shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.accent}12`, color: kpi.accent }}
                >
                  <Icon size={18} />
                </div>
                <div
                  className="w-1.5 h-1.5 rounded-full opacity-60"
                  style={{ backgroundColor: kpi.accent }}
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  {kpi.label}
                </p>
                <motion.p
                  className="font-display text-2xl font-bold text-text-primary tracking-tight"
                  key={String(val)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedNumber value={val} decimals={kpi.decimals} />
                  {kpi.suffix}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
