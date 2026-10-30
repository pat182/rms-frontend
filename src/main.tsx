import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route,Navigate } from 'react-router-dom'

// @ts-ignore - Vite resolves CSS side-effect imports via its own type declarations.
import './assets/css/index.css'

import Login from './pages/login.tsx'
import Dashboard from './pages/dashboard.tsx'
import Menu from './pages/menu/menu.tsx'
import CreateMenu from './pages/menu/createMenu.tsx'

import Table from './pages/table/table.tsx'

import PrivateRoutes from './components/protected.tsx'
import GuestRoutes from './components/guestRoute.tsx'
import Layout from './components/layout.tsx'
import { ToastProvider } from './components/globals/toastContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ToastProvider>
        <BrowserRouter>
            <Routes>
                <Route element={<GuestRoutes />}>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                </Route>
                
                <Route element={<PrivateRoutes />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/menu" element={<Menu />} />
                    <Route path="/menu/create" element={<CreateMenu />}/>
                    <Route path="/menu/edit/:id" element={<CreateMenu />}/>
                    <Route path="/table" element={<Table />}/>
                    
                  </Route>
                </Route>

            </Routes>
        </BrowserRouter>
      </ToastProvider>
  </StrictMode>,
)