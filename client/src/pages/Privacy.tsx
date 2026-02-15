import { SEO } from '../components/SEO';

const Privacy = () => {
  return (
    <>
      <SEO 
        title="隱私權政策 | TUNG STORE"
        description="TUNG STORE 隱私權政策，說明我們如何收集、使用和保護您的個人資料。"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">隱私權政策</h1>
          <div className="w-24 h-0.5 bg-pink-300 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-light text-sm">
            最後更新日期：2024年12月
          </p>
        </div>

        <div className="space-y-8 text-gray-700 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">1. 資料收集</h2>
            <p className="mb-4">
              TUNG STORE（以下簡稱「我們」）重視您的隱私權。當您使用我們的服務時，我們可能會收集以下資訊：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>個人資料：姓名、電子郵件地址、電話號碼、地址等</li>
              <li>交易資料：訂單資訊、付款記錄、購物歷史等</li>
              <li>技術資料：IP 位址、瀏覽器類型、裝置資訊等</li>
              <li>使用資料：網站瀏覽行為、點擊記錄等</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">2. 資料使用</h2>
            <p className="mb-4">我們使用收集的資料用於以下目的：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>處理您的訂單與提供客戶服務</li>
              <li>發送訂單確認、出貨通知等交易相關訊息</li>
              <li>發送行銷訊息與優惠資訊（您可隨時取消訂閱）</li>
              <li>改善網站功能與使用者體驗</li>
              <li>進行數據分析與市場研究</li>
              <li>防範詐騙與確保交易安全</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">3. 資料保護</h2>
            <p className="mb-4">
              我們採用適當的技術與管理措施保護您的個人資料，包括：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>使用 SSL 加密技術保護資料傳輸</li>
              <li>限制資料存取權限，僅授權人員可接觸個人資料</li>
              <li>定期進行安全檢查與更新</li>
              <li>與可信賴的第三方服務提供商合作</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">4. 資料分享</h2>
            <p className="mb-4">
              我們不會出售您的個人資料。在以下情況下，我們可能會與第三方分享資料：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>物流服務提供商（用於商品配送）</li>
              <li>付款處理服務提供商（用於處理付款）</li>
              <li>行銷服務提供商（用於發送電子郵件等）</li>
              <li>法律要求或保護我們權益時</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">5. 您的權利</h2>
            <p className="mb-4">您對個人資料享有以下權利：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>查詢、閱覽您的個人資料</li>
              <li>要求更正或補充您的個人資料</li>
              <li>要求刪除您的個人資料（在法律允許範圍內）</li>
              <li>要求停止處理您的個人資料</li>
              <li>取消訂閱行銷訊息</li>
            </ul>
            <p className="mt-4">
              如需行使上述權利，請聯繫我們：service@tung-store.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">6. Cookie 使用</h2>
            <p>
              我們使用 Cookie 來改善網站體驗、記住您的偏好設定，以及進行數據分析。
              您可以在瀏覽器設定中管理 Cookie 偏好，但可能會影響部分網站功能。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">7. 政策變更</h2>
            <p>
              我們可能會不定期更新本隱私權政策。重大變更時，我們將透過網站公告或電子郵件通知您。
              建議您定期查看本政策以了解最新資訊。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-gray-900 mb-4">8. 聯繫我們</h2>
            <p>
              如對本隱私權政策有任何疑問，歡迎聯繫我們：
            </p>
            <div className="bg-pink-50 p-6 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong className="text-gray-900">客服信箱：</strong>
                <a href="mailto:service@tung-store.com" className="text-pink-600 hover:text-pink-700 ml-2">
                  service@tung-store.com
                </a>
              </p>
              <p className="text-gray-700 mt-2">
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

export default Privacy;
