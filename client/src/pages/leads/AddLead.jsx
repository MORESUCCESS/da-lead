import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { ArrowLeft, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AddLead() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '',
    website: '',
    socialHandle: '',
    contactEmail: '',
    industry: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/leads', form);
      navigate(`/leads/${res.data.lead._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  // prefill add lead form if user alread uses ai to find suggestions
  const location = useLocation();
  const idea = location.state;

useEffect(() => {
  if (idea) {
    setForm((prev) => ({
      ...prev,
      businessName: idea.ideaTitle || '',
      notes: idea.ideaNote || '',
      website: idea.ideaWebsite || '',
      contactEmail: idea.ideaEmailAddress || '',
      socialHandle: idea.ideaSocialHandle || '',  
      industry: idea.ideaIndustry || '',          
    }))
  }
}, [idea])

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link to="/leads" className="inline-flex items-center gap-1.5 text-sm text-[#e0e0e0] hover:text-gray-900 font-medium mb-4">
          <ArrowLeft size={15} /> Back to Leads
        </Link>
        <h1 className="text-2xl font-black text-[#e0e0e0]">Add New Lead</h1>
        <p className="text-[#a0a0a0] mt-1">Enter details about a potential client.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Business Details */}
          <div className="card p-6 bg-[#1e1e1e] border-gray-800">
            <h2 className="font-bold text-[#e0e0e0] mb-5 pb-4 border-b border-gray-800">Business Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  required
                  className="input-field text-[#e0e0e0] bg-[#121212] border-gray-800"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="input-field bg-[#121212] border-gray-800 text-[#e0e0e0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="e.g. E-commerce"
                    className="input-field text-[#e0e0e0] bg-[#121212] border-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="card p-6 bg-[#1e1e1e] border-gray-800">
            <h2 className="font-bold text-[#e0e0e0] mb-5 pb-4 border-b border-gray-800">Contact Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className="input-field text-[#e0e0e0] bg-[#121212] border-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#e0e0e0] mb-1.5">Social Handle</label>
                <input
                  type="text"
                  name="socialHandle"
                  value={form.socialHandle}
                  onChange={handleChange}
                  placeholder="@handle on Twitter/LinkedIn"
                  className="input-field bg-[#121212] border-gray-800 text-[#e0e0e0]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6 bg-[#121212] border-gray-800">
            <h2 className="font-bold text-[#e0e0e0] mb-5 pb-4 border-b border-gray-800">Personal Notes</h2>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any notes about this lead — their social media activity, recent posts, pain points you noticed..."
              className="input-field resize-none bg-[#121212] text-[#e0e0e0] border-gray-800"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary bg-[#522398]">
              {loading ? 'Saving...' : 'Save Lead'}
            </button>
            <Link to="/leads" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>

        {/* CSV Import */}
        <div className="space-y-4">
          <div className="card p-6 text-center bg-[#1e1e1e] border-gray-800">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto mb-4">
              <Upload size={24} />
            </div>
            <h3 className="font-bold text-[#e0e0e0] mb-2">Have a list?</h3>
            <p className="text-sm text-[#a0a0a0] mb-5 leading-relaxed">
              Import multiple leads at once using a CSV file. Perfect for bringing over data from other tools.
            </p>
            <button
              disabled
              className="btn-secondary w-full opacity-60 cursor-not-allowed text-sm"
            >
              Upload CSV (Coming Soon)
            </button>
          </div>

          <div className="card p-5 bg-[#1e1e1e] border-primary/20">
            <h4 className="font-semibold text-[#e0e0e0] text-sm mb-2">💡 Pro tip</h4>
            <p className="text-xs text-[#e0e0e0]/80 leading-relaxed">
              After adding a lead, use the AI Analysis feature to get an opportunity score and personalized pitch angle in seconds.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
