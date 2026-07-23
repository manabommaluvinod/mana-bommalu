import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { faMapMarkerAlt, faPhone, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons'
import styles from './Footer.module.css'

const Footer = ({ isHomePage }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768)
  const currentYear = new Date().getFullYear()

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Desktop Footer
  if (!isMobile) {
    return (
      <footer className={styles.desktopFooter}>
        <div className={styles.desktopContainer}>
          <div className={styles.desktopGrid}>
            {/* Brand Section */}
            <div className={styles.desktopSection}>
              <div className={styles.desktopLogoWrapper}>
                <img src="/logo.png" alt="Mana Bommalu" className={styles.desktopLogoImg} />
                <h3 className={styles.desktopLogo}>Mana Bommalu</h3>
              </div>
              <p className={styles.desktopDescription}>
                Preserving the rich heritage of Etikoppaka wooden toys. Each piece is handcrafted with love and natural dyes.
              </p>
              <div className={styles.desktopSocial}>
                <a href="https://www.instagram.com/mana_bommalu_official" className={styles.desktopSocialLink}><FontAwesomeIcon icon={faInstagram} /></a>
                <a href="https://www.youtube.com/@manabommalu-n2x" className={styles.desktopSocialLink}><FontAwesomeIcon icon={faYoutube} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.desktopSection}>
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className={styles.desktopSection}>
              <h4>Contact Info</h4>
              <div className={styles.desktopContactInfo}>
                <p><FontAwesomeIcon icon={faMapMarkerAlt} /> Etikoppaka Village, AP</p>
                <p><FontAwesomeIcon icon={faPhone} /> +91 9014255912</p>
                <p><FontAwesomeIcon icon={faEnvelope} /> vinod@manabommalu.store</p>
                <p><FontAwesomeIcon icon={faClock} /> Mon-Sat: 9AM - 7PM</p>
              </div>
            </div>
          </div>

          <div className={styles.desktopBottom}>
            <p>&copy; {currentYear} Mana Bommalu. All rights reserved.</p>
            <p className={styles.developedBy}>
              Developed by <a href="https://brandversetech.com" target="_blank" rel="noopener noreferrer">Brandverse Technologies India Pvt Ltd</a>
            </p>
          </div>
        </div>
      </footer>
    )
  }

  // Mobile Footer (only visible on home page)
  if (isMobile && !isHomePage) return null

  return (
    <footer className={styles.mobileFooter}>
      <div className={styles.mobileContainer}>
        {/* Brand Section */}
        <div className={styles.mobileBrand}>
          <img src="/logo.png" alt="Mana Bommalu" className={styles.mobileLogoImg} />
          <h3 className={styles.mobileLogo}>Mana Bommalu</h3>
          <p className={styles.mobileDescription}>
            Preserving the rich heritage of Etikoppaka wooden toys. Each piece is handcrafted with love and natural dyes.
          </p>
        </div>

        {/* Quick Links - Horizontal layout (Side by Side) */}
        <div className={styles.mobileQuickLinks}>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Contact Info */}
        <div className={styles.mobileContact}>
          <h4>Contact Us</h4>
          <p><FontAwesomeIcon icon={faPhone} /> +91 9014255912</p>
          <p><FontAwesomeIcon icon={faEnvelope} /> vinod@manabommalu.store</p>
          <p><FontAwesomeIcon icon={faMapMarkerAlt} /> Etikoppaka, AP</p>
        </div>

        {/* Social Icons */}
        <div className={styles.mobileSocial}>
          <a href="https://www.instagram.com/mana_bommalu_official" className={styles.mobileSocialLink}><FontAwesomeIcon icon={faInstagram} /></a>
          <a href="https://www.youtube.com/@manabommalu-n2x" className={styles.mobileSocialLink}><FontAwesomeIcon icon={faYoutube} /></a>
        </div>

        {/* Bottom */}
        <div className={styles.mobileBottom}>
          <p>&copy; {currentYear} All rights reserved.</p>
          <p className={styles.mobileDevelopedBy}>
            Developed by <a href="https://brandversetech.com" target="_blank" rel="noopener noreferrer">Brandverse Technologies India Pvt Ltd</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer