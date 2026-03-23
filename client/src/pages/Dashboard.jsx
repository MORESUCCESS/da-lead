import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  not_contacted: "bg-gray-100 text-gray-600",
  contacted: "bg-blue-100 text-blue-700",
  replied: "bg-amber-100 text-amber-700",
  closed: "bg-green-100 text-green-700",
};

const statusLabels = {
  not_contacted: "Not Contacted",
  contacted: "Contacted",
  replied: "Replied",
  closed: "Closed",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/dashboard/stats"), api.get("/leads")])
      .then(([statsRes, leadsRes]) => {
        setStats(statsRes.data);
        setLeads(leadsRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);


  // Dashboard cards
  const statCards = [
    {
      label: "Total Leads",
      value: stats?.totalLeads ?? 0,
      icon: Users,
      color: "text-primary bg-primary-50",
    },
    {
      label: "Contacted",
      value: stats?.contacted ?? 0,
      icon: Mail,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Replied",
      value: stats?.replied ?? 0,
      icon: MessageSquare,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Closed Won",
      value: stats?.closed ?? 0,
      icon: CheckCircle,
      color: "text-success bg-green-50",
    },
  ];

  // get user name
  const { user } = useAuth();

  // Use idea button events
  const navigate = useNavigate();

  const handleUseIdea = async (lead) => {
    navigate('/leads/add', {
      state: {
        ideaTitle: lead.title,
        ideaNote: lead.note,
        skill,
        niche
      }
    })
};

// Lead Finder state
const [skill, setSkill] = useState(''); // Selected skill
const [niche, setNiche] = useState(''); // Selected niche
const [suggestedLeads, setSuggestedLeads] = useState([]); // Placeholder suggestions
const [loadingSuggestions, setLoadingSuggestions] = useState(false)


// suggest leads
const handleFindLeads = async () => {
  if (!skill || !niche) {
    alert("Please select both skill and niche");
    return;
  }

  try {
    setLoadingSuggestions(true);

    const res = await api.post("/lead-finder/find", { skill, niche });

    if (res.data.success) {
      setSuggestedLeads(res.data.leads);
    } else {
      alert("Failed to fetch leads: " + res.data.message);
    }
  } catch (err) {
    console.error("Error fetching suggested leads:", err);
    alert("Something went wrong while fetching leads.");
  } finally {
    setLoadingSuggestions(false);
  }
};




  return (
    <DashboardLayout>
      {/* dashboard header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Hello, {user?.name} 👋
          </h1>
          <p className="text-gray-500 mt-1 lg:text-lg text-sm">
            Here's what's happening with your outreach.
          </p>
        </div>
        <Link
          to="/leads/add"
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={16} /> <p className="lg:flex hidden">Add New Lead</p>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div
              className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}
            >
              <Icon size={20} />
            </div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" />
              ) : (
                value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Lead Finder Card */}
      <div className="card p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-2">Find Leads</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select a skill and niche to see potential lead opportunities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            required
            className="input-field w-full"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          >
            <option value="">Select Skill</option>
            <option value="web_dev">Web Developer</option>
            <option value="graphic_design">Graphic Designer</option>
            <option value="digital_marketing">Digital Marketing</option>
          </select>

          <select
            required
            className="input-field w-full"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          >
            <option value="">Select Niche</option>
            <option value="restaurants">Restaurants</option>
            <option value="instagram_vendors">Instagram Vendors</option>
            <option value="small_business">Small Businesses</option>
          </select>

          <button onClick={handleFindLeads} type="submit" disabled={loadingSuggestions} className="btn-primary w-full">
              {loadingSuggestions ? 'Finding leads...' : 'Find lead'}
            </button>
        </div>

        {/* Suggestions */}
        {suggestedLeads.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Suggestions:
            </p>
            <ul className="space-y-2">
              {suggestedLeads.map((lead, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-gray-50 rounded-xl flex items-start flex-col gap-5"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{lead.title}</p>
                    <p className="text-xs text-gray-400">{lead.note}</p>
                  </div>
                  <button
                    onClick={() => handleUseIdea(lead)}
                    className="btn-primary text-xs px-5 lg:py-2 py-1 rounded-xl"
                  >
                    Use Idea
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Recent Leads</h2>
            <Link
              to="/leads"
              className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No leads yet</p>
              <Link
                to="/leads/add"
                className="text-primary text-sm font-semibold hover:underline mt-2 inline-block"
              >
                Add your first lead →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => (
                <Link
                  key={lead._id}
                  to={`/leads/${lead._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {lead.businessName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                      {lead.businessName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {lead.website || lead.socialHandle || "No website"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lead.opportunityScore && (
                      <span
                        className={
                          lead.opportunityScore === "high"
                            ? "badge-high"
                            : lead.opportunityScore === "medium"
                              ? "badge-medium"
                              : "badge-low"
                        }
                      >
                        {lead.opportunityScore}
                      </span>
                    )}
                    <span
                      className={`badge-status text-xs ${statusColors[lead.status]}`}
                    >
                      {statusLabels[lead.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action Items */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Action Items</h2>
          <div className="space-y-3">
            <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} className="text-success" />
                <span className="text-sm font-bold text-success">
                  High Opportunity
                </span>
              </div>
              <p className="text-xs text-gray-600">
                You have{" "}
                <span className="font-bold">{stats?.highOpportunity ?? 0}</span>{" "}
                leads marked as high potential.
              </p>
              <Link
                to="/leads?status=not_contacted"
                className="text-success text-xs font-semibold hover:underline mt-1.5 inline-block"
              >
                Draft pitches →
              </Link>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={15} className="text-amber-600" />
                <span className="text-sm font-bold text-amber-700">
                  Needs Follow Up
                </span>
              </div>
              <p className="text-xs text-gray-600">
                <span className="font-bold">{stats?.needsFollowUp ?? 0}</span>{" "}
                leads waiting for a reply.
              </p>
              <Link
                to="/leads?status=contacted"
                className="text-amber-600 text-xs font-semibold hover:underline mt-1.5 inline-block"
              >
                Follow up now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
