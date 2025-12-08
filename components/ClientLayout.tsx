'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LiveChat from './LiveChat'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Don't show LiveChat on admin pages
  const isAdminPage = pathname?.startsWith('/admin')
  const showLiveChat = !isAdminPage && (!user || user.role !== 'admin')

  // Guest user info
  const guestUser = {
    id: 'guest_' + Date.now(),
    name: 'ผู้เยี่ยมชม',
    email: 'guest@example.com'
  }

  const chatUser = user || guestUser

  return (
    <>
      {children}
      {showLiveChat && (
        <LiveChat
          userId={chatUser.id}
          userName={chatUser.name}
          userEmail={chatUser.email}
        />
      )}
    </>
  )
}
