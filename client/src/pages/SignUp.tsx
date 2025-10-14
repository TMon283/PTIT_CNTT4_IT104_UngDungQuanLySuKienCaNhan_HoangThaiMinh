import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import { registerUser, clearError } from '../stores/slices/userSlice';
import { userService } from '../services/userService';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser, loading, error } = useAppSelector((state) => state.user);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = () => {
    const newErrors: string[] = [];
    if (!username.trim()) newErrors.push('Họ tên không được bỏ trống');
    if (!email.trim()) newErrors.push('Email không được bỏ trống');
    if (!password.trim()) newErrors.push('Mật khẩu không được bỏ trống');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (email && !emailRegex.test(email)) newErrors.push('Email không đúng định dạng');
    if (password && password.length < 8) newErrors.push('Mật khẩu phải có ít nhất 8 ký tự');
    if (password && !passwordRegex.test(password)) newErrors.push('Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt');
    if (confirmPassword != password) newErrors.push('Mật khẩu không trùng khớp');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    setSuccess(null);
    setErrors([]);
    dispatch(clearError());
    
    if (!validate()) return;
    
    try {
      const exists = await userService.checkEmailExists(email.trim());
      if (exists) {
        setErrors(['Email đã được đăng ký, vui lòng dùng email khác']);
        return;
      }
      dispatch(registerUser({ 
        username: username.trim(), 
        email: email.trim(), 
        password 
      }));
    } catch (e) {
      setSuccess(null);
      setErrors(['Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.']);
    }
  };

  useEffect(() => {
    if (currentUser && !loading) {
      setErrors([]);
      setSuccess('Đăng ký thành công');
      setTimeout(() => navigate('/signin'), 900);
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
            <div className="font-semibold mb-1">Đăng ký thành công</div>
            <div className="text-sm">Đang chuyển sang trang đăng nhập...</div>
          </div>
        )}
      </div>
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">Trello</h1>
          <h2 className="text-3xl text-gray-900 text-start">Please sign up</h2>
        </div>

        {/* Sign-up Form */}
        <div className="">
          <div className="">
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

            {/* Username Input */}
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-bl-md rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black"
              />
            </div>

            {/* Sign In Link */}
            <div className="text-sm text-gray-700 pt-4 pb-4">
              Already have an account,{' '}
              <a href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                click here !
              </a>
            </div>

            {/* Sign Up Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 disabled:opacity-60 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? 'Processing...' : 'Sign up'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-start mt-8 text-sm text-gray-600">
          © 2025 - Rikkei Education
        </div>
      </div>
    </div>
  );
};

export default SignUp;