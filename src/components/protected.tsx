
import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '../api/auth'
import LoadingPage from '../pages/loadingPage.tsx'

const PrivateRoutes = () => {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        let cancelled = false

        const checkAuth = async () => {
            try {
                // TEMPORARY: simulate a slow authentication check
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

    if (loading) return <LoadingPage />

    return authenticated
        ? <Outlet />
        : <Navigate to="/login" replace />
}

export default PrivateRoutes
