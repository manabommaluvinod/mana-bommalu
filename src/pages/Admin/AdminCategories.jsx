
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons'
import styles from './Admin.module.css'

const AdminCategories = () => {
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    is_active: true
  })

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)

    checkMobile()
    window.addEventListener('resize', checkMobile)

    fetchCategories()

    const subscription = supabase
      .channel('categories_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        () => fetchCategories()
      )
      .subscribe()

    return () => {
      window.removeEventListener('resize', checkMobile)
      subscription.unsubscribe()
    }
  }, [])

  const fetchCategories = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setCategories(data || [])
    }

    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      is_active: formData.is_active
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id)

      if (!error) {
        alert('Category updated successfully!')
        resetForm()
        fetchCategories()
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([categoryData])

      if (!error) {
        alert('Category added successfully!')
        resetForm()
        fetchCategories()
      }
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)

    setFormData({
      name: category.name,
      slug: category.slug,
      is_active: category.is_active
    })

    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (!error) {
        alert('Category deleted successfully!')
        fetchCategories()
      }
    }
  }

  const resetForm = () => {
    setEditingCategory(null)
    setShowForm(false)

    setFormData({
      name: '',
      slug: '',
      is_active: true
    })
  }

  // MOBILE VIEW
  if (isMobile) {
    return (
      <div className={styles.mobileAdminProducts}>
        <div className={styles.mobileHeader}>
          {showForm ? (
            <>
              <button
                onClick={resetForm}
                className={styles.mobileBackBtn}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>

              <h1>
                {editingCategory
                  ? 'Edit Category'
                  : 'Add Category'}
              </h1>
            </>
          ) : (
            <>
              <h1>Categories</h1>

              <button
                className={styles.mobileAddBtn}
                onClick={() => setShowForm(true)}
              >
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
                placeholder="Category Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value
                  })
                }
                required
              />

              <label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked
                    })
                  }
                />
                Active
              </label>

              <div className={styles.mobileFormActions}>
                <button
                  type="submit"
                  className={styles.saveBtn}
                >
                  <FontAwesomeIcon icon={faSave} />
                  {editingCategory ? ' Update' : ' Save'}
                </button>

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={resetForm}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.mobileProductsList}>
            {loading ? (
              <div className={styles.loading}>
                Loading...
              </div>
            ) : categories.length === 0 ? (
              <div className={styles.noData}>
                No categories found.
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className={styles.mobileProductItem}
                >
                  <div
                    className={styles.mobileProductDetails}
                  >
                    <h4>{category.name}</h4>
                    <p>{category.slug}</p>

                    <span
                      className={`${styles.mobileStatus}
                        ${
                          category.is_active
                            ? styles.inStock
                            : styles.outStock
                        }`}
                    >
                      {category.is_active
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>

                  <div
                    className={styles.mobileProductActions}
                  >
                    <button
                      onClick={() =>
                        handleEdit(category)
                      }
                    >
                      <FontAwesomeIcon
                        icon={faEdit}
                      />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(category.id)
                      }
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                      />
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

  // DESKTOP VIEW
  return (
    <div className={styles.desktopAdminProducts}>
      <div className={styles.desktopHeader}>
        <h1>Manage Categories</h1>

        {!showForm && (
          <button
            className={styles.addBtn}
            onClick={() => setShowForm(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Category
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.productForm}>
          <h2>
            {editingCategory
              ? 'Edit Category'
              : 'Add Category'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Name</label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Slug</label>

                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active:
                          e.target.checked
                      })
                    }
                  />
                  Active
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.saveBtn}
              >
                <FontAwesomeIcon icon={faSave} />
                {editingCategory
                  ? ' Update Category'
                  : ' Save Category'}
              </button>

              <button
                type="button"
                className={styles.cancelBtn}
                onClick={resetForm}
              >
                <FontAwesomeIcon icon={faTimes} />
                Cancel
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
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge}
                          ${
                            category.is_active
                              ? styles.inStock
                              : styles.outStock
                          }`}
                      >
                        {category.is_active
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </td>

                    <td>
                      <button
                        className={styles.editBtn}
                        onClick={() =>
                          handleEdit(category)
                        }
                      >
                        <FontAwesomeIcon
                          icon={faEdit}
                        />
                        Edit
                      </button>

                      <button
                        className={
                          styles.deleteBtn
                        }
                        onClick={() =>
                          handleDelete(
                            category.id
                          )
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                        />
                        Delete
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

export default AdminCategories

