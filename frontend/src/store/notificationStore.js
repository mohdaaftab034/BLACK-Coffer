import { create } from 'zustand'

const mockNotifications = [
  {
    id: 1,
    type: 'insight',
    message: 'New insight added: Energy sector intensity report updated',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'report',
    message: 'Weekly summary is ready — Sectors & Topics analysis',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'sync',
    message: 'Data sync completed — 1,000 records refreshed',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 4,
    type: 'alert',
    message: 'High relevance alert: New insight in Environment sector',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'preset',
    message: 'Your filter preset "Asia Region Overview" was saved',
    time: '2 days ago',
    read: true,
  },
  {
    id: 6,
    type: 'insight',
    message: 'Renewable Energy investments in Southeast Asia show 34% growth YoY',
    time: '3 days ago',
    read: true,
  },
  {
    id: 7,
    type: 'system',
    message: 'Dashboard updated to v2.4 — new chart components available',
    time: '5 days ago',
    read: true,
  },
]

export const useNotificationStore = create((set, get) => ({
  isOpen: false,
  activeTab: 'all',
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setTab: (tab) => set({ activeTab: tab }),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  markAsRead: (id) =>
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }
    }),
}))
