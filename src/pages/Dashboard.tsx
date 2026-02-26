import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ScannerGrid } from '../components/Scanner/ScannerGrid'
import { useAuthStore } from '../store/authStore'
import { loadSubscription } from '../hooks/useAuth'

export function Dashboard() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [upgradeBanner, setUpgradeBanner] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setUpgradeBanner(true)
      // Refresh subscription tier
      if (user?.id) {
        loadSubscription(user.id)
      }
      // Remove param from URL
      navigate('/dashboard', { replace: true })
      // Auto-dismiss after 6s
      const t = setTimeout(() => setUpgradeBanner(false), 6000)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="relative">
      {upgradeBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d2035] border border-[#1565c0] text-[#e0e6f0] px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span className="text-lg">🎉</span>
          <span className="font-semibold">Subscription activated! Your plan is now live.</span>
          <button
            onClick={() => setUpgradeBanner(false)}
            className="ml-2 text-[#607d9b] hover:text-[#e0e6f0] bg-transparent border-none cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>
      )}
      <ScannerGrid />
    </div>
  )
}
