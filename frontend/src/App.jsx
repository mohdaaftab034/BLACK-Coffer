import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useThemeStore } from './store/themeStore'
import { useSearchStore } from './store/searchStore'
import AppShell from './components/layout/AppShell'
import SearchOverlay from './components/search/SearchOverlay'
import Overview from './pages/Overview'
import InsightsExplorer from './pages/InsightsExplorer'
import Geography from './pages/Geography'
import SectorsTopics from './pages/SectorsTopics'
import Settings from './pages/Settings'

export default function App() {
  const { dark } = useThemeStore()
  const { isOpen, toggle, close } = useSearchStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return (
    <>
      <SearchOverlay />
      <AppShell>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/insights" element={<InsightsExplorer />} />
            <Route path="/geography" element={<Geography />} />
            <Route path="/sectors" element={<SectorsTopics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </>
  )
}