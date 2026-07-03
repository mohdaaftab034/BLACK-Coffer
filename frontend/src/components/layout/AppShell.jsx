import { useState, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import SideDrawer from './SideDrawer'
import NotificationsPanel from '../notifications/NotificationsPanel'

export default function AppShell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mainRef = useRef(null)

  const handleScroll = useCallback(() => {
    if (mainRef.current) {
      setScrolled(mainRef.current.scrollTop > 0)
    }
  }, [])

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <SideDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        from="left"
        width={256}
      >
        <div className="relative h-full">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute -right-12 top-4 p-2 text-white/70 hover:text-white z-10"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <Sidebar inline />
        </div>
      </SideDrawer>

      <NotificationsPanel />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setMobileMenuOpen(true)} scrolled={scrolled} />
        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto p-4 lg:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
