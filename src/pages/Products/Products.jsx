import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter, faTimes, faSort } from '@fortawesome/free-solid-svg-icons'
import styles from './Products.module.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // ---- Fetch categories ----
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name')
    if (!error) setCategories(data || [])
  }

  // ---- Get display price (range for variants) ----
  const getDisplayPrice = (product) => {
    if (product.has_variants && product.variants?.length) {
      const prices = product.variants.map(v => Number(v.price)).filter(p => !isNaN(p) && p > 0)
      if (prices.length === 0) return 'Price varies'
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`
    }
    return `₹${product.price?.toLocaleString() || '0'}`
  }

  // ---- Effects ----
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Read URL params
    setSearchTerm(searchParams.get("search") || "")
    const categoryParam = searchParams.get("category")
    setSelectedCategory(categoryParam || "all")

    fetchProducts()
    fetchCategories()

    // Real‑time subscription
    const subscription = supabase
      .channel('products_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe()

    return () => {
      window.removeEventListener('resize', checkMobile)
      subscription.unsubscribe()
    }
  }, [searchParams])

  // ---- Filter and sort ----
  useEffect(() => {
    filterProducts()
  }, [products, selectedCategory, sortBy, searchTerm])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Price filter (if any)
    const maxPrice = searchParams.get("maxPrice")
    if (maxPrice) {
      filtered = filtered.filter(p => {
        if (p.has_variants && p.variants?.length) {
          const minPrice = Math.min(...p.variants.map(v => Number(v.price)))
          return minPrice <= Number(maxPrice)
        }
        return Number(p.price) <= Number(maxPrice)
      })
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        p.category.toLowerCase().includes(term)
      )
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.has_variants ? Math.min(...a.variants.map(v => Number(v.price))) : a.price
          const priceB = b.has_variants ? Math.min(...b.variants.map(v => Number(v.price))) : b.price
          return priceA - priceB
        })
        break
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.has_variants ? Math.max(...a.variants.map(v => Number(v.price))) : a.price
          const priceB = b.has_variants ? Math.max(...b.variants.map(v => Number(v.price))) : b.price
          return priceB - priceA
        })
        break
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        break
    }
    setFilteredProducts(filtered)
  }

  // ---- Search handlers ----
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setSearchParams({ search: searchTerm.trim() })
    } else {
      setSearchParams({})
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchParams({})
  }

  // ============================================
  // MOBILE VIEW
  // ============================================
  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.mobileHeader}>
          <h1>Products</h1>
          <p>{filteredProducts.length} items</p>
        </div>

        <form onSubmit={handleSearchSubmit} className={styles.mobileSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit"><FontAwesomeIcon icon={faSearch} /></button>
        </form>

        {searchTerm && (
          <div className={styles.mobileSearchInfo}>
            <span>Searching for: <strong>"{searchTerm}"</strong></span>
            <button onClick={clearSearch}>Clear</button>
          </div>
        )}

        <div className={styles.mobileFilterBar}>
          <button onClick={() => setShowFilters(!showFilters)}>
            <FontAwesomeIcon icon={faFilter} /> Filter
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sort by</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {showFilters && (
          <div className={styles.mobileFilterPanel}>
            <div className={styles.filterHeader}>
              <h3>Categories</h3>
              <button onClick={() => setShowFilters(false)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <button
              className={`${styles.mobileCategoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
              onClick={() => { setSelectedCategory('all'); setShowFilters(false); }}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.mobileCategoryBtn} ${selectedCategory === cat.slug ? styles.active : ''}`}
                onClick={() => { setSelectedCategory(cat.slug); setShowFilters(false); }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className={styles.mobileLoading}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.mobileEmpty}>
            <p>No products found</p>
            <button onClick={clearSearch}>Clear Search</button>
          </div>
        ) : (
          <div className={styles.mobileProductGrid}>
            {filteredProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className={styles.mobileProductCard}>
                <img src={product.images?.[0] || 'https://placehold.co/400'} alt={product.name} />
                <div className={styles.mobileProductInfo}>
                  <h3>{product.name}</h3>
                  <p className={styles.mobileCategory}>{product.category}</p>
                  <p className={styles.mobilePrice}>{getDisplayPrice(product)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ============================================
  // DESKTOP VIEW
  // ============================================
  return (
    <div className={styles.desktopContainer}>
      <div className={styles.banner}>
        <h1>Our Collection</h1>
        <p>Discover traditional Etikoppaka wooden toys</p>
        {searchTerm && (
          <div className={styles.searchInfo}>
            Showing results for: <strong>"{searchTerm}"</strong>
            <button onClick={clearSearch}>Clear Search</button>
          </div>
        )}
      </div>

      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3>Categories</h3>
            <button
              className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.categoryBtn} ${selectedCategory === cat.slug ? styles.active : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.slug)
                  setSearchParams({ category: cat.slug })
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        <div className={styles.content}>
          <div className={styles.toolbar}>
            <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit"><FontAwesomeIcon icon={faSearch} /></button>
            </form>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          <div className={styles.resultsCount}>Showing {filteredProducts.length} products</div>

          {loading ? (
            <div className={styles.loading}>Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <p>No products found</p>
              <button onClick={clearSearch}>Clear Search</button>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {filteredProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className={styles.productCard}>
                  <div className={styles.imageWrapper}>
                    <img src={product.images?.[0] || 'https://placehold.co/400'} alt={product.name} />
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{product.name}</h3>
                    <p className={styles.category}>{product.category}</p>
                    <p className={styles.price}>{getDisplayPrice(product)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products