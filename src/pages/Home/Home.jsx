import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faTruck,
  faShieldAlt,
  faUndo,
  faPhone,
  faEnvelope,
  faGem,
  faLeaf,
  faSearch,
  faHandSparkles,
  faHeart,
  faHandshake,
  faStar,
  faStarHalfAlt,
  faClock,
  faGift,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Home.module.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ---- Helpers ----
  const getDisplayPrice = (product) => {
    if (product.has_variants && product.variants?.length) {
      const prices = product.variants.map((v) => Number(v.price)).filter((p) => !isNaN(p) && p > 0);
      if (prices.length === 0) return "Varies";
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
    }
    return product.price ? `₹${product.price.toLocaleString()}` : "Price not set";
  };

  const getFirstImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return "https://placehold.co/400";
  };

  // ---- Effects ----
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    fetchData();
    startCountdown();

    const subscription = supabase
      .channel("products_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchData())
      .subscribe();

    return () => {
      window.removeEventListener("resize", checkMobile);
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: featured, error: featuredError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (!featuredError) setFeaturedProducts(featured || []);

      const { data: cats, error: catError } = await supabase
        .from("categories")
        .select("id, name, slug, is_active")
        .eq("is_active", true)
        .order("name");
      if (!catError) setCategories(cats || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const startCountdown = () => {
    const target = new Date();
    target.setDate(target.getDate() + 3);
    const update = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCategoryClick = (slug) => {
    navigate(`/products?category=${slug}`);
  };

  if (loading && featuredProducts.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // ============================================================
  // MOBILE VIEW
  // ============================================================
  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        {/* Search Bar */}
        <div className={styles.mobileSearchBar}>
          <FontAwesomeIcon icon={faSearch} className={styles.mobileSearchIcon} />
          <input
            type="text"
            placeholder="Search for toys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Static Hero */}
        <div className={styles.mobileHeroStatic}>
          <div className={styles.mobileHeroContent}>
            <img src="/banner.png" alt="Mana Bommalu" className={styles.mobileHeroImage} />
            <h2>Mana Bommalu</h2>
            <p>The Craft of Etikoppaka</p>
            <Link to="/products" className={styles.mobileHeroCta}>
              Explore Now <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.mobileStatsStrip}>
          <div className={styles.mobileStripItem}><FontAwesomeIcon icon={faLeaf} /> Natural</div>
          <div className={styles.mobileStripItem}><FontAwesomeIcon icon={faGem} /> Heritage</div>
          <div className={styles.mobileStripItem}><FontAwesomeIcon icon={faHandSparkles} /> Handcrafted</div>
          <div className={styles.mobileStripItem}><FontAwesomeIcon icon={faHeart} /> Loved</div>
        </div>

        {/* Categories */}
        <div className={styles.mobileCategories}>
          <h2>Shop by Category</h2>
          <div className={styles.mobileCategoryScroll}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={styles.mobileCategoryCard}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Exclusive Offers */}
        <div className={styles.mobileOfferSection}>
          <div className={styles.mobileOfferContent}>
            <span className={styles.mobileOfferBadge}><FontAwesomeIcon icon={faGift} /> Exclusive Offers</span>
            <h3>Limited Time</h3>
            <p>Up to 50% off on selected items</p>
            <div className={styles.mobileCountdown}>
              <div className={styles.mobileCountdownItem}><span>{timeLeft.days}</span>d</div>
              <div className={styles.mobileCountdownItem}><span>{timeLeft.hours}</span>h</div>
              <div className={styles.mobileCountdownItem}><span>{timeLeft.minutes}</span>m</div>
              <div className={styles.mobileCountdownItem}><span>{timeLeft.seconds}</span>s</div>
            </div>
            <Link to="/products" className={styles.mobileOfferCta}>Shop Now</Link>
          </div>
        </div>

        {/* Featured Products */}
        <div className={styles.mobileFeatured}>
          <h2>Featured Products</h2>
          <div className={styles.mobileProductScroll}>
            {featuredProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className={styles.mobileProductCard}>
                <img src={getFirstImage(product)} alt={product.name} />
                <div className={styles.mobileProductInfo}>
                  <h3>{product.name}</h3>
                  <p>{getDisplayPrice(product)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className={styles.mobileWhyUs}>
          <h2>Why Choose Us</h2>
          <div className={styles.mobileWhyGrid}>
            <div className={styles.mobileWhyItem}><FontAwesomeIcon icon={faTruck} /><span>Free Shipping</span></div>
            <div className={styles.mobileWhyItem}><FontAwesomeIcon icon={faShieldAlt} /><span>Secure Payment</span></div>
            <div className={styles.mobileWhyItem}><FontAwesomeIcon icon={faUndo} /><span>Easy Returns</span></div>
            <div className={styles.mobileWhyItem}><FontAwesomeIcon icon={faClock} /><span>24/7 Support</span></div>
          </div>
        </div>

        {/* About – text only, centred */}
        <div className={styles.mobileAbout}>
          <h2>About Etikoppaka Toys</h2>
          <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg}>
            <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <circle cx="100" cy="15" r="3" fill="#c89b3c" />
            <circle cx="150" cy="15" r="3" fill="#c89b3c" />
            <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">❁</text>
          </svg>
          <p>
            Etikoppaka is a small village in Andhra Pradesh, India, renowned for its traditional wooden toy craft.
            Artisans use natural dyes extracted from roots, seeds, and leaves to colour the soft wood, creating vibrant,
            eco‑friendly toys. Each piece is hand‑carved with intricate detail, reflecting centuries of heritage and
            skill. Our mission is to preserve this ancient art form and bring its beauty to homes around the world.
          </p>
        </div>

        {/* Worldwide Delivery */}
        <div className={styles.mobileDelivery}>
          <div className={styles.mobileDeliveryBadge}>🌍 Worldwide Delivery</div>
          <h3>We Deliver Our Heritage Worldwide</h3>
          <p>Experience the magic of Etikoppaka toys wherever you are.</p>
          <div className={styles.mobileDeliveryGrid}>
            <div className={styles.mobileDeliveryItem}><span>🚚</span> International Shipping</div>
            <div className={styles.mobileDeliveryItem}><span>📦</span> Secure Packaging</div>
            <div className={styles.mobileDeliveryItem}><span>💬</span> Contact Us</div>
            <div className={styles.mobileDeliveryItem}><span>🛡️</span> Track Order</div>
          </div>
          <a
            href="https://wa.me/919014255912?text=Hi%20I'm%20interested%20in%20your%20products"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileWhatsapp}
          >
            WhatsApp Us
          </a>
        </div>

        {/* Newsletter */}
        <div className={styles.mobileNewsletter}>
          <h3>Get 10% Off</h3>
          <p>Subscribe to get exclusive offers</p>
          <div className={styles.mobileNewsletterForm}>
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>

        {/* Contact */}
        <div className={styles.mobileContact}>
          <h2>Get in Touch</h2>
          <p><FontAwesomeIcon icon={faPhone} /> +91 9014255912</p>
          <p><FontAwesomeIcon icon={faEnvelope} /> vinod@manabommalu.in</p>
          <Link to="/contact" className={styles.mobileContactBtn}>Contact Us</Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // DESKTOP VIEW – Premium, Image Left + Text Right (No Slider)
  // ============================================================
  return (
    <div className={styles.desktopContainer}>
      {/* Hero – Static, image left, text right */}
      <section className={styles.heroSection}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroImage}>
            <img src="/banner.png" alt="Mana Bommalu" />
          </div>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}><FontAwesomeIcon icon={faGem} /> Since 1992</div>
            <h1>Mana Bommalu</h1>
            <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg}>
              <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
              <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
              <circle cx="100" cy="15" r="3" fill="#c89b3c" />
              <circle cx="150" cy="15" r="3" fill="#c89b3c" />
              <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">❁</text>
            </svg>
            <p>
              Discover the timeless beauty of traditional Etikoppaka wooden toys. Each piece is
              handcrafted by skilled artisans using natural dyes and sustainable wood – a heritage
              that has been cherished for generations.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}><FontAwesomeIcon icon={faLeaf} /> Natural</div>
              <div className={styles.heroStat}><FontAwesomeIcon icon={faGem} /> Heritage</div>
              <div className={styles.heroStat}><FontAwesomeIcon icon={faHandSparkles} /> Handcrafted</div>
              <div className={styles.heroStat}><FontAwesomeIcon icon={faHeart} /> Loved</div>
            </div>
            <div className={styles.heroButtons}>
              <Link to="/products" className={styles.btnPrimary}>
                Explore Collection <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/contact" className={styles.btnSecondary}>Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className={styles.featuresStrip}>
        <div className={styles.stripItem}><FontAwesomeIcon icon={faTruck} /><span>Free Shipping over ₹500</span></div>
        <div className={styles.stripItem}><FontAwesomeIcon icon={faShieldAlt} /><span>Secure Payment</span></div>
        <div className={styles.stripItem}><FontAwesomeIcon icon={faUndo} /><span>7‑Day Easy Returns</span></div>
        <div className={styles.stripItem}><FontAwesomeIcon icon={faClock} /><span>24/7 Support</span></div>
      </section>

      {/* Categories */}
      <section className={styles.categoriesSection}>
        <h2>Shop by Category</h2>
        <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg}>
          <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
          <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
          <circle cx="100" cy="15" r="3" fill="#c89b3c" />
          <circle cx="150" cy="15" r="3" fill="#c89b3c" />
          <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">❁</text>
        </svg>
        <p className={styles.sectionSubtitle}>Explore our diverse collection</p>
        <div className={styles.categoryScrollContainer}>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={styles.categoryCard}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive Offers (desktop) – no "Summer Sale" wording */}
      <section className={styles.offerSection}>
        <div className={styles.offerContent}>
          <div className={styles.offerLeft}>
            <span className={styles.offerBadge}><FontAwesomeIcon icon={faGift} /> Exclusive Offers</span>
            <h2>Limited Time</h2>
            <p>Up to 50% off on selected items</p>
            <div className={styles.countdown}>
              <div className={styles.countdownItem}><span>{timeLeft.days}</span><span>Days</span></div>
              <div className={styles.countdownItem}><span>{timeLeft.hours}</span><span>Hours</span></div>
              <div className={styles.countdownItem}><span>{timeLeft.minutes}</span><span>Mins</span></div>
              <div className={styles.countdownItem}><span>{timeLeft.seconds}</span><span>Secs</span></div>
            </div>
            <Link to="/products" className={styles.offerCta}>Shop Now</Link>
          </div>
          <div className={styles.offerRight}><img src="/brand.png" alt="Exclusive Offers" /></div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featuredSection}>
        <h2>Featured Products</h2>
        <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg}>
          <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
          <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
          <circle cx="100" cy="15" r="3" fill="#c89b3c" />
          <circle cx="150" cy="15" r="3" fill="#c89b3c" />
          <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">❁</text>
        </svg>
        <p className={styles.sectionSubtitle}>Handpicked just for you</p>
        <div className={styles.productGrid}>
          {featuredProducts.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <img src={getFirstImage(product)} alt={product.name} />
                <span className={styles.saleTag}>Offer!</span>
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.productCategory}>{product.category}</p>
                <p className={styles.productPrice}>{getDisplayPrice(product)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <h2>What Our Customers Say</h2>
        <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg}>
          <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
          <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
          <circle cx="100" cy="15" r="3" fill="#c89b3c" />
          <circle cx="150" cy="15" r="3" fill="#c89b3c" />
          <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">❁</text>
        </svg>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonialCard}>
            <p>"Absolutely beautiful toys! My kids love them."</p>
            <div className={styles.testimonialAuthor}>
              <img src="https://placehold.co/50" alt="Customer" />
              <div><strong>Priya Sharma</strong><div className={styles.testimonialStars}><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStarHalfAlt} /></div></div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <p>"Eco‑friendly and safe. Highly recommended!"</p>
            <div className={styles.testimonialAuthor}>
              <img src="https://placehold.co/50" alt="Customer" />
              <div><strong>Rahul Verma</strong><div className={styles.testimonialStars}><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /></div></div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <p>"The colours are vibrant and quality outstanding."</p>
            <div className={styles.testimonialAuthor}>
              <img src="https://placehold.co/50" alt="Customer" />
              <div><strong>Ananya Reddy</strong><div className={styles.testimonialStars}><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStarHalfAlt} /></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get updates on new arrivals and special offers</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>

      {/* About – image left, text right (side‑by‑side) with attractive styling */}
      <section className={styles.aboutSectionDesktop}>
        <div className={styles.aboutWrapperDesktop}>
          <div className={styles.aboutImageDesktop}>
            <img src="/aboutus.png" alt="About Etikoppaka Toys" />
          </div>
          <div className={styles.aboutTextDesktop}>
            <div className={styles.aboutBadge}><FontAwesomeIcon icon={faGem} /> Our Heritage</div>
            <h2>About Etikoppaka Toys</h2>
            <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg}>
              <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
              <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
              <circle cx="100" cy="15" r="3" fill="#c89b3c" />
              <circle cx="150" cy="15" r="3" fill="#c89b3c" />
              <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">❁</text>
            </svg>
            <p>
              Etikoppaka is a small village in Andhra Pradesh, India, renowned for its traditional wooden toy craft.
              Artisans use natural dyes extracted from roots, seeds, and leaves to colour the soft wood, creating vibrant,
              eco‑friendly toys. Each piece is hand‑carved with intricate detail, reflecting centuries of heritage and
              skill. Our mission is to preserve this ancient art form and bring its beauty to homes around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Worldwide Delivery (desktop) */}
      <section className={styles.shippingSection}>
        <div className={styles.container}>
          <div className={styles.badge}>🌍 Worldwide Delivery</div>
          <h2>We Deliver Our <span>Heritage</span> Worldwide</h2>
          <p>Experience the magic of Etikoppaka toys wherever you are.</p>
          <div className={styles.cards}>
            <div className={styles.card}><div className={styles.icon}>🚚</div><h3>International Shipping</h3><p>Doorstep delivery worldwide</p></div>
            <div className={styles.card}><div className={styles.icon}>📦</div><h3>Secure Packaging</h3><p>Eco‑friendly packaging</p></div>
            <div className={styles.card}><div className={styles.icon}>💬</div><h3>Contact Us</h3><p>Custom shipping quotes</p></div>
           <div className={styles.card}>
  <div className={styles.icon}>🔒</div>
  <h3>Secure Shopping</h3>
  <p>Safe & secure payments</p>
</div>
          </div>
          <a href="https://wa.me/919014255912" target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>WhatsApp Us</a>
        </div>
      </section>
    </div>
  );
};

export default Home;