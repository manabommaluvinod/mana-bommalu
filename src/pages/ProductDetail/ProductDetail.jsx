import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faTruck, faShieldAlt, faUndo, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons'
import styles from './ProductDetail.module.css'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    fetchProduct()
    
    const subscription = supabase
      .channel('product_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProduct())
      .subscribe()

    return () => {
      window.removeEventListener('resize', checkMobile)
      subscription.unsubscribe()
    }
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (data) {
      setProduct(data)
      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4)
      setRelatedProducts(related || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product Not Found</h2>
        <Link to="/products">Back to Products</Link>
      </div>
    )
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.mobileHeader}>
          <Link to="/products" className={styles.backLink}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </Link>
        </div>

        <div className={styles.mobileGallery}>
          <img src={product.images[selectedImage] || 'https://placehold.co/400'} alt={product.name} />
          {product.images.length > 1 && (
            <div className={styles.mobileThumbnails}>
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`${styles.thumb} ${selectedImage === idx ? styles.active : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.mobileInfo}>
          <h1>{product.name}</h1>
          <p className={styles.category}>{product.category}</p>
          <p className={styles.price}>₹{product.price.toLocaleString()}</p>
          
          
          <div className={styles.description}>
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className={styles.features}>
            <h3>Features</h3>
            <ul>
              <li>✓ Handcrafted with natural wood</li>
              <li>✓ Colored with organic dyes</li>
              <li>✓ Safe for children</li>
              <li>✓ Eco-friendly packaging</li>
            </ul>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className={styles.mobileRelated}>
            <h3>Related Products</h3>
            <div className={styles.relatedScroll}>
              {relatedProducts.map(related => (
                <Link to={`/product/${related.id}`} key={related.id} className={styles.relatedCard}>
                  <img src={related.images[0] || 'https://placehold.co/200'} alt={related.name} />
                  <h4>{related.name}</h4>
                  <p>₹{related.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop View
  return (
    <div className={styles.desktopContainer}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link> &gt; <Link to="/products">Products</Link> &gt; <span>{product.name}</span>
        </div>

        <div className={styles.productMain}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img src={product.images[selectedImage] || 'https://placehold.co/500'} alt={product.name} />
            </div>
            {product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`${styles.thumbnail} ${selectedImage === idx ? styles.active : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <h1>{product.name}</h1>
            <p className={styles.category}>{product.category}</p>
            
           

            <div className={styles.priceSection}>
              <span className={styles.price}>₹{product.price.toLocaleString()}</span>
             
            </div>

            <div className={styles.description}>
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className={styles.features}>
              <h3>Key Features</h3>
              <ul>
                <li>✓ Handcrafted with natural wood</li>
                <li>✓ Colored with organic dyes</li>
                <li>✓ Safe for children (non-toxic)</li>
                <li>✓ Eco-friendly packaging</li>
                <li>✓ Traditional Etikoppaka craftsmanship</li>
                <li>✓ Unique and one-of-a-kind piece</li>
              </ul>
            </div>

            <div className={styles.shippingInfo}>
              <div className={styles.shippingItem}>
                <FontAwesomeIcon icon={faTruck} />
                <span>Free shipping on orders over ₹500</span>
              </div>
              <div className={styles.shippingItem}>
                <FontAwesomeIcon icon={faUndo} />
                <span>30-day easy returns</span>
              </div>
              <div className={styles.shippingItem}>
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>Secure payment guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className={styles.relatedProducts}>
            <h2>You May Also Like</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map(related => (
                <Link to={`/product/${related.id}`} key={related.id} className={styles.relatedProductCard}>
                  <img src={related.images[0] || 'https://placehold.co/200'} alt={related.name} />
                  <h3>{related.name}</h3>
                  <p className={styles.relatedCategory}>{related.category}</p>
                  <p className={styles.relatedPrice}>₹{related.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail