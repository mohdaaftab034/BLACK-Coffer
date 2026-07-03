import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const directionConfig = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    panelClass: 'left-0 top-0 h-full',
    panelStyle: { width: '100%', maxWidth: 'var(--sd-width, 256px)' },
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    panelClass: 'right-0 top-0 h-full',
    panelStyle: { width: '100%', maxWidth: 'var(--sd-width, 400px)' },
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    panelClass: 'bottom-0 left-0 right-0 rounded-t-2xl',
    panelStyle: { maxHeight: 'var(--sd-max-height, 80vh)' },
  },
}

export default function SideDrawer({
  open,
  onClose,
  from = 'right',
  width,
  maxHeight,
  children,
}) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const cfg = directionConfig[from]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={cfg.initial}
            animate={cfg.animate}
            exit={cfg.exit}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`absolute bg-surface shadow-2xl flex flex-col ${cfg.panelClass}`}
            style={{
              ...cfg.panelStyle,
              ...(width ? { '--sd-width': `${width}px` } : {}),
              ...(maxHeight ? { '--sd-max-height': maxHeight } : {}),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
