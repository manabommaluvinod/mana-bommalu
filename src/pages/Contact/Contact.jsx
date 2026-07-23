import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarkerAlt, faPhone, faEnvelope, faClock, } from '@fortawesome/free-solid-svg-icons'
import { faFacebook as faFacebookBrand, faInstagram as faInstagramBrand, faTwitter as faTwitterBrand, faYoutube as faYoutubeBrand } from '@fortawesome/free-brands-svg-icons'
import styles from './Contact.module.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    
    const { error } = await supabase
      .from('contact_messages')
      .insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        is_read: false
      }])
    
    if (!error) {
      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus(''), 3000)
    } else {
      setStatus('error')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.mobileHeader}>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>

        <div className={styles.mobileInfoCards}>
          <div className={styles.mobileInfoCard}>
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <div>
              <h3>Visit Us</h3>
              <p>Etikoppaka Village, Visakhapatnam District, Andhra Pradesh - 531082</p>
            </div>
          </div>
          <div className={styles.mobileInfoCard}>
            <FontAwesomeIcon icon={faPhone} />
            <div>
              <h3>Call Us</h3>
              
              <p>+91 9014255912</p>
            </div>
          </div>
          <div className={styles.mobileInfoCard}>
            <FontAwesomeIcon icon={faEnvelope} />
            <div>
              <h3>Email Us</h3>
              
              <p>vinod@manabommalu.store</p>
            </div>
          </div>
          <div className={styles.mobileInfoCard}>
            <FontAwesomeIcon icon={faClock} />
            <div>
              <h3>Business Hours</h3>
              <p>Monday - Saturday: 9AM - 7PM</p>
              <p>Sunday: 10AM - 5PM</p>
            </div>
          </div>
        </div>

        <div className={styles.mobileFormContainer}>
          <h2>Send us a message</h2>
          <form onSubmit={handleSubmit} className={styles.mobileForm}>
            <input
              type="text"
              placeholder="Your Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Your Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
            <textarea
              placeholder="Your Message *"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            />
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'success' && <div className={styles.mobileSuccessMsg}>✓ Message sent successfully!</div>}
            {status === 'error' && <div className={styles.mobileErrorMsg}>✗ Failed to send. Please try again.</div>}
          </form>
        </div>

       
      </div>
    )
  }

  // Desktop View
  return (
    <div className={styles.desktopContainer}>
      <div className={styles.hero}>
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you</p>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.infoSection}>
            <h2>Contact Information</h2>
            <p>Have questions about our products? Reach out to us anytime.</p>
            
            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} />
                <div>
                  <h3>Visit Us</h3>
                  <p>Etikoppaka Village, Visakhapatnam District, Andhra Pradesh - 531082</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FontAwesomeIcon icon={faPhone} className={styles.icon} />
                <div>
                  <h3>Call Us</h3>
                  <p>Customer Support: +91 9014255912</p>
                  <p>WhatsApp: +91 9014255912</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
                <div>
                  <h3>Email Us</h3>
                  <p>vinod@manabommalu.store</p>
                 
                </div>
              </div>

              <div className={styles.infoCard}>
                <FontAwesomeIcon icon={faClock} className={styles.icon} />
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
                  <p>Sunday: 10:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>

            
          </div>

          <div className={styles.formSection}>
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
              <textarea
                placeholder="Your Message *"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              />
              <button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'success' && <div className={styles.successMsg}>✓ Message sent successfully! We'll get back to you soon.</div>}
              {status === 'error' && <div className={styles.errorMsg}>✗ Failed to send message. Please try again.</div>}
            </form>
          </div>
        </div>

        <div className={styles.mapSection}>
          <h2>Find Us Here</h2>
          <div className={styles.mapContainer}>
            <iframe
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243576.764805842!2d82.89122074335938!3d17.555781100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395f64f6b46255%3A0x5b3f5b3f5b3f5b3f!2sEtikoppaka%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact