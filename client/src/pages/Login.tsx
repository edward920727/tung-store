import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('請輸入郵箱');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('郵箱格式不正確');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('請輸入密碼');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('密碼至少需要6個字符');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      // Firebase 錯誤處理
      let errorMessage = '登錄失敗';
      if (err.message) {
        if (err.message.includes('auth/user-not-found')) {
          errorMessage = '用戶不存在';
        } else if (err.message.includes('auth/wrong-password') || err.message.includes('auth/invalid-credential')) {
          errorMessage = '郵箱或密碼錯誤，請確認後重試。如果還沒有帳戶，請先註冊。';
        } else if (err.message.includes('auth/invalid-email')) {
          errorMessage = '郵箱格式不正確';
        } else if (err.message.includes('auth/too-many-requests')) {
          errorMessage = '嘗試次數過多，請稍後再試';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      console.error('登錄錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">登錄</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              郵箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {emailError}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={(e) => validatePassword(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
            {passwordError && (
              <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                {passwordError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {loading ? '登錄中...' : '登錄'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          還沒有帳戶？{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            立即註冊
          </Link>
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <p className="font-semibold mb-1">💡 提示：</p>
          <p>如果您是第一次使用，請先點擊「立即註冊」創建帳戶。</p>
          <p className="mt-1">如果忘記密碼，請確認您輸入的郵箱和密碼是否正確。</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
