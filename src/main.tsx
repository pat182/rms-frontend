
import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// @ts-ignore - Vite resolves CSS side-effect imports via its own type declarations.
import './assets/css/index.css'

import PrivateRoutes from './components/protected.tsx'
import GuestRoutes from './components/guestRoute.tsx'
import Login from './pages/login.tsx'
import Layout from './components/layout.tsx'

import { ToastProvider } from './components/globals/toastContext.tsx'
import { RestaurantProvider } from './components/globals/restaurantContext.tsx'

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/dashboard.tsx'))

const Menu = lazy(() => import('./pages/menu/menu.tsx'))
const CreateMenu = lazy(() => import('./pages/menu/createMenu.tsx'))

const Restaurant = lazy(() => import('./pages/restaurant/restaurant.tsx'))
const RestaurantCreate = lazy(() => import('./pages/restaurant/restaurantCreate.tsx'))
const Table = lazy(() => import('./pages/table/table.tsx'))
const TableCreate = lazy(() => import('./pages/table/tableCreate.tsx'))

const DiningSession = lazy(() => import('./pages/table/diningSession.tsx'))

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ToastProvider>
            <BrowserRouter>
                <RestaurantProvider>
                    <Routes>
                        <Route element={<GuestRoutes />}>
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="/login" element={<Login />} />
                        </Route>

                        <Route element={<PrivateRoutes />}>
                            <Route element={<Layout />}>
                                <Route path="/dashboard" element={<Dashboard />} />

                                <Route path="/menu" element={<Menu />} />
                                <Route path="/menu/create" element={<CreateMenu />} />
                                <Route path="/menu/edit/:id" element={<CreateMenu />} />

                                <Route path="/restaurant" element={<Restaurant />} />
                                <Route path="/restaurant/create" element={<RestaurantCreate />} />
                                <Route path="/restaurant/edit/:id" element={<RestaurantCreate />} />

                                <Route path="/table" element={<Table />} />
                                <Route path="/table/create" element={<TableCreate />} />
                                <Route path="/table/edit/:id" element={<TableCreate />} />

                                <Route path="/dining-sessions" element={<DiningSession />} />
                            </Route>
                        </Route>
                    </Routes>
                </RestaurantProvider>
            </BrowserRouter>
        </ToastProvider>
    </StrictMode>,
)
