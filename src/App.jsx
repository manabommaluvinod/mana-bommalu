import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import BottomNav from './components/BottomNav/BottomNav'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Products from './pages/Products/Products'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Contact from './pages/Contact/Contact'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminProducts from './pages/Admin/AdminProducts'
import styles from './App.module.css'
import AdminCategories from './pages/Admin/AdminCategories'

function AppContent() {
  const location = useLocation()
  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isAdmin = user ? JSON.parse(user).is_admin === true : false
  const isHomePage = location.pathname === '/'

  return (
    <div className={styles.app}>
      <Navbar />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/dashboard" element={
            isAdmin ? <AdminDashboard /> : <Navigate to="/login" />
          } />
          <Route path="/admin/products" element={
            isAdmin ? <AdminProducts /> : <Navigate to="/login" />
          } />
          <Route path="/admin/products/:id" element={
            isAdmin ? <AdminProducts /> : <Navigate to="/login" />
          } />
          <Route path="/admin/categories" element={
            isAdmin ? <AdminCategories  /> : <Navigate to="/login" />
          } />
        </Routes>
      </main>
      <Footer isHomePage={isHomePage} />
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App 
