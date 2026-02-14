import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateUsername = (username: string) => {
    if (!username) {
      setUsernameError('請輸入用戶名');
      return false;
    }
    if (username.length < 3) {
      setUsernameError('用戶名至少需要3個字符');
      return false;
    }
    setUsernameError('');
    return true;
  };

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
    setUsernameError('');
    setEmailError('');
    setPasswordError('');

    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      // Firebase 錯誤處理
      let errorMessage = '註冊失敗';
      if (err.message) {
        if (err.message.includes('auth/email-already-in-use')) {
          errorMessage = '該郵箱已被註冊';
        } else if (err.message.includes('auth/invalid-email')) {
          errorMessage = '郵箱格式不正確';
        } else if (err.message.includes('auth/weak-password')) {
          errorMessage = '密碼強度不足，請使用至少6個字符';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      console.error('註冊錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">註冊</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用戶名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) validateUsername(e.target.value);
              }}
              onBlur={(e) => validateUsername(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                usernameError ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!usernameError}
              aria-describedby={usernameError ? 'username-error' : undefined}
            />
            {usernameError && (
              <p id="username-error" className="mt-1 text-sm text-red-600" role="alert">
                {usernameError}
              </p>
            )}
          </div>
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
              minLength={6}
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
            <p className="mt-1 text-xs text-gray-500">密碼至少需要6個字符</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          已有帳戶？{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700">
            立即登錄
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
