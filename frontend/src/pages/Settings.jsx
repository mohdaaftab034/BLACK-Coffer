import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'

export default function Settings() {
  const { dark, toggleDark, sidebarCollapsed, toggleSidebar } = useThemeStore()

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl font-display font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-xs text-text-muted mb-6">Configure dashboard preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card backdrop-blur-sm rounded-xl divide-y divide-border shadow-sm"
      >
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Dark Mode</p>
            <p className="text-xs text-text-muted mt-0.5">Toggle dark/light theme</p>
          </div>
          <button
            onClick={toggleDark}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              dark ? 'bg-accent-1/30' : 'bg-border'
            }`}
          >
            <motion.div
              layout
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ left: dark ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-text-primary">Collapsed Sidebar</p>
            <p className="text-xs text-text-muted mt-0.5">Show sidebar in icon-only mode</p>
          </div>
          <button
            onClick={toggleSidebar}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              sidebarCollapsed ? 'bg-accent-1/30' : 'bg-border'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ left: sidebarCollapsed ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>
    </div>
  )
}