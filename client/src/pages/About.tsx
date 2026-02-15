import { SEO } from '../components/SEO';

const About = () => {
  return (
    <>
      <SEO 
        title="品牌介紹 | TUNG STORE"
        description="TUNG STORE 致力於為現代女性打造優雅、時尚、舒適的服裝，傳遞自信與美麗的時尚態度。"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">品牌介紹</h1>
          <div className="w-24 h-0.5 bg-pink-300 mx-auto"></div>
        </div>

        <div className="space-y-8 text-gray-700 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">關於 TUNG STORE</h2>
            <p className="mb-4">
              TUNG STORE 是一個專為現代女性打造的女裝品牌，我們相信每一位女性都值得擁有展現自我風格的服裝。
              品牌成立於 2024 年，致力於提供優雅、時尚且舒適的服裝選擇，讓每位女性都能在日常生活中散發自信與美麗。
            </p>
            <p>
              我們注重服裝的質感與細節，從面料選擇到剪裁設計，每一個環節都經過精心考量，
              只為呈現最完美的穿著體驗。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">品牌理念</h2>
            <p className="mb-4">
              <strong className="text-gray-900">優雅 Elegance</strong><br />
              我們追求簡約而不簡單的設計，透過精緻的細節展現女性的優雅氣質。
            </p>
            <p className="mb-4">
              <strong className="text-gray-900">舒適 Comfort</strong><br />
              時尚不應該犧牲舒適度，我們選擇優質面料，確保每一件服裝都能帶來舒適的穿著感受。
            </p>
            <p>
              <strong className="text-gray-900">自信 Confidence</strong><br />
              我們希望透過服裝，幫助每位女性找到屬於自己的風格，展現自信與美麗。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">我們的承諾</h2>
            <ul className="space-y-3 list-none">
              <li className="flex items-start">
                <span className="text-pink-400 mr-3">✦</span>
                <span>嚴選優質面料，確保服裝品質與舒適度</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-3">✦</span>
                <span>注重環保與永續發展，選擇對環境友善的生產方式</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-3">✦</span>
                <span>提供貼心的客戶服務，讓購物體驗更加順暢</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-3">✦</span>
                <span>持續創新設計，為您帶來最新的時尚趨勢</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;
