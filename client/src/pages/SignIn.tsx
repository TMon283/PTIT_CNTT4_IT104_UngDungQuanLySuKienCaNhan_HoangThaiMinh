import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import { loginUser, clearError } from '../stores/slices/userSlice';
import { signIn as persistSignIn } from '../utils/auth';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser, loading, error } = useAppSelector((state) => state.user);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setErrors([]);
    dispatch(clearError());
    
    const newErrors: string[] = [];
    if (!email.trim()) newErrors.push('Email không được bỏ trống');
    if (!password.trim()) newErrors.push('Mật khẩu không được bỏ trống');
    setErrors(newErrors);
    if (newErrors.length > 0) return;

    dispatch(loginUser({ email: email.trim(), password }));
  };

  useEffect(() => {
    if (currentUser && !loading) {
      persistSignIn({ 
        id: Number(currentUser.id) ?? 0, 
        email: currentUser.email, 
        username: currentUser.username 
      });
      setSuccess('Đăng nhập thành công');
      setTimeout(() => navigate('/dashboard'), 700);
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    if (error && !loading) {
      setErrors([error]);
    }
  }, [error, loading]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="fixed top-6 left-6 z-50 space-y-3 w-[320px]">
        {errors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <div className="font-semibold mb-2">Error</div>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm">
            <div className="font-semibold mb-1">Đăng nhập thành công</div>
            <div className="text-sm">Đang chuyển đến Dashboard...</div>
          </div>
        )}
      </div>
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">Trello</h1>
          <h2 className="text-3xl text-gray-900 text-start">Please sign in</h2>
        </div>

        {/* Sign-in Form */}
        <div className="">
          <form onSubmit={handleSubmit} className="">
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-tl-md rounded-tr-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-bl-md rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black"
              />
            </div>

            <div className="flex items-center pt-4">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Remember me
              </label>
            </div>

            {/* Sign Up Link */}
            <div className="text-sm text-gray-700 pt-4 pb-4">
              Don't have an account,{' '}
              <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                click here !
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 disabled:opacity-60 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? 'Processing...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-start mt-8 text-sm text-gray-600">
          © 2025 - Rikkei Education
        </div>
      </div>
    </div>
  );
};

export default SignIn;