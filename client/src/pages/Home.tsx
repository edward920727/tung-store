import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { firestoreService, HomePageConfig, Product, CustomBlock } from '../services/firestore';

const Home = () => {
  const [config, setConfig] = useState<HomePageConfig | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [customBlockProducts, setCustomBlockProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomePageConfig();
  }, []);

  const fetchHomePageConfig = async () => {
    try {
      const homeConfig = await firestoreService.getHomePageConfig();
      setConfig(homeConfig);
      
      // 如果有精選商品 ID，獲取商品詳情
      if (homeConfig && homeConfig.featuredProductIds && homeConfig.featuredProductIds.length > 0) {
        try {
          const products = await Promise.all(
            homeConfig.featuredProductIds.map((id: string) => 
              firestoreService.getProduct(id).catch(err => {
                console.warn(`無法獲取商品 ${id}:`, err);
                return null;
              })
            )
          );
          setFeaturedProducts(products.filter((p: Product | null): p is Product => p !== null));
        } catch (error) {
          console.error('獲取精選商品失敗:', error);
          setFeaturedProducts([]);
        }
      } else {
        setFeaturedProducts([]);
      }

      // 如果有自訂區塊，獲取相關商品
      if (homeConfig && homeConfig.customBlocks && homeConfig.customBlocks.length > 0) {
        try {
          const blockProductsMap: Record<string, Product[]> = {};
          for (const block of homeConfig.customBlocks) {
            if (block.type === 'product-grid' && block.productIds && block.productIds.length > 0) {
              try {
                const products = await Promise.all(
                  block.productIds.map((id: string) => 
                    firestoreService.getProduct(id).catch(err => {
                      console.warn(`無法獲取商品 ${id}:`, err);
                      return null;
                    })
                  )
                );
                blockProductsMap[block.id] = products.filter((p: Product | null): p is Product => p !== null);
              } catch (error) {
                console.error(`獲取自訂區塊 ${block.id} 的商品失敗:`, error);
                blockProductsMap[block.id] = [];
              }
            }
          }
          setCustomBlockProducts(blockProductsMap);
        } catch (error) {
          console.error('獲取自訂區塊商品失敗:', error);
          setCustomBlockProducts({});
        }
      } else {
        setCustomBlockProducts({});
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
  const heroCarouselEnabled = config?.heroCarouselEnabled || false;
  const heroCarouselImages = config?.heroCarouselImages || [];
  const heroCarouselSpeed = config?.heroCarouselSpeed || 3000;
  const heroCarouselAutoPlay = config?.heroCarouselAutoPlay !== undefined ? config.heroCarouselAutoPlay : true;
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

  // Hero 輪播狀態
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 輪播自動播放效果
  useEffect(() => {
    if (heroCarouselEnabled && heroCarouselImages.length > 1 && heroCarouselAutoPlay) {
      carouselIntervalRef.current = setInterval(() => {
        setCurrentCarouselIndex((prevIndex) => 
          (prevIndex + 1) % heroCarouselImages.length
        );
      }, heroCarouselSpeed);

      return () => {
        if (carouselIntervalRef.current) {
          clearInterval(carouselIntervalRef.current);
        }
      };
    }
  }, [heroCarouselEnabled, heroCarouselImages.length, heroCarouselAutoPlay, heroCarouselSpeed]);

  // 渲染 Hero 區域
  const renderHero = () => {
    // 如果啟用輪播且有圖片，顯示輪播
    if (heroCarouselEnabled && heroCarouselImages.length > 0) {
      return (
        <div className="relative h-screen overflow-hidden">
          {/* 輪播圖片容器 */}
          <div className="absolute inset-0">
            {heroCarouselImages.map((imageUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                  index === currentCarouselIndex ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageUrl})`,
                }}
              />
            ))}
          </div>

          {/* 漸變遮罩 */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${gradientFrom}20, ${gradientTo}20)`,
            }}
          ></div>

          {/* 內容 */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
          </div>

          {/* 輪播控制按鈕 */}
          {heroCarouselImages.length > 1 && (
            <>
              {/* 上一張/下一張按鈕 */}
              <button
                onClick={() => {
                  setCurrentCarouselIndex((prevIndex) => 
                    prevIndex === 0 ? heroCarouselImages.length - 1 : prevIndex - 1
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300"
                aria-label="上一張"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setCurrentCarouselIndex((prevIndex) => 
                    (prevIndex + 1) % heroCarouselImages.length
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300"
                aria-label="下一張"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 指示器 */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroCarouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCarouselIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentCarouselIndex
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`切換到第 ${index + 1} 張`}
                  />
                ))}
              </div>
            </>
          )}

          {/* 底部漸變 */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent z-10"></div>
        </div>
      );
    }

    // 否則顯示單張背景圖
    return (
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
  };

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

  // 渲染自訂區塊
  const renderCustomBlock = (block: CustomBlock) => {
    if (!block.isVisible) return null;

    const style: React.CSSProperties = {
      backgroundColor: block.backgroundColor || '#FFFFFF',
      color: block.textColor || '#000000',
      padding: block.padding || '20px',
      margin: block.margin || '0px',
    };

    switch (block.type) {
      case 'text':
        return (
          <div key={block.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={style}>
            {block.title && (
              <h2 className="text-3xl font-bold mb-4" style={{ color: block.textColor || '#000000' }}>
                {block.title}
              </h2>
            )}
            <div className="prose max-w-none" style={{ color: block.textColor || '#000000' }}>
              {block.content?.split('\n').map((line, i) => (
                <p key={i} className="mb-4 text-lg leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="w-full" style={style}>
            {block.imageUrl && (
              <img
                src={block.imageUrl}
                alt={block.title || '區塊圖片'}
                className="w-full h-auto object-cover"
              />
            )}
          </div>
        );

      case 'banner':
        return (
          <div key={block.id} className="w-full relative overflow-hidden" style={style}>
            {block.imageUrl && (
              <div
                className="w-full h-64 md:h-96 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${block.imageUrl})` }}
              >
                {block.title && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <h2 className="text-3xl md:text-5xl font-bold text-white text-center px-4">
                      {block.title}
                    </h2>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'product-grid':
        const products = customBlockProducts[block.id] || [];
        return (
          <div key={block.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={style}>
            {block.title && (
              <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: block.textColor || '#000000' }}>
                {block.title}
              </h2>
            )}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/600x600'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 truncate">{product.name}</h3>
                      <p className="text-pink-600 font-semibold">NT${product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>暫無商品</p>
              </div>
            )}
          </div>
        );

      case 'html':
        return (
          <div
            key={block.id}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            style={style}
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        );

      default:
        return null;
    }
  };

  // 根據配置的順序渲染區塊
  const renderSection = (sectionId: string) => {
    // 檢查是否為自訂區塊
    if (sectionId.startsWith('custom-block-') && config?.customBlocks) {
      const block = config.customBlocks.find(b => b.id === sectionId);
      if (block) {
        return renderCustomBlock(block);
      }
      return null;
    }

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
