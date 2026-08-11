import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'  // ← added useLocation
import { supabase } from '../../lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faSave, faTimes, faUpload, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import styles from './Admin.module.css'

const AdminProducts = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()  // ← get location
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [categories, setCategories] = useState([])
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    quantity: '',
    images: []
  })

  // ---- Detect if we're on the "new" route ----
  const isNewRoute = location.pathname.endsWith('/new')

  console.log('AdminProducts rendering, id =', id, 'isNewRoute =', isNewRoute)

  const resetForm = () => {
    console.log('resetForm called')
    setShowForm(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      quantity: '',
      images: []
    })
    setHasVariants(false)
    setVariants([])
    navigate('/admin/products')
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (!error) setCategories(data || [])
  }

  useEffect(() => {
    console.log('useEffect triggered, id =', id, 'isNewRoute =', isNewRoute)
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    fetchProducts()
    fetchCategories()

    const subscription = supabase
      .channel('products_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe()

    // Determine mode based on route
    if (isNewRoute) {
      console.log('Mode: ADD NEW PRODUCT')
      setShowForm(true)
      setEditingProduct(null)
      setFormData({
        name: '',
        category: '',
        price: '',
        description: '',
        quantity: '',
        images: []
      })
      setHasVariants(false)
      setVariants([])
    } else if (id) {
      console.log('Mode: EDIT PRODUCT, id =', id)
      fetchProductForEdit(id)
      setShowForm(true)
    } else {
      console.log('Mode: LIST VIEW')
      setShowForm(false)
    }

    return () => {
      window.removeEventListener('resize', checkMobile)
      subscription.unsubscribe()
    }
  }, [id, location.pathname])  // ← added location.pathname as dependency

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const fetchProductForEdit = async (productId) => {
    console.log('fetchProductForEdit called with id', productId)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      alert('Error loading product')
      navigate('/admin/products')
      return
    }

    if (data) {
      console.log('Product loaded:', data)
      setEditingProduct(data)
      setFormData({
        name: data.name || '',
        category: data.category || '',
        price: data.price || '',
        description: data.description || '',
        quantity: data.quantity || '',
        images: data.images || []
      })
      setHasVariants(data.has_variants || false)
      setVariants(data.variants || [])
      setShowForm(true)
    }
  }

  // ---- Image upload helpers ----
  const uploadImage = async (file) => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error(error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    const urls = await Promise.all(files.map(f => uploadImage(f)))
    const valid = urls.filter(Boolean)
    setFormData({ ...formData, images: [...formData.images, ...valid] })
  }

  const removeImage = (idx) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })
  }

  // ---- Variant management ----
  const addVariant = () => {
    setVariants([...variants, { size: 'Small', price: '', stock: '', images: [] }])
  }

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index, field, value) => {
    const updated = [...variants]
    updated[index][field] = value
    setVariants(updated)
  }

  const uploadVariantImage = async (vIndex, files) => {
    const urls = await Promise.all(Array.from(files).map(f => uploadImage(f)))
    const valid = urls.filter(Boolean)
    const updated = [...variants]
    updated[vIndex].images = [...updated[vIndex].images, ...valid]
    setVariants(updated)
  }

  const removeVariantImage = (vIndex, imgIndex) => {
    const updated = [...variants]
    updated[vIndex].images = updated[vIndex].images.filter((_, i) => i !== imgIndex)
    setVariants(updated)
  }

  // ---- Submit ----
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Submitting form...')

    let productData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      has_variants: hasVariants
    }

    if (hasVariants) {
      productData.variants = variants
      productData.price = null
      productData.quantity = null
      productData.images = []
    } else {
      productData.price = parseFloat(formData.price)
      productData.quantity = parseInt(formData.quantity)
      productData.images = formData.images
      productData.variants = null
    }

    let error
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData])
      error = insertError
    }

    if (!error) {
      alert(editingProduct ? 'Product updated!' : 'Product added!')
      resetForm()
      navigate('/admin/products')
      fetchProducts()
    } else {
      alert('Error: ' + error.message)
    }
  }

  // ---- Helper for edit/delete ----
  const handleEditClick = (product) => {
    navigate(`/admin/products/${product.id}`)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (!error) {
        alert('Deleted!')
        fetchProducts()
      }
    }
  }

  // ---- Render form (shared for mobile & desktop) ----
  const renderForm = () => {
    console.log('Rendering form, showForm =', showForm)
    return (
      <div className={isMobile ? styles.mobileForm : styles.productForm}>
        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={isMobile ? styles.mobileFormGroup : styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                required
              />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label>
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                />
                This product has multiple sizes/variants
              </label>
            </div>

            {hasVariants ? (
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <h3>Variants</h3>
                {variants.map((variant, idx) => (
                  <div key={idx} className={styles.variantRow}>
                    <select
                      value={variant.size}
                      onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                    />
                    <div>
                      <label>Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => uploadVariantImage(idx, e.target.files)}
                      />
                      <div className={styles.variantImages}>
                        {variant.images.map((img, imgIdx) => (
                          <span key={imgIdx}>
                            <img src={img} width="50" alt="" />
                            <button type="button" onClick={() => removeVariantImage(idx, imgIdx)}>✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeVariant(idx)}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addVariant}>Add Variant</button>
              </div>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Product Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <p>Uploading...</p>}
                  <div className={styles.imagePreviewGrid}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} className={styles.imagePreview}>
                        <img src={img} alt="" />
                        <button type="button" onClick={() => removeImage(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={uploading}>
              <FontAwesomeIcon icon={faSave} /> {editingProduct ? 'Update Product' : 'Save Product'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={resetForm}>
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ---- Mobile View ----
  if (isMobile) {
    return (
      <div className={styles.mobileAdminProducts}>
        <div className={styles.mobileHeader}>
          {showForm ? (
            <>
              <button onClick={resetForm} className={styles.mobileBackBtn}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>
              <h1>{editingProduct ? 'Edit Product' : 'Add Product'}</h1>
            </>
          ) : (
            <>
              <h1>Products</h1>
              <button onClick={() => navigate('/admin/products/new')} className={styles.mobileAddBtn}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </>
          )}
        </div>

        {showForm ? (
          renderForm()
        ) : (
          <div className={styles.mobileProductsList}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : products.length === 0 ? (
              <div className={styles.noData}>No products yet. Click + to add.</div>
            ) : (
              products.map(product => (
                <div key={product.id} className={styles.mobileProductItem}>
                  <img src={product.images?.[0] || 'https://placehold.co/60'} alt={product.name} />
                  <div className={styles.mobileProductDetails}>
                    <h4>{product.name}</h4>
                    <p>{product.has_variants ? 'Varies' : `₹${product.price?.toLocaleString()}`}</p>
                    <span className={`${styles.mobileStatus} ${product.quantity > 0 ? styles.inStock : styles.outStock}`}>
                      {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className={styles.mobileProductActions}>
                    <button onClick={() => handleEditClick(product)}><FontAwesomeIcon icon={faEdit} /></button>
                    <button onClick={() => handleDelete(product.id)}><FontAwesomeIcon icon={faTrash} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  // ---- Desktop View ----
  return (
    <div className={styles.desktopAdminProducts}>
      <div className={styles.desktopHeader}>
        <h1>Manage Products</h1>
        {!showForm && (
          <button className={styles.addBtn} onClick={() => navigate('/admin/products/new')}>
            <FontAwesomeIcon icon={faPlus} /> Add New Product
          </button>
        )}
      </div>

      {showForm ? (
        renderForm()
      ) : (
        <div className={styles.productsTable}>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7">No products yet. Click "Add New Product".</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td><img src={product.images?.[0] || 'https://placehold.co/50'} alt={product.name} className={styles.productThumb} /></td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.has_variants ? 'Varies' : `₹${product.price?.toLocaleString()}`}</td>
                    <td>{product.has_variants ? '-' : product.quantity}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${product.quantity > 0 ? styles.inStock : styles.outStock}`}>
                        {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleEditClick(product)} className={styles.editBtn}>
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} className={styles.deleteBtn}>
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProducts