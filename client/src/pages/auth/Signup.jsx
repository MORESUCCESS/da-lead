import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Target, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const perks = [
  'AI-powered opportunity scoring',
  'Personalized pitch generator',
  'Visual lead tracking pipeline',
  'Follow-up reminders',
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary-dark to-gray-900 flex-col justify-center p-14">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Target size={18} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-white">Da-Lead</span>
        </div>
        <h2 className="text-4xl font-black text-white mb-4 leading-tight">Start your journey</h2>
        <p className="text-primary-100 mb-10">Join thousands of freelancers scaling their outreach with AI.</p>
        <ul className="space-y-3">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-3 text-primary-100">
              <CheckCircle size={18} className="text-green-400 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 bg-[#121212]">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Target size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[#e0e0e0]">Da-Lead</span>
          </Link>

          <h1 className="text-3xl font-black text-[#e0e0e0] mb-2">Create an account</h1>
          <p className="text-[#a0a0a0] mb-8">Start turning leads into clients today</p>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="input-field border-gray-800 bg-[#1e1e1e] text-[#e0e0e0] placeholder-[#a0a0a0]"
              />
            </div>
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
              <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
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
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-600">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
