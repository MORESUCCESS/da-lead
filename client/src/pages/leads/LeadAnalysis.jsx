import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { ArrowLeft, Zap, CheckCircle, Edit3, TrendingUp, AlertTriangle, TrendingDown } from 'lucide-react';

const scoreConfig = {
  high: { label: 'High Opportunity', icon: TrendingUp, className: 'bg-green-50 border-green-200 text-green-700', badgeClass: 'badge-high' },
  medium: { label: 'Medium Opportunity', icon: TrendingUp, className: 'bg-amber-50 border-amber-200 text-amber-700', badgeClass: 'badge-medium' },
  low: { label: 'Low Opportunity', icon: TrendingDown, className: 'bg-red-50 border-red-200 text-red-700', badgeClass: 'badge-low' },
};

export default function LeadAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedProblem, setEditedProblem] = useState('');

  useEffect(() => {
    api.get(`/leads/${id}`).then((res) => setLead(res.data));
  }, [id]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/leads/${id}/analyze`);
      setAnalysis({
        problemDescription: res.data.message.problem,
        reasoning: res.data.message.opportunity,
        opportunityScore: res.data.message.score.toLowerCase(),
      });
      setEditedProblem(res.data.message.problem);
    } finally {
      setLoading(false);
    }
  };

  const acceptAnalysis = async () => {
    await api.patch(`/leads/${id}`, {
      problemDescription: editedProblem || analysis?.problemDescription,
      opportunityScore: analysis?.opportunityScore,
      analysisAccepted: true,
    });
    navigate(`/leads/${id}`);
  };

  const score = analysis?.opportunityScore;
  const cfg = score ? scoreConfig[score] : null;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link to={`/leads/${id}`} className="inline-flex items-center gap-1.5 text-sm text-[#e0e0e0] hover:text-[$a0a0a0] font-medium mb-4">
          <ArrowLeft size={15} /> Back to {lead?.businessName || 'Lead'}
        </Link>
          <h1 className="text-2xl font-black text-[#e0e0e0]">AI Opportunity Analysis</h1>
        <p className="text-[#a0a0a0] mt-1">
          {lead?.businessName ? `Analyzing ${lead.businessName}` : 'Analyzing lead...'}
        </p>
      </div>

      <div className="max-w-2xl">
        {!analysis ? (
          <div className="card p-10 text-center bg-[#1e1e1e] border-gray-800">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Zap size={36} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-[#e0e0e0] mb-2">AI Opportunity Analysis</h2>
            <p className="text-[#a0a0a0] mb-8 leading-relaxed">
              Our AI will analyze {lead?.businessName || 'this lead'} and generate a problem description, opportunity score, and outreach angle.
            </p>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="btn-primary mx-auto"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={16} /> Start Analysis
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Score Card */}
            {cfg && (
              <div className={`bg-[#1e1e1e] card p-5 border ${cfg.className}`}>
                <div className="flex items-center gap-3">
                  <cfg.icon size={22} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Opportunity Score</p>
                    <p className="font-black text-lg">{cfg.label}</p>
                  </div>
                  <span className={`ml-auto ${cfg.badgeClass}`}>{score}</span>
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div className="card p-6 bg-[#1e1e1e] border-gray-800">
              <p className="text-xs font-semibold text-[#e0e0e0] uppercase tracking-wide mb-1">AI Reasoning</p>
              <p className="text-[#a0a0a0] leading-relaxed">{analysis.reasoning}</p>
            </div>

            {/* Problem Description */}
            <div className="card p-6 bg-[#1e1e1e] border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#e0e0e0] uppercase tracking-wide">Problem Description</p>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-xs text-primary-100 font-semibold hover:underline flex items-center gap-1"
                >
                  <Edit3 size={12} /> {editing ? 'Done' : 'Edit'}
                </button>
              </div>
              {editing ? (
                <textarea
                  value={editedProblem}
                  onChange={(e) => setEditedProblem(e.target.value)}
                  rows={5}
                  className="input-field resize-none"
                />
              ) : (
                <p className="text-[#a0a0a0] leading-relaxed">{editedProblem || analysis.problemDescription}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 lg:flex-row flex-col">
              <button onClick={acceptAnalysis} className="btn-primary flex items-center gap-2">
                <CheckCircle size={16} /> Accept & Save
              </button>
              <button onClick={runAnalysis} disabled={loading} className="btn-secondary flex items-center gap-2">
                <Zap size={16} /> Re-analyze
              </button>
              <Link to={`/leads/${id}/message`} className="btn-accent flex items-center gap-2">
                Generate Pitch →
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
