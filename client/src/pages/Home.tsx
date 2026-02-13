import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestoreService, HomePageConfig, Product } from '../services/firestore';

const Home = () => {
  const [config, setConfig] = useState<HomePageConfig | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomePageConfig();
  }, []);

  const fetchHomePageConfig = async () => {
    try {
      const homeConfig = await firestoreService.getHomePageConfig();
      setConfig(homeConfig);
      
      // 如果有精選商品 ID，獲取商品詳情
      if (homeConfig && homeConfig.featuredProductIds.length > 0) {
        const products = await Promise.all(
          homeConfig.featuredProductIds.map((id: string) => firestoreService.getProduct(id))
        );
        setFeaturedProducts(products.filter((p: Product | null): p is Product => p !== null));
      }
    } catch (error) {
      console.error('獲取首頁配置失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 使用配置或默認值
  const heroTitle = config?.heroTitle || '歡迎來到小童服飾';
  const heroSubtitle = config?.heroSubtitle || '發現優質童裝，享受便捷購物體驗';
  const heroButtonText = config?.heroButtonText || '瀏覽商品';
  const heroButtonLink = config?.heroButtonLink || '/products';
  const heroBackgroundImage = config?.heroBackgroundImage || 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&q=80';
  const primaryColor = config?.primaryColor || '#EC4899';
  const gradientFrom = config?.gradientFrom || '#EC4899';
  const gradientTo = config?.gradientTo || '#8B5CF6';
  const showFeatures = config?.showFeatures !== undefined ? config.showFeatures : true;
  const showGallery = config?.showGallery !== undefined ? config.showGallery : true;
  const sectionOrder = config?.sectionOrder || ['hero', 'features', 'gallery'];
  const features = config?.features || [
    { title: '豐富商品', description: '瀏覽我們精心挑選的童裝，涵蓋各種款式、尺碼和風格', icon: '🛍️', imageUrl: 'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=800&q=80', gradientFrom: '#EC4899', gradientTo: '#8B5CF6' },
    { title: '便捷購物', description: '簡單易用的購物車系統，輕鬆管理您想要購買的商品', icon: '🛒', imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80', gradientFrom: '#3B82F6', gradientTo: '#06B6D4' },
    { title: '安全可靠', description: '安全的支付系統和訂單管理，讓您購物無憂', icon: '🔒', imageUrl: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&q=80', gradientFrom: '#10B981', gradientTo: '#059669' },
  ];

  // 渲染 Hero 區域
  const renderHero = () => (
    <div 
      className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroBackgroundImage})`,
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${gradientFrom}20, ${gradientTo}20)`,
        }}
      ></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl drop-shadow-2xl mb-6">
          {heroTitle}
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-white sm:text-2xl md:text-3xl drop-shadow-lg mb-8">
          {heroSubtitle}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={heroButtonLink}
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            style={{
              background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
            }}
          >
            {heroButtonText}
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-white/20 backdrop-blur-sm rounded-full border-2 border-white hover:bg-white/30 transition-all duration-300"
          >
            了解更多
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </div>
  );

  // 渲染特色區塊
  const renderFeatures = () => {
    if (!showFeatures) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: feature.imageUrl ? `url(${feature.imageUrl})` : undefined,
                  backgroundColor: feature.imageUrl ? undefined : '#f3f4f6',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
              </div>
              <div className="relative p-8 h-80 flex flex-col justify-end">
                <div 
                  className="inline-flex items-center justify-center p-4 rounded-xl shadow-lg mb-4 w-16 h-16 text-2xl"
                  style={{
                    background: `linear-gradient(to right, ${feature.gradientFrom}, ${feature.gradientTo})`,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/90 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染精選商品
  const renderGallery = () => {
    if (!showGallery) return null;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 
          className="text-4xl font-bold text-center mb-12"
          style={{ color: primaryColor }}
        >
          精選商品展示
        </h2>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 aspect-square group"
              >
                <img 
                  src={product.image_url || 'https://via.placeholder.com/600x600'} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-white/90 text-sm">NT${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>暫無精選商品，請在後台設置</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加載中...</div>
      </div>
    );
  }

  // 根據配置的順序渲染區塊
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return renderHero();
      case 'features':
        return renderFeatures();
      case 'gallery':
        return renderGallery();
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      {sectionOrder.map((sectionId) => (
        <div key={sectionId}>
          {renderSection(sectionId)}
        </div>
      ))}
    </div>
  );
};

export default Home;
