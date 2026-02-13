import { Link } from 'react-router-dom';

const Home = () => {
  // 使用Unsplash无版权图片 - 童装相关
  const heroImages = [
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&q=80',
    'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=1920&q=80',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&q=80'
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Background */}
      <div 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImages[0]})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100/20 via-purple-100/20 to-blue-100/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl drop-shadow-2xl mb-6">
            歡迎來到小童服飾
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-white sm:text-2xl md:text-3xl drop-shadow-lg mb-8">
            發現優質童裝，享受便捷購物體驗
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
            >
              瀏覽商品
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-white/20 backdrop-blur-sm rounded-full border-2 border-white hover:bg-white/30 transition-all duration-300"
            >
              了解更多
            </Link>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-16 relative z-20">

        {/* Features Section with Image Cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-20">
          <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${heroImages[1]})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            </div>
            <div className="relative p-8 h-80 flex flex-col justify-end">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-lg mb-4 w-16 h-16">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">豐富商品</h3>
              <p className="text-white/90 text-base leading-relaxed">
                瀏覽我們精心挑選的童裝，涵蓋各種款式、尺碼和風格
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${heroImages[2]})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            </div>
            <div className="relative p-8 h-80 flex flex-col justify-end">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg mb-4 w-16 h-16">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">便捷購物</h3>
              <p className="text-white/90 text-base leading-relaxed">
                簡單易用的購物車系統，輕鬆管理您想要購買的商品
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&q=80)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            </div>
            <div className="relative p-8 h-80 flex flex-col justify-end">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg mb-4 w-16 h-16">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">安全可靠</h3>
              <p className="text-white/90 text-base leading-relaxed">
                安全的支付系統和訂單管理，讓您購物無憂
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">精選商品展示</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1503919005314-30d9339471c3?w=600&q=80',
              'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
              'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
              'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=600&q=80',
            ].map((img, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 aspect-square"
              >
                <img 
                  src={img} 
                  alt={`童裝展示 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
