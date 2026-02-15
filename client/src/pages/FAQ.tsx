import { useState } from 'react';
import { SEO } from '../components/SEO';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: '會員相關',
      questions: [
        {
          q: '如何註冊會員？',
          a: '您可以在網站右上角點擊「登入」，然後選擇「註冊新帳號」，填寫基本資料即可完成註冊。'
        },
        {
          q: '忘記密碼怎麼辦？',
          a: '請在登入頁面點擊「忘記密碼」，輸入您的註冊信箱，系統將發送重設密碼連結至您的信箱。'
        },
        {
          q: '會員等級如何升級？',
          a: '會員等級會根據您的累積消費金額自動升級，不同等級享有不同的優惠與專屬權益。'
        }
      ]
    },
    {
      category: '購物相關',
      questions: [
        {
          q: '如何下單購買？',
          a: '選擇您喜愛的商品，加入購物車後前往結帳頁面，填寫收件資訊並選擇付款方式即可完成訂單。'
        },
        {
          q: '有哪些付款方式？',
          a: '目前支援信用卡付款、ATM 轉帳、超商代碼繳費等方式。'
        },
        {
          q: '運費如何計算？',
          a: '單筆訂單滿 NT$1,000 免運費，未滿則收取 NT$80 運費。'
        },
        {
          q: '多久可以收到商品？',
          a: '完成付款後，我們將在 1-2 個工作天內出貨，一般配送約 3-5 個工作天可送達。'
        }
      ]
    },
    {
      category: '退換貨相關',
      questions: [
        {
          q: '可以退換貨嗎？',
          a: '商品到貨後 7 天內，如商品有瑕疵或不符合需求，可申請退換貨。請保持商品全新未使用狀態。'
        },
        {
          q: '如何申請退換貨？',
          a: '請至「我的訂單」頁面選擇要退換貨的訂單，點擊「申請退換貨」並填寫原因，我們將盡快為您處理。'
        },
        {
          q: '退換貨運費由誰負擔？',
          a: '如因商品瑕疵或寄錯商品，運費由我們負擔；如因個人因素退換貨，運費需由您自行負擔。'
        }
      ]
    },
    {
      category: '優惠券相關',
      questions: [
        {
          q: '如何使用優惠券？',
          a: '在購物車頁面輸入優惠券代碼，系統會自動計算折扣金額。部分優惠券可能有使用條件限制。'
        },
        {
          q: '優惠券可以合併使用嗎？',
          a: '每筆訂單僅能使用一張優惠券，無法與其他優惠活動合併使用。'
        }
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="常見問題 | TUNG STORE"
        description="TUNG STORE 常見問題解答，包含會員、購物、退換貨等相關問題。"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">常見問題</h1>
          <div className="w-24 h-0.5 bg-pink-300 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-light">
            以下是顧客最常詢問的問題，如有其他疑問歡迎聯繫客服
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-light text-gray-900">{category.category}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {category.questions.map((item, qIndex) => {
                  const index = categoryIndex * 100 + qIndex;
                  const isOpen = openIndex === index;
                  return (
                    <div key={qIndex}>
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-900 font-light">{item.q}</span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-6 py-4 bg-gray-50 text-gray-600 font-light leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-pink-50 p-6 rounded-lg text-center">
          <p className="text-gray-700 font-light mb-2">
            還有其他問題嗎？
          </p>
          <p className="text-sm text-gray-600 font-light">
            歡迎聯繫客服：<a href="mailto:service@tung-store.com" className="text-pink-600 hover:text-pink-700">service@tung-store.com</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default FAQ;
