import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Search,
  Globe2,
  PieChart,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/insights', label: 'Insights', icon: Search },
  { to: '/geography', label: 'Geography', icon: Globe2 },
  { to: '/sectors', label: 'Sectors & Topics', icon: PieChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ inline }) {
  const { sidebarCollapsed, toggleSidebar } = useThemeStore()
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches
  })
  const { pathname } = useLocation()

  useEffect(() => {
    if (inline) return
    const mq = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    setIsTablet(mq.matches)
    const handler = (e) => setIsTablet(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [inline])

  const collapsed = inline ? false : isTablet ? true : sidebarCollapsed

  const [effectiveCollapsed, setEffectiveCollapsed] = useState(collapsed)
  const [labelsVisible, setLabelsVisible] = useState(!collapsed)

  useEffect(() => {
    if (collapsed) {
      setLabelsVisible(false)
      const t = setTimeout(() => setEffectiveCollapsed(true), 120)
      return () => clearTimeout(t)
    } else {
      setEffectiveCollapsed(false)
      const t = setTimeout(() => setLabelsVisible(true), 180)
      return () => clearTimeout(t)
    }
  }, [collapsed])

  const isActive = (to) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <motion.div
      className="relative h-screen shrink-0"
      animate={{ width: effectiveCollapsed ? 72 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
    >
      <aside className="relative flex flex-col bg-surface h-full overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[var(--accent-glow)]" />

        <div className="absolute right-0 top-4 bottom-4 w-[1px] bg-gradient-to-b from-transparent via-border-subtle to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3 px-5 h-16 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white font-display font-bold text-sm">B</span>
          </div>
          <motion.span
            animate={{ opacity: labelsVisible ? 1 : 0, x: labelsVisible ? 0 : -8 }}
            transition={{ duration: 0.15 }}
            className="font-display font-bold text-base text-text-primary tracking-tight"
          >
            Blackcoffer
          </motion.span>
        </div>

        <div
          className={`px-6 overflow-hidden transition-all duration-150 ${labelsVisible ? 'opacity-100 max-h-8 mb-1' : 'opacity-0 max-h-0 mb-0'}`}
        >
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Main</p>
        </div>

        <nav className="relative flex-1 py-2 px-3 space-y-0.5 overflow-hidden">
          {navItems.map((item) => {
            const active = isActive(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  active
                    ? 'bg-accent-1/10 text-accent-1'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                } ${effectiveCollapsed ? 'justify-center px-0' : ''}`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent-1"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <item.icon size={20} className="shrink-0" />
                <motion.span
                  animate={{ opacity: labelsVisible ? 1 : 0, x: labelsVisible ? 0 : -4 }}
                  transition={{ duration: 0.12 }}
                  className="text-sm font-medium truncate"
                >
                  {item.label}
                </motion.span>
                {effectiveCollapsed && (
                  <div
                    className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface-elevated text-text-primary text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-50"
                    style={{ transitionDelay: '300ms' }}
                  >
                    {item.label}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="relative p-3 border-t border shrink-0">
          {effectiveCollapsed ? (
            <div className="flex items-center justify-center group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-2 to-accent-1 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                AD
              </div>
              <div
                className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface-elevated text-text-primary text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-50"
                style={{ transitionDelay: '300ms' }}
              >
                Admin User
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-2 to-accent-1 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0 ring-2 ring-accent-1/20">
                AD
              </div>
              <div
                className="flex-1 min-w-0 transition-all duration-150"
                style={{ opacity: labelsVisible ? 1 : 0 }}
              >
                <p className="text-sm font-medium text-text-primary leading-tight truncate">Admin User</p>
                <p className="text-xs text-text-muted truncate">admin@blackcoffer.com</p>
              </div>
              <button
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
                style={{ opacity: labelsVisible ? 1 : 0, transform: labelsVisible ? 'scale(1)' : 'scale(0.8)' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {!inline && !isTablet && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3.5 bottom-6 z-40 w-7 h-7 rounded-full bg-surface-elevated border border-subtle shadow-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface hover:border-hover hover:shadow-lg transition-all duration-200 cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}
    </motion.div>
  )
}
