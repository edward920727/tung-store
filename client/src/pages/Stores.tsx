import { SEO } from '../components/SEO';

const Stores = () => {
  const stores = [
    {
      name: '台北信義店',
      address: '台北市信義區信義路五段7號',
      phone: '02-2345-6789',
      hours: '週一至週日 11:00 - 22:00',
      status: '營業中'
    },
    {
      name: '台中中友店',
      address: '台中市北區三民路三段161號',
      phone: '04-2223-4567',
      hours: '週一至週日 11:00 - 22:00',
      status: '營業中'
    },
    {
      name: '高雄夢時代店',
      address: '高雄市前鎮區中華五路789號',
      phone: '07-8123-4567',
      hours: '週一至週日 11:00 - 22:00',
      status: '營業中'
    }
  ];

  return (
    <>
      <SEO 
        title="門市資訊 | TUNG STORE"
        description="TUNG STORE 實體門市資訊，歡迎親臨體驗我們的服裝質感與服務。"
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">門市資訊</h1>
          <div className="w-24 h-0.5 bg-pink-300 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-light">
            歡迎親臨我們的實體門市，體驗 TUNG STORE 的服裝質感與專業服務
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-light text-gray-900 mb-2">{store.name}</h3>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-light rounded-full">
                  {store.status}
                </span>
              </div>
              <div className="space-y-3 text-sm text-gray-600 font-light">
                <div>
                  <span className="text-gray-500">地址：</span>
                  <p className="mt-1">{store.address}</p>
                </div>
                <div>
                  <span className="text-gray-500">電話：</span>
                  <a href={`tel:${store.phone}`} className="text-pink-600 hover:text-pink-700">
                    {store.phone}
                  </a>
                </div>
                <div>
                  <span className="text-gray-500">營業時間：</span>
                  <p className="mt-1">{store.hours}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 font-light mb-4">
            更多門市資訊將陸續更新，敬請期待
          </p>
          <p className="text-sm text-gray-500 font-light">
            如有任何疑問，歡迎聯繫客服：service@tung-store.com
          </p>
        </div>
      </div>
    </>
  );
};

export default Stores;
