import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import TopBar from './globals/header.tsx'
import SideBar from './globals/sidebar.tsx'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 768)
        }

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Fixed sidebar */}
            <SideBar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Fixed header */}
            <div
                className={`fixed right-0 top-0 z-20 h-16 transition-all duration-300 ${
                    sidebarOpen ? "md:left-64" : "md:left-16"
                } left-0`}
            >
                <TopBar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>

            {/* Scrollable page content */}
            <main
                className={`min-h-screen pt-16 transition-all duration-300 ${
                    sidebarOpen ? "md:ml-64" : "md:ml-16"
                }`}
            >
                <div className="min-h-full p-4 md:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}