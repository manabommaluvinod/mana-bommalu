import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'   // ✅ correct path
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faTruck, faShieldAlt, faUndo } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import styles from './ProductDetail.module.css'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Variant states
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [variantImages, setVariantImages] = useState([])

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch product
  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        setProduct(data)
        // Handle variants
        if (data.has_variants && data.variants?.length) {
          setSelectedVariant(data.variants[0])
          setVariantImages(data.variants[0].images || [])
        } else {
          const imgs = data.images || (data.image_url ? [data.image_url] : [])
          setVariantImages(imgs)
        }

        // Fetch related products
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .limit(4)
        setRelatedProducts(related || [])
      }
    } catch (err) {
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant)
    setVariantImages(variant.images || [])
    setSelectedImage(0)
  }

  const increaseQty = () => {
    if (quantity < getDisplayStock()) setQuantity(quantity + 1)
  }
  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const getDisplayPrice = () => {
    if (selectedVariant) return selectedVariant.price
    return product?.price || 0
  }

  const getDisplayStock = () => {
    if (selectedVariant) return selectedVariant.stock
    return product?.quantity || 0
  }

  const getImages = () => {
    if (variantImages.length) return variantImages
    const imgs = product?.images || []
    if (imgs.length) return imgs
    return product?.image_url ? [product.image_url] : ['/placeholder.jpg']
  }

  // WhatsApp handler
  const handleBuyNow = () => {
    const phone = '919014255912'
    const productName = product?.name || 'Product'
    const size = selectedVariant?.size || 'Standard'
    const price = getDisplayPrice()
    const qty = quantity
    const total = price * qty
    const message =
      `Hello, I want to buy:\n\nProduct: ${productName}\nSize: ${size}\nPrice per unit: ₹${price}\nQuantity: ${qty}\nTotal: ₹${total}\n\nPlease confirm availability and share payment details.`
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = url
    } else {
      window.open(url, '_blank')
    }
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

  const images = getImages()
  const price = getDisplayPrice()
  const stock = getDisplayStock()

  // Mobile view
  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.mobileHeader}>
          <Link to="/products" className={styles.backLink}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </Link>
        </div>

        <div className={styles.mobileGallery}>
          <img src={images[selectedImage] || '/placeholder.jpg'} alt={product.name} />
          {images.length > 1 && (
            <div className={styles.mobileThumbnails}>
              {images.map((img, idx) => (
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
          <p className={styles.price}>₹{price.toLocaleString()}</p>

          {product.has_variants && product.variants?.length > 0 && (
            <div className={styles.sizeSelector}>
              <h4>Select Size</h4>
              <div className={styles.sizeOptions}>
                {product.variants.map((v, idx) => (
                  <button
                    key={idx}
                    className={`${styles.sizeBtn} ${selectedVariant?.size === v.size ? styles.active : ''}`}
                    onClick={() => handleVariantSelect(v)}
                  >
                    {v.size} – ₹{v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.stockInfo}>
            {stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
          </div>

          <div className={styles.quantitySelector}>
            <h4>Quantity</h4>
            <div className={styles.quantityControls}>
              <button onClick={decreaseQty} disabled={quantity <= 1} className={styles.qtyBtn}>−</button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button onClick={increaseQty} disabled={quantity >= stock} className={styles.qtyBtn}>+</button>
            </div>
          </div>

          <button onClick={handleBuyNow} className={styles.buyNowBtn} disabled={stock === 0}>
            <FontAwesomeIcon icon={faWhatsapp} /> Buy Now on WhatsApp
          </button>

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
              <li>✓ Eco‑friendly packaging</li>
            </ul>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className={styles.mobileRelated}>
            <h3>Related Products</h3>
            <div className={styles.relatedScroll}>
              {relatedProducts.map(related => (
                <Link to={`/product/${related.id}`} key={related.id} className={styles.relatedCard}>
                  <img src={related.images?.[0] || '/placeholder.jpg'} alt={related.name} />
                  <h4>{related.name}</h4>
                  <p>₹{related.price?.toLocaleString() || 'Varies'}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop view
  return (
    <div className={styles.desktopContainer}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link> &gt; <Link to="/products">Products</Link> &gt; <span>{product.name}</span>
        </div>

        <div className={styles.productMain}>
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img src={images[selectedImage] || '/placeholder.jpg'} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, idx) => (
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
            <p className={styles.price}>₹{price.toLocaleString()}</p>

            {product.has_variants && product.variants?.length > 0 && (
              <div className={styles.sizeSelector}>
                <h4>Select Size</h4>
                <div className={styles.sizeOptions}>
                  {product.variants.map((v, idx) => (
                    <button
                      key={idx}
                      className={`${styles.sizeBtn} ${selectedVariant?.size === v.size ? styles.active : ''}`}
                      onClick={() => handleVariantSelect(v)}
                    >
                      {v.size} – ₹{v.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.stockInfo}>
              {stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
            </div>

            <div className={styles.quantitySelector}>
              <h4>Quantity</h4>
              <div className={styles.quantityControls}>
                <button onClick={decreaseQty} disabled={quantity <= 1} className={styles.qtyBtn}>−</button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button onClick={increaseQty} disabled={quantity >= stock} className={styles.qtyBtn}>+</button>
              </div>
            </div>

            <button onClick={handleBuyNow} className={styles.buyNowBtn} disabled={stock === 0}>
              <FontAwesomeIcon icon={faWhatsapp} /> Buy Now on WhatsApp
            </button>

            <div className={styles.description}>
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className={styles.features}>
              <h3>Key Features</h3>
              <ul>
                <li>✓ Handcrafted with natural wood</li>
                <li>✓ Colored with organic dyes</li>
                <li>✓ Safe for children (non‑toxic)</li>
                <li>✓ Eco‑friendly packaging</li>
                <li>✓ Traditional Etikoppaka craftsmanship</li>
                <li>✓ Unique one‑of‑a‑kind piece</li>
              </ul>
            </div>

            <div className={styles.shippingInfo}>
              <div className={styles.shippingItem}>
                <FontAwesomeIcon icon={faTruck} />
                <span>Free shipping on orders over ₹500</span>
              </div>
              <div className={styles.shippingItem}>
                <FontAwesomeIcon icon={faUndo} />
                <span>30‑day easy returns</span>
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
                  <img src={related.images?.[0] || '/placeholder.jpg'} alt={related.name} />
                  <h3>{related.name}</h3>
                  <p className={styles.relatedCategory}>{related.category}</p>
                  <p className={styles.relatedPrice}>₹{related.price?.toLocaleString() || 'Varies'}</p>
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