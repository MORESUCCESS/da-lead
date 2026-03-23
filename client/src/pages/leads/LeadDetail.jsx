import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import {
  ArrowLeft, Globe, AtSign, Mail, Briefcase, Zap, MessageSquare,
  Edit3, Trash2, CheckCircle, AlertCircle
} from 'lucide-react';

const statusSteps = ['not_contacted', 'contacted', 'replied', 'closed'];
const statusLabels = {
  not_contacted: 'Not Contacted',
  contacted: 'Contacted',
  replied: 'Replied',
  closed: 'Closed',
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/leads/${id}`)
      .then((res) => setLead(res.data))
      .catch(() => setError('Lead not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus) => {
    setStatusLoading(true);
    try {
      const res = await api.patch(`/leads/${lead._id}`, { status: newStatus });
      setLead(res.data);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setDeleteLoading(true);
    await api.delete(`/leads/${id}`);
    navigate('/leads');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-48" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Lead not found</p>
          <Link to="/leads" className="text-primary font-semibold hover:underline mt-2 inline-block">← Back to Leads</Link>
        </div>
      </DashboardLayout>
    );
  }

  const currentStep = statusSteps.indexOf(lead.status);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link to="/leads" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium mb-4">
          <ArrowLeft size={15} /> Back to Leads
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary font-black text-xl flex items-center justify-center">
              {lead.businessName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{lead.businessName}</h1>
              {lead.industry && <p className="text-gray-500">{lead.industry}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-5">Pipeline Status</h2>
        <div className="relative flex items-center justify-between mb-5">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
            style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
          />
          {statusSteps.map((step, i) => (
            <button
              key={step}
              onClick={() => updateStatus(step)}
              disabled={statusLoading}
              className="relative z-10 flex flex-col items-center gap-2 group"
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${i <= currentStep ? 'bg-primary border-primary' : 'bg-white border-gray-200 group-hover:border-primary/40'}`}>
                {i < currentStep ? (
                  <CheckCircle size={14} className="text-white" />
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full ${i === currentStep ? 'bg-white' : 'bg-gray-200 group-hover:bg-primary/30'}`} />
                )}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i <= currentStep ? 'text-primary' : 'text-gray-400'}`}>
                {statusLabels[step]}
              </span>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center">
          Click a step to update the status
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact Info */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Globe, label: 'Website', value: lead.website },
                { icon: AtSign, label: 'Social Handle', value: lead.socialHandle },
                { icon: Mail, label: 'Email', value: lead.contactEmail },
                { icon: Briefcase, label: 'Industry', value: lead.industry },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          {lead.problemDescription && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">AI Analysis</h2>
                {lead.opportunityScore && (
                  <span className={
                    lead.opportunityScore === 'high' ? 'badge-high' :
                    lead.opportunityScore === 'medium' ? 'badge-medium' : 'badge-low'
                  }>
                    {lead.opportunityScore} opportunity
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{lead.problemDescription}</p>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-3">Notes</h2>
              <p className="text-gray-600 leading-relaxed">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to={`/leads/${id}/analyze`}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-amber-50 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-colors"
              >
                <Zap size={16} /> Run AI Analysis
              </Link>
              <Link
                to={`/leads/${id}/message`}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-primary-50 text-primary font-semibold text-sm hover:bg-primary-100 transition-colors"
              >
                <MessageSquare size={16} /> Generate Pitch
              </Link>
            </div>
          </div>

          <div className="card p-5 bg-gray-50">
            <p className="text-xs text-gray-500 font-medium">Added</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
