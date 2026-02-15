import { SEO } from '../components/SEO';

const News = () => {
  const newsItems = [
    {
      date: '2024-12-15',
      title: '冬季新品上市',
      content: '全新冬季系列正式上架，包含溫暖針織、優雅大衣等多款單品，為您的冬日穿搭增添時尚感。'
    },
    {
      date: '2024-12-01',
      title: '品牌正式上線',
      content: 'TUNG STORE 正式上線！我們致力於為現代女性提供優雅、時尚、舒適的服裝選擇。'
    },
    {
      date: '2024-11-20',
      title: '開幕優惠活動',
      content: '慶祝品牌開幕，全館商品享有開幕優惠，歡迎選購您喜愛的服裝。'
    }
  ];

  return (
    <>
      <SEO 
        title="最新消息 | TUNG STORE"
        description="TUNG STORE 最新消息與品牌動態，包含新品上市、優惠活動等資訊。"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">最新消息</h1>
          <div className="w-24 h-0.5 bg-pink-300 mx-auto"></div>
        </div>

        <div className="space-y-8">
          {newsItems.map((item, index) => (
            <article key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-light text-gray-900">{item.title}</h2>
                <time className="text-sm text-gray-500 font-light">
                  {new Date(item.date).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <p className="text-gray-600 font-light leading-relaxed">
                {item.content}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 font-light text-sm">
            更多最新消息將持續更新，敬請關注我們的社群媒體
          </p>
        </div>
      </div>
    </>
  );
};

export default News;
