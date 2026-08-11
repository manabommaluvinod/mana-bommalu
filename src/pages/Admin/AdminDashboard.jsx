// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faTags,
  faExclamationTriangle,
  faTimesCircle,
  faEnvelope,
  faPlus,
  faEdit,
  faSync,
  faEye,
  faTrash,
  faCheck,
  faChartLine,
  faStore,
  faTruck,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import styles from './Admin.module.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStock: 0,
    outOfStock: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessages, setShowMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ----- Helper: check if product is a variant -----
  const isVariantProduct = (product) => {
    return product.has_variants === true || (product.variants && product.variants.length > 0);
  };

  // ----- Helper: display price (or 'Varies') -----
  const displayPrice = (product) => {
    if (isVariantProduct(product)) {
      const prices = product.variants.map(v => Number(v.price)).filter(p => !isNaN(p) && p > 0);
      if (prices.length === 0) return 'Varies';
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
    }
    return product.price ? `₹${product.price.toLocaleString()}` : 'N/A';
  };

  // ----- Helper: display quantity (or 'Varies') -----
  const displayQuantity = (product) => {
    if (isVariantProduct(product)) return 'Varies';
    return product.quantity ?? 0;
  };

  // ----- Helper: get first image or fallback -----
  const getFirstImage = (product) => {
    if (product.images && product.images.length) {
      return product.images[0];
    }
    return 'https://placehold.co/50';
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetchDashboardData();

    const productsSubscription = supabase
      .channel('products_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchDashboardData())
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchDashboardData())
      .subscribe();

    return () => {
      window.removeEventListener('resize', checkMobile);
      productsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: messages } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (products) {
      const categories = [...new Set(products.map((p) => p.category))];

      // Only count stock for non‑variant products
      const nonVariant = products.filter(p => !isVariantProduct(p));
      const lowStock = nonVariant.filter((p) => p.quantity > 0 && p.quantity < 10).length;
      const outOfStock = nonVariant.filter((p) => p.quantity === 0).length;

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        lowStock,
        outOfStock,
        totalMessages: messages?.length || 0,
        unreadMessages: messages?.filter((m) => !m.is_read).length || 0,
      });

      setRecentProducts(products.slice(0, 5));
      setRecentMessages(messages?.slice(0, 5) || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id);
    if (!error) fetchDashboardData();
  };

  const deleteMessage = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (!error) {
        alert('Message deleted successfully!');
        fetchDashboardData();
      }
    }
  };

  // ──────────────────────────────────────────────
  //  MOBILE VIEW
  // ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className={styles.mobileAdminDashboard}>
        {/* Header */}
        <div className={styles.mobileHeader}>
          <h1>Dashboard</h1>
          <p>Welcome back! 👋</p>
        </div>

        {/* Stats – 2‑column grid */}
        <div className={styles.mobileStatsGrid}>
          <div className={styles.mobileStatCard}>
            <FontAwesomeIcon icon={faBox} />
            <div>
              <span className={styles.mobileStatNumber}>{stats.totalProducts}</span>
              <span className={styles.mobileStatLabel}>Products</span>
            </div>
          </div>
          <div className={styles.mobileStatCard}>
            <FontAwesomeIcon icon={faTags} />
            <div>
              <span className={styles.mobileStatNumber}>{stats.totalCategories}</span>
              <span className={styles.mobileStatLabel}>Categories</span>
            </div>
          </div>
          <div className={styles.mobileStatCard}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <div>
              <span className={styles.mobileStatNumber}>{stats.lowStock}</span>
              <span className={styles.mobileStatLabel}>Low Stock</span>
            </div>
          </div>
          <div className={styles.mobileStatCard}>
            <FontAwesomeIcon icon={faTimesCircle} />
            <div>
              <span className={styles.mobileStatNumber}>{stats.outOfStock}</span>
              <span className={styles.mobileStatLabel}>Out of Stock</span>
            </div>
          </div>
          <div className={styles.mobileStatCard} style={{ gridColumn: 'span 2' }}>
            <FontAwesomeIcon icon={faEnvelope} />
            <div>
              <span className={styles.mobileStatNumber}>{stats.totalMessages}</span>
              <span className={styles.mobileStatLabel}>Messages</span>
              {stats.unreadMessages > 0 && (
                <span className={styles.mobileUnreadBadge}>{stats.unreadMessages} unread</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.mobileActions}>
          <Link to="/admin/products/new" className={styles.mobileActionBtn}>
            <FontAwesomeIcon icon={faPlus} /> Add
          </Link>
          <Link to="/admin/products" className={styles.mobileActionBtn}>
            <FontAwesomeIcon icon={faEdit} /> Manage
          </Link>
          <Link to="/admin/categories" className={styles.mobileActionBtn}>
            <FontAwesomeIcon icon={faTags} /> Categories
          </Link>
          <button
            onClick={() => setShowMessages(!showMessages)}
            className={`${styles.mobileActionBtn} ${showMessages ? styles.active : ''}`}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            {stats.unreadMessages > 0 && !showMessages && (
              <span className={styles.notificationDot}>{stats.unreadMessages}</span>
            )}
          </button>
        </div>

        {/* Messages */}
        {showMessages && (
          <div className={styles.mobileMessages}>
            <h3>Contact Messages</h3>
            {recentMessages.length === 0 ? (
              <p className={styles.emptyState}>No messages yet.</p>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className={`${styles.mobileMessageCard} ${!msg.is_read ? styles.unread : ''}`}>
                  <div className={styles.mobileMessageHeader}>
                    <strong>{msg.name}</strong>
                    <span>{msg.email}</span>
                  </div>
                  <p className={styles.mobileMessageContent}>{msg.message}</p>
                  <div className={styles.mobileMessageActions}>
                    {!msg.is_read && (
                      <button onClick={() => markAsRead(msg.id)}>
                        <FontAwesomeIcon icon={faCheck} /> Read
                      </button>
                    )}
                    <button onClick={() => deleteMessage(msg.id)}>
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Recent Products */}
        <div className={styles.mobileProducts}>
          <h3>Recent Products</h3>
          {recentProducts.length === 0 ? (
            <p className={styles.emptyState}>No products yet.</p>
          ) : (
            recentProducts.map((product) => (
              <div key={product.id} className={styles.mobileProductCard}>
                <img src={getFirstImage(product)} alt={product.name} />
                <div>
                  <h4>{product.name}</h4>
                  <p>{displayPrice(product)} | Stock: {displayQuantity(product)}</p>
                  {isVariantProduct(product) && (
                    <span className={styles.mobileVariantBadge}>Variant</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  //  DESKTOP VIEW
  // ──────────────────────────────────────────────
  return (
    <div className={styles.desktopAdminDashboard}>
      {/* Header */}
      <div className={styles.desktopHeader}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening with your store today.</p>
        </div>
        <button onClick={fetchDashboardData} className={styles.refreshBtn}>
          <FontAwesomeIcon icon={faSync} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.desktopStatsGrid}>
        <div className={styles.desktopStatCard}>
          <div className={styles.statIcon}><FontAwesomeIcon icon={faBox} /></div>
          <div className={styles.statInfo}>
            <h3>Total Products</h3>
            <p className={styles.statNumber}>{stats.totalProducts}</p>
          </div>
        </div>
        <div className={styles.desktopStatCard}>
          <div className={styles.statIcon}><FontAwesomeIcon icon={faTags} /></div>
          <div className={styles.statInfo}>
            <h3>Categories</h3>
            <p className={styles.statNumber}>{stats.totalCategories}</p>
          </div>
        </div>
        <div className={styles.desktopStatCard}>
          <div className={styles.statIcon}><FontAwesomeIcon icon={faExclamationTriangle} /></div>
          <div className={styles.statInfo}>
            <h3>Low Stock</h3>
            <p className={styles.statNumber}>{stats.lowStock}</p>
          </div>
        </div>
        <div className={styles.desktopStatCard}>
          <div className={styles.statIcon}><FontAwesomeIcon icon={faTimesCircle} /></div>
          <div className={styles.statInfo}>
            <h3>Out of Stock</h3>
            <p className={styles.statNumber}>{stats.outOfStock}</p>
          </div>
        </div>
        <div className={styles.desktopStatCard}>
          <div className={styles.statIcon}><FontAwesomeIcon icon={faEnvelope} /></div>
          <div className={styles.statInfo}>
            <h3>Messages</h3>
            <p className={styles.statNumber}>{stats.totalMessages}</p>
            {stats.unreadMessages > 0 && (
              <span className={styles.unreadBadge}>{stats.unreadMessages} unread</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.desktopQuickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionButtons}>
          <Link to="/admin/products/new" className={styles.actionBtn}>
            <FontAwesomeIcon icon={faPlus} /> Add New Product
          </Link>
          <Link to="/admin/categories" className={styles.actionBtn}>
            <FontAwesomeIcon icon={faTags} /> Add Category
          </Link>
          <Link to="/admin/products" className={styles.actionBtn}>
            <FontAwesomeIcon icon={faEdit} /> Manage Products
          </Link>
          <button
            className={`${styles.actionBtn} ${showMessages ? styles.active : ''}`}
            onClick={() => setShowMessages(!showMessages)}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            {showMessages ? 'Hide Messages' : 'View Messages'}
            {stats.unreadMessages > 0 && !showMessages && (
              <span className={styles.notificationBadge}>{stats.unreadMessages}</span>
            )}
          </button>
        </div>
      </div>

      {/* Messages Section */}
      {showMessages && (
        <div className={styles.desktopMessagesSection}>
          <h2>Contact Messages</h2>
          {recentMessages.length === 0 ? (
            <p className={styles.emptyState}>No messages yet.</p>
          ) : (
            recentMessages.map((message) => (
              <div key={message.id} className={`${styles.messageCard} ${!message.is_read ? styles.unread : ''}`}>
                <div className={styles.messageHeader}>
                  <div>
                    <strong>{message.name}</strong>
                    <span className={styles.messageEmail}>{message.email}</span>
                  </div>
                  <div className={styles.messageActions}>
                    {!message.is_read && (
                      <button onClick={() => markAsRead(message.id)} className={styles.readBtn}>
                        <FontAwesomeIcon icon={faCheck} /> Mark as Read
                      </button>
                    )}
                    <button onClick={() => deleteMessage(message.id)} className={styles.deleteBtn}>
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                </div>
                <div className={styles.messageSubject}>
                  <strong>Subject:</strong> {message.subject || 'No subject'}
                </div>
                <div className={styles.messageContent}>{message.message}</div>
                <div className={styles.messageDate}>
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recent Products Table */}
      <div className={styles.desktopRecentProducts}>
        <h2>Recently Added Products</h2>
        {recentProducts.length === 0 ? (
          <p className={styles.emptyState}>No products yet.</p>
        ) : (
          <div className={styles.productsTableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={getFirstImage(product)}
                        alt={product.name}
                        className={styles.productThumb}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{displayPrice(product)}</td>
                    <td>{displayQuantity(product)}</td>
                    <td>
                      {isVariantProduct(product) ? (
                        <span className={`${styles.statusBadge} ${styles.variantBadge}`}>
                          Variant
                        </span>
                      ) : (
                        <span
                          className={`${styles.statusBadge} ${
                            product.quantity > 0 ? styles.inStock : styles.outStock
                          }`}
                        >
                          {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;