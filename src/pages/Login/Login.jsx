import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLock, faEye, faEyeSlash, faSignInAlt, faUserShield, faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from './Login.module.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.is_admin) {
        navigate('/admin/dashboard')
      }
    }
    return () => window.removeEventListener('resize', checkMobile)
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Trim and clean inputs
      const cleanEmail = email.toLowerCase().trim()
      const cleanPassword = password.trim()
      
      console.log('Attempting login with:', cleanEmail)
      
      // First, check if the users table exists and has data
      const { data: tableCheck, error: tableError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (tableError) {
        console.error('Table error:', tableError)
        throw new Error('Database connection issue. Please check Supabase setup.')
      }
      
      // Query for admin user
      const { data, error: queryError } = await supabase
        .from('users')
        .select('id, email, is_admin')
        .eq('email', cleanEmail)
        .eq('password', cleanPassword)
        .eq('is_admin', true)
        .maybeSingle() // Use maybeSingle instead of single to avoid 406 error

      if (queryError) {
        console.error('Query error:', queryError)
        throw new Error('Error connecting to database')
      }

      if (!data) {
        // Try without admin filter to see if user exists but is not admin
        const { data: userCheck } = await supabase
          .from('users')
          .select('is_admin')
          .eq('email', cleanEmail)
          .maybeSingle()
        
        if (userCheck && !userCheck.is_admin) {
          throw new Error('This account does not have admin privileges')
        }
        throw new Error('Invalid email or password')
      }

      // Store admin user data
      const adminData = {
        id: data.id,
        email: data.email,
        is_admin: true
      }

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(adminData))
      } else {
        sessionStorage.setItem('user', JSON.stringify(adminData))
      }
      
      navigate('/admin/dashboard')
      window.location.reload()
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.mobileCard}>
          <div className={styles.mobileLogo}>
            <img src="/logo.png" alt="Mana Bommalu" className={styles.mobileLogoImg} />
          </div>
          <h1>Admin Login</h1>
          <p>Access your dashboard</p>

          <form onSubmit={handleSubmit} className={styles.mobileForm}>
            <div className={styles.mobileInputGroup}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.mobileInputIcon} />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.mobileInputGroup}>
              <FontAwesomeIcon icon={faLock} className={styles.mobileInputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.mobilePasswordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <label className={styles.mobileCheckbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            {error && <div className={styles.mobileError}>{error}</div>}

            <button type="submit" className={styles.mobileLoginBtn} disabled={loading}>
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSignInAlt} />}
              {loading ? ' Logging in...' : ' Admin Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Desktop View
  return (
    <div className={styles.desktopContainer}>
      <div className={styles.desktopWrapper}>
        <div className={styles.desktopLeft}>
          <div className={styles.desktopBrand}>
            <img src="/logo.png" alt="Mana Bommalu" className={styles.desktopLogo} />
            <h1>Mana Bommalu</h1>
            <p>Traditional Etikoppaka Toys</p>
            <div className={styles.desktopFeatures}>
              <div className={styles.desktopFeature}>
                <span>✓</span>
                <span>Handcrafted with love</span>
              </div>
              <div className={styles.desktopFeature}>
                <span>✓</span>
                <span>Natural dyes & wood</span>
              </div>
              <div className={styles.desktopFeature}>
                <span>✓</span>
                <span>Premium quality</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.desktopRight}>
          <div className={styles.desktopLoginBox}>
            <div className={styles.desktopHeader}>
              <div className={styles.desktopAdminBadge}>
                <FontAwesomeIcon icon={faUserShield} /> Admin Portal
              </div>
              <h2>Admin Login</h2>
              <p>Access your store management dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.desktopForm}>
              <div className={styles.desktopInputGroup}>
                <label>Admin Email</label>
                <div className={styles.desktopInputWrapper}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.desktopInputIcon} />
                  <input
                    type="email"
                    placeholder="admin@manabommalu.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.desktopInputGroup}>
                <label>Password</label>
                <div className={styles.desktopInputWrapper}>
                  <FontAwesomeIcon icon={faLock} className={styles.desktopInputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.desktopPasswordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className={styles.desktopOptions}>
                <label className={styles.desktopCheckbox}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {error && <div className={styles.desktopError}>{error}</div>}

              <button type="submit" className={styles.desktopLoginBtn} disabled={loading}>
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSignInAlt} />}
                {loading ? ' Logging in...' : ' Login to Dashboard'}
              </button>
            </form>

            <div className={styles.desktopSecurityNote}>
              <span>🔒</span>
              <p>Secure admin access only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login