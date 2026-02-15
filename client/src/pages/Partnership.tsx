import { SEO } from '../components/SEO';

const Partnership = () => {
  return (
    <>
      <SEO 
        title="品牌合作 | TUNG STORE"
        description="TUNG STORE 歡迎與各品牌、設計師、KOL 等合作，共同創造時尚價值。"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">品牌合作</h1>
          <div className="w-24 h-0.5 bg-pink-300 mx-auto"></div>
        </div>

        <div className="space-y-8 text-gray-700 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">合作機會</h2>
            <p className="mb-4">
              TUNG STORE 是一個新興的女裝品牌，我們歡迎與各類合作夥伴建立長期且互惠的合作關係。
              無論您是設計師、KOL、媒體、或其他品牌，我們都期待與您攜手創造更多可能性。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">合作類型</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-light text-gray-900 mb-2">設計師聯名</h3>
                <p className="text-sm">
                  與獨立設計師合作推出聯名系列，共同探索時尚的無限可能。
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-light text-gray-900 mb-2">KOL/網紅合作</h3>
                <p className="text-sm">
                  與時尚 KOL 合作推廣品牌，透過真實的穿搭分享傳遞品牌理念。
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-light text-gray-900 mb-2">媒體合作</h3>
                <p className="text-sm">
                  與時尚媒體、雜誌合作，共同推廣優質內容與品牌形象。
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-light text-gray-900 mb-2">品牌異業合作</h3>
                <p className="text-sm">
                  與其他品牌進行跨界合作，創造獨特的品牌體驗與價值。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">聯繫我們</h2>
            <p className="mb-4">
              如果您對合作機會感興趣，歡迎透過以下方式聯繫我們：
            </p>
            <div className="bg-pink-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">合作信箱：</strong>
                <a href="mailto:partnership@tung-store.com" className="text-pink-600 hover:text-pink-700 ml-2">
                  partnership@tung-store.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong className="text-gray-900">服務時間：</strong>
                <span className="ml-2">週一至週五 09:00-12:00 / 13:00-18:00</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Partnership;
