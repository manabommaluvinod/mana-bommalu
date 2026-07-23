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
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Home.module.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    fetchData();

    const subscription = supabase
      .channel("products_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      window.removeEventListener("resize", checkMobile);
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Featured products
      const { data: featured, error: featuredError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      if (!featuredError) {
        setFeaturedProducts(featured || []);
      }

      // Categories from TABLE (IMPORTANT)
      const { data: cats, error: catError } = await supabase
        .from("categories")
        .select("id, name, slug, is_active")
        .eq("is_active", true)
        .order("name");

      if (!catError) {
        setCategories(cats || []);
      } else {
        console.error("Category error:", catError);
        setCategories([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const searchQuery = searchTerm.trim();
      setSearchTerm("");
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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

  // Mobile View with Search Bar
  if (isMobile) {
    return (
      <div className={styles.mobileContainer}>
        <div className={styles.mobileHero}>
          {/* Animated Background */}
          <div className={styles.heroBgAnimation}>
            <div className={styles.circle1}></div>
            <div className={styles.circle2}></div>
            <div className={styles.circle3}></div>
          </div>

          <div className={styles.mobileHeroContent}>
            {/* Search */}
            <div className={styles.mobileSearchContainer}>
              <div className={styles.mobileSearchBar}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={styles.mobileSearchIcon}
                />
                <input
                  type="text"
                  placeholder="Search for toys..."
                  className={styles.mobileSearchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Badge */}
            <div className={styles.heroBadge}>
              <FontAwesomeIcon icon={faGem} />
              Since 1992
            </div>

            {/* Logo */}
            <img
              src="/banner.png"
              alt="Mana Bommalu"
              className={styles.mobileLogo}
            />

            {/* Heading */}
            <h1>Traditional Handcrafted</h1>

            {/* Divider */}
            <svg
              width="250"
              height="30"
              viewBox="0 0 250 30"
              className={styles.dividerSvg}
            >
              <line
                x1="0"
                y1="15"
                x2="95"
                y2="15"
                stroke="#c89b3c"
                strokeWidth="2"
              />

              <line
                x1="155"
                y1="15"
                x2="250"
                y2="15"
                stroke="#c89b3c"
                strokeWidth="2"
              />

              <circle cx="100" cy="15" r="3" fill="#c89b3c" />
              <circle cx="150" cy="15" r="3" fill="#c89b3c" />

              <text
                x="125"
                y="20"
                textAnchor="middle"
                fill="#c89b3c"
                fontSize="20"
              >
                ❁
              </text>
            </svg>

            {/* Description */}
            <p className={styles.mobileHeroDescription}>
              Handcrafted by skilled artisans using natural dyes and sustainable
              wood. Each piece brings the rich heritage of Andhra Pradesh into
              your home. Eco-friendly, non-toxic, and crafted to last for
              generations.
            </p>

            {/* Stats */}
            <div className={styles.mobileHeroStats}>
              <div className={styles.mobileStat}>
                <FontAwesomeIcon icon={faLeaf} />
                <span className={styles.mobileStatNumber}>Nature's Colors</span>
              </div>

              <div className={styles.mobileStat}>
                <FontAwesomeIcon icon={faGem} />
                <span className={styles.mobileStatNumber}>Culture's Pride</span>
              </div>

              <div className={styles.mobileStat}>
                <FontAwesomeIcon icon={faHandSparkles} />
                <span className={styles.mobileStatNumber}>Pure Craft</span>
              </div>

              <div className={styles.mobileStat}>
                <FontAwesomeIcon icon={faHeart} />
                <span className={styles.mobileStatNumber}>Pure Joy</span>
              </div>

              <div className={styles.mobileStat}>
                <FontAwesomeIcon icon={faHandshake} />
                <span className={styles.mobileStatNumber}>Trusted Craft</span>
              </div>
            </div>

            {/* Buttons */}
            <div className={styles.heroButtons}>
              <Link to="/products" className={styles.btnPrimary}>
                Explore Collection
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className={styles.btnIcon}
                />
              </Link>

              <Link to="/contact" className={styles.btnPrimary}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.features}>
          <div className="container">
            <div className={styles.featureGrid}>
              {/* <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faTruck} />
              </div>
              <h3>Free Shipping</h3>
              <p>On orders over ₹500</p>
            </div> */}
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faShieldAlt} />
                </div>
                <h3>Secure Payment</h3>
                <p>100% secure transactions</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faUndo} />
                </div>
                <h3>Easy Returns</h3>
                <p>7-day return policy</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mobileCategories}>
          <h2>Shop by Category</h2>
          {/* Divider */}
          <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg} >
            <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <circle cx="100" cy="15" r="3" fill="#c89b3c" />
            <circle cx="150" cy="15" r="3" fill="#c89b3c" />
            <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">
              ❁
            </text>
          </svg>

          <p className={styles.mobileSectionSubtitle}>
            Explore our diverse collection
          </p>
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

        <div className={styles.mobileFeatured}>
          <h2>Featured Products</h2>
          {/* Divider */}
          <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg} >
            <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <circle cx="100" cy="15" r="3" fill="#c89b3c" />
            <circle cx="150" cy="15" r="3" fill="#c89b3c" />
            <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">
              ❁
            </text>
          </svg>
          <p className={styles.sectionSubtitle}>Handpicked just for you</p>
          <div className={styles.mobileProductGrid}>
            {featuredProducts.map((product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className={styles.mobileProductCard}
              >
                <img
                  src={product.images[0] || "https://placehold.co/400"}
                  alt={product.name}
                />
                <div className={styles.mobileProductInfo}>
                  <h3>{product.name}</h3>
                  <p>₹{product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.about}>
          <div className={styles.aboutWrapper}>
            <div className={styles.heroLeft}>
              <div className={styles.heroBadge}>
                <FontAwesomeIcon icon={faGem} /> About Us
              </div>

              <div className={styles.aboutImgWrapper}>
                <img
                  src="/aboutus.png"
                  alt="Mana Bommalu"
                  className={styles.aboutImg}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.shipping}>
          <div className={styles.container}>
            <div className={styles.badge}>🌍 Worldwide Delivery</div>

            <h2>
              We Deliver Our <span>Heritage</span> Worldwide
            </h2>

            <p>
              Experience the magic of Etikoppaka toys wherever you are. We ship
              safely across the globe.
            </p>

            <div className={styles.cards}>
              <div className={styles.card}>
                <div className={styles.icon}>🚚</div>
                <h3>International Shipping</h3>
                <p>Doorstep delivery worldwide</p>
              </div>

              <div className={styles.card}>
                <div className={styles.icon}>📦</div>
                <h3>Secure Packaging</h3>
                <p>Eco-friendly packaging</p>
              </div>

              <div className={styles.card}>
                <div className={styles.icon}>💬</div>
                <h3>Contact Us</h3>
                <p>Custom shipping quotes</p>
              </div>

              <div className={styles.card}>
                <div className={styles.icon}>🛡️</div>
                <h3>Track Order</h3>
                <p>Real-time tracking</p>
              </div>
            </div>
{/* 
            <div className={styles.countries}>
              <span>🇺🇸 USA</span>
              <span>🇬🇧 UK</span>
              <span>🇦🇺 Australia</span>
              <span>🇨🇦 Canada</span>
              <span>🇩🇪 Germany</span>
              <span>🇫🇷 France</span>
              <span>🇯🇵 Japan</span>
              <span>🇮🇳 India</span>
              <span>+50 Countries</span>
            </div> */}

            <a
              href="https://wa.me/919014255912?text=Hi%20I'm%20interested%20in%20your%20products"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsapp}
            >
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className={styles.mobileContact}>
          <h2>Get in Touch</h2>
          <div className={styles.mobileContactInfo}>
            <p>
              <FontAwesomeIcon icon={faPhone} /> +91 9014255912
            </p>
            <p>
              <FontAwesomeIcon icon={faEnvelope} /> vinod@manabommalu.in
            </p>
            <Link to="/contact" className={styles.mobileContactBtn}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    );
  }
  // Desktop View (No Search Bar)
  return (
    <div className={styles.desktopContainer}>
      <div className={styles.hero}>
        <div className={styles.heroBgAnimation}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
        </div>
        <div className={styles.heroWrapper}>
          <div className={styles.heroLeft}>
            <div className={styles.logoWrapper}>
              <img
                src="/banner.png"
                alt="Mana Bommalu"
                className={styles.heroLogo}
              />
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroBadge}>
              <FontAwesomeIcon icon={faGem} /> Since 1992
            </div>
            <h1>Traditional Handcrafted</h1>
            <svg
              width="450"
              height="30"
              viewBox="0 0 450 30"
              className="divider-svg"
            >
              <line
                x1="0"
                y1="15"
                x2="200"
                y2="15"
                stroke="#c89b3c"
                strokeWidth="2"
              />
              <line
                x1="250"
                y1="15"
                x2="450"
                y2="15"
                stroke="#c89b3c"
                strokeWidth="2"
              />

              <circle cx="205" cy="15" r="3" fill="#c89b3c" />
              <circle cx="245" cy="15" r="3" fill="#c89b3c" />

              <text
                x="225"
                y="20"
                textAnchor="middle"
                fill="#c89b3c"
                fontSize="22"
              >
                ❁
              </text>
            </svg>
            {/* <p className={styles.heroSubtitle}>
              The Craft of <span className={styles.highlightText}>Etikoppaka</span>
            </p> */}
            <p className={styles.heroSecondSubtitle}>
              {/* <span className={styles.highlightManufacturer}>Directly Manufactured</span>
              <span className={styles.normalText}>by</span> */}
              {/* <span className={styles.highlightText}>Nature’s Colors</span>
              <span className={styles.highlightText}>Culture’s Pride</span>
              <span className={styles.highlightText}>Pure Craft</span>
              <span className={styles.highlightText}>Pure Joy</span>
              <span className={styles.highlightText}>Trusted Craft</span> */}
            </p>
            <p className={styles.heroDescription}>
              Handcrafted by skilled artisans using natural dyes and sustainable
              wood. Each piece brings the rich heritage of Andhra Pradesh into
              your home. Eco-friendly, non-toxic, and crafted to last for
              generations.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faLeaf} />
                <span className={styles.statNumber}>Nature’s Colors</span>

                {/* <span className={styles.statLabel}>Natural</span> */}
              </div>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faGem} />
                <span className={styles.statNumber}>Culture’s Pride</span>
                {/* <span className={styles.statLabel}>Categories</span> */}
              </div>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faHandSparkles} />
                <span className={styles.statNumber}>Pure Craft</span>
                {/* <span className={styles.statLabel}>Years</span> */}
              </div>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faHeart} />
                <span className={styles.statNumber}>Pure Joy</span>
                {/* <span className={styles.statLabel}>Years</span> */}
              </div>
              <div className={styles.stat}>
                <FontAwesomeIcon icon={faHandshake} />
                <span className={styles.statNumber}>Trusted Craft</span>
                {/* <span className={styles.statLabel}>Years</span> */}
              </div>
            </div>
            <div className={styles.heroButtons}>
              <Link to="/products" className={styles.btnPrimary}>
                Explore Collection{" "}
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className={styles.btnIcon}
                />
              </Link>
              <Link to="/contact" className={styles.btnPrimary}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className="container">
          <div className={styles.featureGrid}>
            {/* <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faTruck} />
              </div>
              <h3>Free Shipping</h3>
              <p>On orders over ₹500</p>
            </div> */}
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3>Secure Payment</h3>
              <p>100% secure transactions</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <FontAwesomeIcon icon={faUndo} />
              </div>
              <h3>Easy Returns</h3>
              <p>7-day return policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.categories}>
        <div className="container">
          <h2>Shop by Category</h2>

          {/* Divider */}
          <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg} >
            <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <circle cx="100" cy="15" r="3" fill="#c89b3c" />
            <circle cx="150" cy="15" r="3" fill="#c89b3c" />
            <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">
              ❁
            </text>
          </svg>

          <p className={styles.sectionSubtitle}>
            Explore our diverse collection
          </p>

          <div className={styles.categoryScrollContainer}>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={styles.categoryCard}
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.featured}>
        <div className="container">
          <h2>Featured Products</h2>
          {/* Divider */}
          <svg width="250" height="30" viewBox="0 0 250 30" className={styles.dividerSvg} >
            <line x1="0" y1="15" x2="95" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <line x1="155" y1="15" x2="250" y2="15" stroke="#c89b3c" strokeWidth="2" />
            <circle cx="100" cy="15" r="3" fill="#c89b3c" />
            <circle cx="150" cy="15" r="3" fill="#c89b3c" />
            <text x="125" y="20" textAnchor="middle" fill="#c89b3c" fontSize="20">
              ❁
            </text>
          </svg>
          <p className={styles.sectionSubtitle}>Handpicked just for you</p>
          <div className={styles.productGrid}>
            {featuredProducts.map((product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className={styles.productCard}
              >
                <img
                  src={product.images[0] || "https://placehold.co/400"}
                  alt={product.name}
                />
                <h3>{product.name}</h3>
                <p className={styles.productCategory}>{product.category}</p>
                <p className={styles.price}>
                  ₹{product.price.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.about}>
        <div className={styles.aboutWrapper}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <FontAwesomeIcon icon={faGem} /> About Us
            </div>

            <div className={styles.aboutImgWrapper}>
              <img
                src="/aboutus.png"
                alt="Mana Bommalu"
                className={styles.aboutImg}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.shipping}>
        <div className={styles.container}>
          <div className={styles.badge}>🌍 Worldwide Delivery</div>

          <h2>
            We Deliver Our <span>Heritage</span> Worldwide
          </h2>

          <p>
            Experience the magic of Etikoppaka toys wherever you are. We ship
            safely across the globe.
          </p>

          <div className={styles.cards}>
            <div className={styles.card}>
              <div className={styles.icon}>🚚</div>
              <h3>International Shipping</h3>
              <p>Doorstep delivery worldwide</p>
            </div>

            <div className={styles.card}>
              <div className={styles.icon}>📦</div>
              <h3>Secure Packaging</h3>
              <p>Eco-friendly packaging</p>
            </div>

            <div className={styles.card}>
              <div className={styles.icon}>💬</div>
              <h3>Contact Us</h3>
              <p>Custom shipping quotes</p>
            </div>

            <div className={styles.card}>
              <div className={styles.icon}>🛡️</div>
              <h3>Track Order</h3>
              <p>Real-time tracking</p>
            </div>
          </div>

          {/* <div className={styles.countries}>
            <span>🇺🇸 USA</span>
            <span>🇬🇧 UK</span>
            <span>🇦🇺 Australia</span>
            <span>🇨🇦 Canada</span>
            <span>🇩🇪 Germany</span>
            <span>🇫🇷 France</span>
            <span>🇯🇵 Japan</span>
            <span>🇮🇳 India</span>
            <span>+50 Countries</span>
          </div> */}

          <a
            href="https://wa.me/919014255912?text=Hi%20I'm%20interested%20in%20your%20products"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsapp}
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
