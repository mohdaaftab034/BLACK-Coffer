import { motion } from 'framer-motion'

export default function CardShell({ title, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card backdrop-blur-sm rounded-xl p-5 shadow-sm ${className}`}
    >
      {title && (
        <h3 className="text-sm font-semibold text-text-primary mb-4 font-display">{title}</h3>
      )}
      {children}
    </motion.div>
  )
}
