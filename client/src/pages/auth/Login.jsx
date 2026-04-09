import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Target, Eye, EyeOff, AlertCircle } from 'lucide-react';
import GoogleButton from './google';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong, please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 bg-[#121212]">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#522398] to-accent flex items-center justify-center">
              <Target size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[#e0e0e0]">Da-Lead</span>
          </Link>

          <h1 className="text-3xl font-black text-[#e0e0e0] mb-2">Welcome back</h1>
          <p className="text-[#a0a0a0] mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input-field border-gray-800 bg-[#1e1e1e] text-[#e0e0e0] placeholder-[#a0a0a0]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-[#e0e0e0]">Password</label>
                <button type="button" className="text-sm text-[#522398] font-medium hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-field pr-11 border-gray-800 bg-[#1e1e1e] text-[#e0e0e0] placeholder-[#a0a0a0]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full bg-[#522398]">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Seperator */}
          <div className="flex items-center my-3">
            <hr className="flex-grow border-gray-700" />
            <span className="mx-3 text-gray-400 font-medium text-sm">OR</span>
            <hr className="flex-grow border-gray-700" />
          </div>

          {/* Sign up with google */}
          <GoogleButton/>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#522398] font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right — decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 via-primary-dark to-gray-900 items-end p-14">
        <blockquote className="max-w-sm">
          <p className="text-white text-xl font-semibold leading-relaxed mb-5">
            "Da-Lead completely transformed my freelance business. I'm spending less time searching and more time closing."
          </p>
          <footer className="text-gray-400 text-sm font-medium">— Sarah J., Brand Designer</footer>
        </blockquote>
      </div>
    </div>
  );
}
