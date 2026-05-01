import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { ArrowLeft, Zap, Save, Send, Copy, CheckCircle, Edit3 } from 'lucide-react';

const messageTypes = [
  { value: 'pitch', label: 'Cold Pitch', desc: 'First outreach message' },
  { value: 'follow_up', label: 'Follow Up', desc: 'For leads that haven\'t replied' },
  { value: 'closing', label: 'Closing / Next Steps', desc: 'Move toward a decision' },
];

export default function LeadMessage() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [messageType, setMessageType] = useState('pitch');
  const [customContext, setCustomContext] = useState('');
  const [generated, setGenerated] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/leads/${id}`).then((res) => setLead(res.data));
  }, [id]);

  const generate = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await api.post(`/leads/${id}/generate-message`, { messageType, customContext });
      setGenerated(res.data);
      setEditedContent(res.data.content);
      setEditedSubject(res.data.subject);
    } finally {
      setLoading(false);
    }
  };

  const save = async (isDraft) => {
    setSaving(true);
    try {
      await api.post(`/leads/${id}/messages`, {
        messageType,
        subject: editedSubject,
        content: editedContent,
        isDraft,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link to={`/leads/${id}`} className="inline-flex items-center gap-1.5 text-sm text-[#e0e0e0] hover:text-gray-400 font-medium mb-4">
          <ArrowLeft size={15} /> Back to {lead?.businessName || 'Lead'}
        </Link>
        <h1 className="text-2xl font-black text-[#e0e0e0]">AI Message Generator</h1>
        <p className="text-[#a0a0a0] mt-1">
          Generate a personalized outreach message for {lead?.businessName || 'this lead'}.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          <CheckCircle size={16} /> Message saved successfully!
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 bg-[#1e1e1e] border-gray-800">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8c63d2] to-[#8c63d2] flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-[#e0e0e0]">AI Writer</h2>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-[#a0a0a0] mb-3">Message Type</p>
              <div className="space-y-2">
                {messageTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setMessageType(t.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150
                      ${messageType === t.value
                        ? 'border-primary bg-gray-300 text-[#121212]'
                        : 'border-gray-800 bg-[#121212] text-[#e0e0e0] hover:border-gray-600'
                      }`}
                  >
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-xs opacity-60 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#e0e0e0] mb-2">
                Additional Context <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                rows={3}
                placeholder="E.g., mention we share a connection, or focus on their recent product launch..."
                className="input-field resize-none text-sm bg-[#1e1e1e] border-gray-800 text-[#e0e0e0]"
              />
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary bg-[#522398] w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={16} /> Generate Draft
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="lg:col-span-3">
          <div className="card p-6 h-full flex flex-col bg-[#1e1e1e] border-gray-800">
            {!generated ? (
              <div className="flex-1 flex items-center justify-center text-center py-16">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Edit3 size={24} className="text-gray-400" />
                  </div>
                  <p className="text-[#e0e0e0] font-medium">Your message will appear here</p>
                  <p className="text-sm text-[#a0a0a0] mt-1">Click "Generate Draft" to get started</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#e0e0e0] uppercase tracking-wide mb-1.5">Subject Line</label>
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="input-field font-semibold bg-[#121212] border-gray-800 text-[#e0e0e0]"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-semibold text-[#e0e0e0] uppercase tracking-wide mb-1.5">Message Body</label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="input-field resize-none flex-1 min-h-[280px] font-mono text-sm leading-relaxed bg-[#121212] border-gray-800 text-[#e0e0e0]"
                  />
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800 flex-wrap">
                  <button onClick={copy} className="btn-secondary text-sm !py-2.5 !px-4 flex items-center gap-1.5">
                    {copied ? <CheckCircle size={15} className="text-success" /> : <Copy size={15} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={() => save(true)} disabled={saving} className="btn-secondary text-sm !py-2.5 !px-4 flex items-center gap-1.5">
                    <Save size={15} /> Save Draft
                  </button>
                  <button onClick={() => save(false)} disabled={saving} className="btn-primary bg-[#522398] text-sm !py-2.5 !px-4 flex items-center gap-1.5">
                    <Send size={15} /> Mark as Sent
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
