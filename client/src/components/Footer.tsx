import { Link } from 'react-router-dom';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      alert('感謝您的訂閱！');
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* ABOUT */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wider">ABOUT</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors">
                  品牌介紹
                </Link>
              </li>
              <li>
                <Link to="/stores" className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors">
                  門市資訊
                </Link>
              </li>
              <li>
                <Link to="/partnership" className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors">
                  品牌合作
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wider">HELP</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors">
                  會員及購物問題
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wider">SOCIAL</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a 
                  href="https://line.me" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors"
                >
                  Line
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* NEWS LETTER */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wider">NEWS LETTER</h3>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="輸入您的電子郵件"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm font-light"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-light uppercase tracking-wider"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* CUSTOMER SERVICE */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-2 uppercase tracking-wider">CUSTOMER SERVICE</h3>
          <p className="text-sm text-gray-600 font-light mb-1">
            <a href="mailto:service@tung-store.com" className="hover:text-gray-900 transition-colors">
              service@tung-store.com
            </a>
          </p>
          <p className="text-sm text-gray-600 font-light">
            mon.~fri. 09:00-12:00 / 13:00-18:00
          </p>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-500 font-light text-center">
            © TUNG STORE {new Date().getFullYear()} 女裝品牌 | 版權所有
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
