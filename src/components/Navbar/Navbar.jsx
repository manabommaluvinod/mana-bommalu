import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faStore,
  faEnvelope,
  faChartLine,
  faPlus,
  faSignOutAlt,
  faChild,
  faTags,
  faBoxes
} from '@fortawesome/free-solid-svg-icons'; import styles from './Navbar.module.css'

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setIsAdmin(userData.is_admin === false)
      setIsLoggedIn(true)
    } else {
      setIsAdmin(false)
      setIsLoggedIn(false)
    }

    return () => window.removeEventListener('resize', checkMobile)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    setIsAdmin(false)
    setIsLoggedIn(false)
    navigate('/')
    window.location.reload()
  }

  if (isMobile) return null

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.png" alt="Mana Bommalu" className={styles.logoImg} />
          {/* <span className={styles.logoText}>Mana Bommalu</span> */}
        </Link>

        <div className={styles.navLinks}>

          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === "/" ? styles.active : ""
              }`}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Home</span>
          </Link>

          <Link
            to="/products?category=kids"
            className={`${styles.navLink} ${location.pathname === "/products" &&
              query.get("category") === "kids"
              ? styles.active
              : ""
              }`}
          >
            <FontAwesomeIcon icon={faChild} />
            <span>Happy Kids</span>
          </Link>

          {/* <Link
            to="/products?maxPrice=300"
            className={`${styles.navLink} ${location.pathname === "/products" &&
              query.get("maxPrice") === "300"
              ? styles.active
              : ""
              }`}
          >
            <FontAwesomeIcon icon={faTags} />
            <span>Under ₹300</span>
          </Link> */}
          <Link
            to="/products?maxPrice=300"
            className={`${styles.navLink} ${location.pathname === "/products" &&
                query.get("maxPrice") === "300"
                ? styles.active
                : ""
              }`}
          >
            <FontAwesomeIcon icon={faTags} />
            <span>Under ₹300</span>
          </Link>

          {/* <Link
            to="/products?bulk=true"
            className={`${styles.navLink} ${location.pathname === "/products" &&
              query.get("bulk") === "true"
              ? styles.active
              : ""
              }`}
          >
            <FontAwesomeIcon icon={faBoxes} />
            <span>Bulk Orders</span>
          </Link> */}

          {/* <Link to="/products" className={`${styles.navLink} ${location.pathname === "/products" ? styles.active: ""}`}>
            <FontAwesomeIcon icon={faStore} />
            <span>Products</span>
          </Link> */}
          <Link
            to="/products"
            className={`${styles.navLink} ${location.pathname === "/products" &&
              !query.get("maxPrice")
              ? styles.active
              : ""
              }`}
          >
            <FontAwesomeIcon icon={faStore} />
            <span>Products</span>
          </Link>
          <Link
            to="/contact"
            className={`${styles.navLink} ${location.pathname === "/contact" ? styles.active : ""
              }`}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            <span>Contact</span>
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                className={`${styles.navLink} ${location.pathname === "/admin/dashboard" ? styles.active : ""
                  }`}
              >
                <FontAwesomeIcon icon={faChartLine} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/admin/products"
                className={`${styles.navLink} ${location.pathname === "/admin/products" ? styles.active : ""
                  }`}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Product</span>
              </Link>

              <Link
                to="/admin/categories"
                className={`${styles.navLink} ${location.pathname === "/admin/categories" ? styles.active : ""
                  }`}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Category</span>
              </Link>
            </>
          )}

        </div>

        <div className={styles.authSection}>
          {/* {!isLoggedIn ? (
            <Link to="/login" className={styles.loginBtn}>
              <FontAwesomeIcon icon={faSignInAlt} />
              <span>Admin Login</span>
            </Link>
          ) : (
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          )} */}
          {isLoggedIn && (
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar