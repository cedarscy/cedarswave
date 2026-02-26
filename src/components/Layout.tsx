import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'

interface Props {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📡', label: 'Scanner' },
  { to: '/journal', icon: '📝', label: 'Journal' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
]

export function Layout({ children }: Props) {
  const { user, logout } = useAuth()
  const { tier, isTrial, getDaysRemaining } = useSubscription()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const tierColors: Record<string, string> = {
    trial: 'text-[#4fc3f7] bg-[#0d2035] border-[#1e3050]',
    starter: 'text-[#607d9b] bg-[#0b1220] border-[#1e3050]',
    pro: 'text-[#4fc3f7] bg-[#0d2035] border-[#1565c0]',
    elite: 'text-[#ff9800] bg-[#1a0e00] border-[#ff6d00]',
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 flex flex-col border-r border-[#1e3050] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-secondary)' }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[#1e3050]">
          <Link to="/dashboard" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🌊</span>
            <span className="font-bold text-[#e0e6f0] text-lg" style={{ fontFamily: 'Space Grotesk' }}>
              Cedars Wave
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-3 border-b border-[#1e3050]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#1565c0] flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#e0e6f0] text-xs font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${tierColors[tier]}`}>
            {tier === 'trial' ? '🎯 Trial' : tier === 'starter' ? '⭐ Starter' : tier === 'pro' ? '🚀 Pro' : '👑 Elite'}
            {isTrial && <span className="opacity-70">· {getDaysRemaining()}d left</span>}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors no-underline ${
                  isActive
                    ? 'bg-[#1565c0] text-white'
                    : 'text-[#607d9b] hover:bg-[#1a2d45] hover:text-[#e0e6f0]'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="border-t border-[#1e3050] mt-2 pt-2">
            <NavLink
              to="/pricing"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors no-underline ${
                  isActive
                    ? 'bg-[#1565c0] text-white'
                    : 'text-[#607d9b] hover:bg-[#1a2d45] hover:text-[#e0e6f0]'
                }`
              }
            >
              <span>💳</span>
              <span>Pricing</span>
            </NavLink>
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[#1e3050]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#607d9b] hover:bg-[#1a2d45] hover:text-[#e0e6f0] transition-colors"
          >
            <span>🚪</span>
            <span>Sign out</span>
          </button>
          <p className="text-[#37474f] text-xs text-center mt-2">Made with Claude Opus 4.6 ✨</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Mobile header */}
        <header
          className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-[#1e3050]"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#607d9b] hover:text-[#e0e6f0] text-xl"
          >
            ☰
          </button>
          <span className="text-[#4fc3f7] font-bold" style={{ fontFamily: 'Space Grotesk' }}>
            🌊 Cedars Wave
          </span>
          <div className="w-6" />
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
