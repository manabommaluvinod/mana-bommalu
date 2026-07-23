import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faSave, faTimes, faUpload, faImage, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import styles from './Admin.module.css'

const AdminProducts = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    quantity: '',
    images: []
  })
  const [categories, setCategories] = useState([])
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (!error) {
      setCategories(data || [])
    }
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    fetchProducts()
    fetchCategories()

    // Real-time subscription
    const subscription = supabase
      .channel('products_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe()

    // Check URL params for edit/new
    if (id === 'new') {
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
    } else if (id && id !== 'new' && id !== 'edit') {
      // Handle edit - id is the product UUID
      fetchProductForEdit(id)
      setShowForm(true)
    }

    return () => {
      window.removeEventListener('resize', checkMobile)
      subscription.unsubscribe()
    }
  }, [id])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    setProducts(data || [])
    setLoading(false)
  }

  const fetchProductForEdit = async (productId) => {
    console.log('Fetching product for edit:', productId)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      alert('Error loading product for editing')
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
      setShowForm(true)
    }
  }

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
      console.error('Error uploading image:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    const uploadedUrls = []

    for (const file of files) {
      const url = await uploadImage(file)
      if (url) {
        uploadedUrls.push(url)
      }
    }

    setFormData({
      ...formData,
      images: [...formData.images, ...uploadedUrls]
    })
  }

  const removeImage = (indexToRemove) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, index) => index !== indexToRemove)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      description: formData.description,
      quantity: parseInt(formData.quantity),
      images: formData.images
    }

    if (editingProduct) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)

      if (!error) {
        alert('Product updated successfully!')
        resetForm()
        navigate('/admin/products')
        fetchProducts()
      } else {
        console.error('Update error:', error)
        alert('Error updating product: ' + error.message)
      }
    } else {
      // Add new product
      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (!error) {
        alert('Product added successfully!')
        resetForm()
        navigate('/admin/products')
        fetchProducts()
      } else {
        console.error('Insert error:', error)
        alert('Error adding product: ' + error.message)
      }
    }
  }

  const handleEditClick = (product) => {
    console.log('Edit clicked for product:', product)
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      quantity: product.quantity,
      images: product.images || []
    })
    setShowForm(true)
    // Navigate to edit URL
    navigate(`/admin/products/${product.id}`)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (!error) {
        alert('Product deleted successfully!')
        fetchProducts()
      } else {
        alert('Error deleting product: ' + error.message)
      }
    }
  }

  const resetForm = () => {
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
    navigate('/admin/products')
  }

  // Mobile View
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
          <div className={styles.mobileForm}>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Product Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {/* <input 
                type="text" 
                placeholder="Category *" 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                required 
              /> */}
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price *"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Quantity *"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
              <textarea
                placeholder="Description *"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <div className={styles.mobileImageUpload}>
                <label>
                  <FontAwesomeIcon icon={faUpload} /> Upload Images
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                </label>
                {uploading && <p className={styles.uploadingText}>Uploading...</p>}
                <div className={styles.mobileImagePreview}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} className={styles.mobilePreviewItem}>
                      <img src={img} alt="" />
                      <button type="button" onClick={() => removeImage(idx)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.mobileFormActions}>
                <button type="submit" className={styles.saveBtn} disabled={uploading}>
                  <FontAwesomeIcon icon={faSave} /> {editingProduct ? 'Update' : 'Save'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.mobileProductsList}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : products.length === 0 ? (
              <div className={styles.noData}>No products yet. Click + to add.</div>
            ) : (
              products.map(product => (
                <div key={product.id} className={styles.mobileProductItem}>
                  <img src={product.images[0] || 'https://placehold.co/60'} alt={product.name} />
                  <div className={styles.mobileProductDetails}>
                    <h4>{product.name}</h4>
                    <p>₹{product.price.toLocaleString()} | Stock: {product.quantity}</p>
                    <span className={`${styles.mobileStatus} ${product.quantity > 0 ? styles.inStock : styles.outStock}`}>
                      {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className={styles.mobileProductActions}>
                    <button onClick={() => handleEditClick(product)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(product.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  // Desktop View
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

      {showForm && (
        <div className={styles.productForm}>
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
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
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category</option>

                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
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
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  required
                />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Product Images</label>
                <div className={styles.imageUploadArea}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <p className={styles.uploadingText}>Uploading...</p>}
                  <div className={styles.imagePreviewGrid}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} className={styles.imagePreview}>
                        <img src={img} alt="" />
                        <button type="button" onClick={() => removeImage(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
      )}

      {!showForm && (
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
                <tr><td colSpan="7" className={styles.loading}>Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className={styles.noData}>No products yet. Click "Add New Product" to get started.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.images[0] || 'https://placehold.co/50'}
                        alt={product.name}
                        className={styles.productThumb}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price.toLocaleString()}</td>
                    <td>{product.quantity}</td>
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