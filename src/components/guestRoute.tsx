import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '../api/auth.ts'
import LoadingPage from '../pages/loadingPage.tsx'

const GuestRoutes = () => {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        let cancelled = false

        const checkAuth = async () => {
            try {
                // TEMPORARY: simulate loading for 2 seconds
                // await new Promise(resolve => setTimeout(resolve, 5000))

                const res = await getCurrentUser(true)

                if (!cancelled) {
                    setAuthenticated(res.ok)
                }
            } catch {
                if (!cancelled) {
                    setAuthenticated(false)
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        checkAuth()

        return () => {
            cancelled = true
        }
    }, [])

    if (loading) {
        return <LoadingPage message="Checking your session..." />
    }

    return authenticated
        ? <Navigate to="/dashboard" replace />
        : <Outlet />
}

export default GuestRoutes