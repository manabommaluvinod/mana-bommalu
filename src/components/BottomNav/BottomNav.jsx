import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faStore, faEnvelope, faChartLine, faPlus, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import styles from './BottomNav.module.css'

const BottomNav = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setIsAdmin(userData.is_admin === true)
      setIsLoggedIn(true)
    }
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    navigate('/')
    window.location.reload()
  }

  if (!isMobile) return null

  const isActive = (path) => location.pathname === path

  return (
    <div className={styles.bottomNav}>
      <Link to="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>
        <FontAwesomeIcon icon={faHome} className={styles.icon} />
        <span className={styles.label}>Home</span>
      </Link>

      <Link to="/products" className={`${styles.navItem} ${isActive('/products') ? styles.active : ''}`}>
        <FontAwesomeIcon icon={faStore} className={styles.icon} />
        <span className={styles.label}>Products</span>
      </Link>

      <Link to="/contact" className={`${styles.navItem} ${isActive('/contact') ? styles.active : ''}`}>
        <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
        <span className={styles.label}>Contact</span>
      </Link>

      {isAdmin && (
        <>
          <Link to="/admin/dashboard" className={`${styles.navItem} ${isActive('/admin/dashboard') ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faChartLine} className={styles.icon} />
            <span className={styles.label}>Admin</span>
          </Link>
          <Link to="/admin/products" className={`${styles.navItem} ${isActive('/admin/products') ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faPlus} className={styles.icon} />
            <span className={styles.label}>Add</span>
          </Link>
        </>
      )}

      {!isLoggedIn ? (
        <Link to="/login" className={`${styles.navItem} ${isActive('/login') ? styles.active : ''}`}>
          <FontAwesomeIcon icon={faSignInAlt} className={styles.icon} />
          <span className={styles.label}>Admin</span>
        </Link>
      ) : (
        <button onClick={handleLogout} className={styles.navItem}>
          <FontAwesomeIcon icon={faSignOutAlt} className={styles.icon} />
          <span className={styles.label}>Logout</span>
        </button>
      )}
    </div>
  )
}

export default BottomNav