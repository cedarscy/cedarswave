import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Code-split all pages for performance
const Landing = React.lazy(() => import('./pages/Landing').then((m) => ({ default: m.Landing })))
const Login = React.lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })))
const Signup = React.lazy(() => import('./pages/Signup').then((m) => ({ default: m.Signup })))
const Dashboard = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Journal = React.lazy(() => import('./pages/Journal').then((m) => ({ default: m.Journal })))
const Pricing = React.lazy(() => import('./pages/Pricing').then((m) => ({ default: m.Pricing })))
const Settings = React.lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const ApiKeys = React.lazy(() => import('./pages/ApiKeys').then((m) => ({ default: m.ApiKeys })))
const ResetPassword = React.lazy(() => import('./pages/ResetPassword').then((m) => ({ default: m.ResetPassword })))

const PageFallback = (
  <div className="flex items-center justify-center h-screen">
    <div className="text-[#4fc3f7]">Loading...</div>
  </div>
)

export function App() {
  // Initialize auth listener — called ONCE here
  useAuth()

  return (
    <Suspense fallback={PageFallback}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Pricing is public so non-logged-in users can see plans */}
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Layout>
                <Journal />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/api-keys"
          element={
            <ProtectedRoute>
              <Layout>
                <ApiKeys />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
