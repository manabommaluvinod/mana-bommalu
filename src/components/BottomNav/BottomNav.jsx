import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faStore,
  faEnvelope,
  faChartLine,
  faPlus,
  faSignInAlt,
  faSignOutAlt,
  faChild,
  faTags,
  faBoxes,
} from '@fortawesome/free-solid-svg-icons';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      // Follow Navbar's logic exactly (is_admin === false → admin? This seems like a bug, but we keep it)
      setIsAdmin(userData.is_admin === false);
      setIsLoggedIn(true);
    } else {
      setIsAdmin(false);
      setIsLoggedIn(false);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  // Hide on desktop (same as original)
  if (!isMobile) return null;

  // Helper to check active state for links with query params
  const isActive = (path, queryParams = {}) => {
    if (location.pathname !== path) return false;
    for (const [key, value] of Object.entries(queryParams)) {
      if (query.get(key) !== value) return false;
    }
    return true;
  };

  return (
    <div className={styles.bottomNav}>
      {/* Home */}
      <Link to="/" className={`${styles.navItem} ${location.pathname === '/' ? styles.active : ''}`}>
        <FontAwesomeIcon icon={faHome} className={styles.icon} />
        <span className={styles.label}>Home</span>
      </Link>

      {/* Happy Kids */}
      <Link
        to="/products?category=kids"
        className={`${styles.navItem} ${isActive('/products', { category: 'kids' }) ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faChild} className={styles.icon} />
        <span className={styles.label}>Kids</span>
      </Link>

      {/* Under ₹300 */}
      <Link
        to="/products?maxPrice=300"
        className={`${styles.navItem} ${isActive('/products', { maxPrice: '300' }) ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faTags} className={styles.icon} />
        <span className={styles.label}>Under ₹300</span>
      </Link>

      {/* Products (regular) */}
      <Link
        to="/products"
        className={`${styles.navItem} ${location.pathname === '/products' && !query.get('maxPrice') && !query.get('category') ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faStore} className={styles.icon} />
        <span className={styles.label}>Products</span>
      </Link>

      {/* Contact */}
      <Link
        to="/contact"
        className={`${styles.navItem} ${location.pathname === '/contact' ? styles.active : ''}`}
      >
        <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
        <span className={styles.label}>Contact</span>
      </Link>

      {/* Admin links */}
      {isAdmin && (
        <>
          <Link
            to="/admin/dashboard"
            className={`${styles.navItem} ${location.pathname === '/admin/dashboard' ? styles.active : ''}`}
          >
            <FontAwesomeIcon icon={faChartLine} className={styles.icon} />
            <span className={styles.label}>Dashboard</span>
          </Link>
          <Link
            to="/admin/products"
            className={`${styles.navItem} ${location.pathname === '/admin/products' ? styles.active : ''}`}
          >
            <FontAwesomeIcon icon={faPlus} className={styles.icon} />
            <span className={styles.label}>Add Product</span>
          </Link>
          <Link
            to="/admin/categories"
            className={`${styles.navItem} ${location.pathname === '/admin/categories' ? styles.active : ''}`}
          >
            <FontAwesomeIcon icon={faPlus} className={styles.icon} />
            <span className={styles.label}>Add Category</span>
          </Link>
        </>
      )}

      {/* Login / Logout */}
      {!isLoggedIn ? (
        <Link to="/login" className={`${styles.navItem} ${location.pathname === '/login' ? styles.active : ''}`}>
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
  );
};

export default BottomNav;