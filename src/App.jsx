import './App.css'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'
import SignupScreen from './components/SignupScreen'
import ServiceList from './components/ServiceList'
import AppointmentList from './components/AppointmentList'
import InventoryList from './components/InventoryList'
import InventoryTypesList from './components/InventoryTypeList'

function App() {

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta por defecto que redirige al login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
              path='/login'
              element={
                <PublicRoute>
                  <LoginScreen />
                </PublicRoute>
              }
            />

            <Route
              path='/signup'
              element={
                <PublicRoute>
                  <SignupScreen />
                </PublicRoute>
              }
            />

            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path='/services'
              element={
                <ProtectedRoute>
                  <ServiceList />
                </ProtectedRoute>
              }
            />

             <Route
              path='/appointments'
              element={
                <ProtectedRoute>
                  <AppointmentList />
                </ProtectedRoute>
              }
            />

            <Route
              path='/inventories'
              element={
                <ProtectedRoute>
                  <InventoryList />
                </ProtectedRoute>
              }
            />

            <Route
              path='/inventorytypes'
              element={
                <ProtectedRoute>
                  <InventoryTypesList />
                </ProtectedRoute>
              }
            />




          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App