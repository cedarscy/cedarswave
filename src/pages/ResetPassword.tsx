import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 float-anim inline-block">🔑</div>
          <h1 className="text-2xl font-bold text-[#e0e6f0]" style={{ fontFamily: 'Space Grotesk' }}>
            Reset Password
          </h1>
          <p className="text-[#607d9b] text-sm mt-1">Enter your new password below</p>
        </div>

        <div className="card p-6">
          {success ? (
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-[#69f0ae] font-semibold">Password updated!</p>
              <p className="text-[#607d9b] text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[#607d9b] text-xs mb-1.5">New Password</label>
                <input
                  type="password"
                  className="input-base w-full"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-[#607d9b] text-xs mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  className="input-base w-full"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-[#3a0000] border border-[#c62828] text-[#ef9a9a] text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-2.5 w-full disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
