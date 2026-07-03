import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  Moon,
  Sun,
  Bell,
  Search,
  Menu,
} from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useSearchStore } from '../../store/searchStore'
import { useNotificationStore } from '../../store/notificationStore'

const pageNames = {
  '/': 'Overview',
  '/insights': 'Insights Explorer',
  '/geography': 'Geography',
  '/sectors': 'Sectors & Topics',
  '/settings': 'Settings',
}

export default function Navbar({ onMenuToggle, scrolled }) {
  const { dark, toggleDark } = useThemeStore()
  const { open: openSearch } = useSearchStore()
  const { toggle: toggleNotifications, unreadCount } = useNotificationStore()
  const { pathname } = useLocation()

  const pageName = pageNames[pathname] || 'Dashboard'

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [openSearch])

  return (
    <header
      className={`h-16 bg-surface/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0 transition-shadow duration-150 ${
        scrolled ? 'shadow-md' : 'shadow-none'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <span className="font-display font-semibold text-base sm:text-lg text-text-primary truncate">
          {pageName}
        </span>

        <div className="hidden sm:block w-px h-5 bg-black/[0.08] dark:bg-white/[0.1] shrink-0 mx-1" />

        <button
          onClick={openSearch}
          className="relative hidden sm:block min-w-0 max-w-full group cursor-pointer"
        >
          <div className="flex items-center gap-2 w-48 md:w-64 lg:w-80 bg-surface-elevated/50 hover:bg-surface-elevated/80 rounded-lg pl-10 pr-12 py-2 text-sm text-text-muted/60 text-left transition-all duration-150">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <span className="truncate">Search insights...</span>
          </div>
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-surface/70 text-[10px] font-medium text-text-muted pointer-events-none">
            <span className="text-[9px]">&#8984;</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={openSearch}
          className="sm:hidden p-2.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open search"
        >
          <Search size={18} />
        </button>

        <button
          onClick={toggleDark}
          className="p-2.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle theme"
        >
          <motion.div
            key={dark ? 'moon' : 'sun'}
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.div>
        </button>

        <button
          onClick={toggleNotifications}
          className="relative p-2.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center hidden xs:flex"
          aria-label="Toggle notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-1 text-[10px] font-bold text-white flex items-center justify-center leading-none shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="ml-1 flex items-center gap-2 pl-1.5 border-l border-black/[0.06] dark:border-white/[0.08]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-2 to-accent-1 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
            AD
          </div>
          <div className="hidden md:block min-w-0">
            <p className="text-sm font-medium text-text-primary leading-tight truncate">Admin User</p>
            <p className="text-xs text-text-muted truncate">admin@blackcoffer.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}
