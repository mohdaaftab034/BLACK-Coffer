import { motion } from 'framer-motion'
import {
  X,
  Bell,
  FileText,
  PieChart,
  RefreshCw,
  AlertTriangle,
  SlidersHorizontal,
  Settings,
} from 'lucide-react'
import { useNotificationStore } from '../../store/notificationStore'
import SideDrawer from '../layout/SideDrawer'

const typeConfig = {
  insight: { icon: FileText, bg: 'bg-accent-1/15 text-accent-1' },
  report: { icon: PieChart, bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  sync: { icon: RefreshCw, bg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' },
  alert: { icon: AlertTriangle, bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  preset: { icon: SlidersHorizontal, bg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
  system: { icon: Settings, bg: 'bg-text-muted/15 text-text-muted' },
}

function NotificationItem({ notification, onClick, isLast }) {
  const Icon = typeConfig[notification.type]?.icon || Bell
  const iconBg = typeConfig[notification.type]?.bg || 'bg-surface-hover text-text-muted'

  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-start gap-3 px-5 py-3.5 text-left transition-all duration-200 ${
        isLast ? '' : 'border-b border-subtle'
      } ${
        notification.read
          ? 'bg-transparent'
          : 'bg-accent-1/[0.03] dark:bg-accent-1/[0.05]'
      } hover:bg-surface-hover`}
    >
      {!notification.read && (
        <motion.span
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-1 shrink-0"
        />
      )}

      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
        <Icon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug truncate ${
          notification.read ? 'text-text-secondary' : 'text-text-primary font-medium'
        }`}>
          {notification.message}
        </p>
        <p className="text-xs text-text-muted mt-1">{notification.time}</p>
      </div>
    </button>
  )
}

export default function NotificationsPanel() {
  const { isOpen, close, activeTab, setTab, notifications, unreadCount, markAllAsRead, markAsRead } =
    useNotificationStore()

  const filtered = activeTab === 'unread' ? notifications.filter((n) => !n.read) : notifications

  return (
    <SideDrawer open={isOpen} onClose={close} from="right" width={400}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-semibold text-text-primary text-xl">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent-1/15 text-accent-1 text-[10px] font-bold leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-text-muted hover:text-accent-1 transition-colors px-2 py-1 rounded-lg hover:bg-surface-hover"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={close}
              className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 px-5 py-3 border-b border-subtle">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-surface-elevated text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'unread'
                ? 'bg-surface-elevated text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 text-accent-1 font-semibold">{unreadCount}</span>
            )}
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {filtered.length > 0 ? (
            filtered.map((n, i) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => {
                  if (!n.read) markAsRead(n.id)
                }}
                isLast={i === filtered.length - 1}
              />
            ))
          ) : (
            <div className="px-5 py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center mb-4">
                <Bell size={24} className="text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">All caught up!</p>
              <p className="text-xs text-text-muted">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-subtle px-5 py-3 flex justify-center shrink-0">
          <button
            onClick={close}
            className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            View all notifications
          </button>
        </div>
      </div>
    </SideDrawer>
  )
}
