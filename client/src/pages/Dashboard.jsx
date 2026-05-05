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
  const [dailyLeads, setDailyLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [profileIncomplete, SetProfileIncomplete] = useState(false);
  const [leadError, setLeadError] = useState("");

  useEffect(() => {
    // Load stats and leads immediately
    Promise.all([api.get("/dashboard/stats"), api.get("/leads")])
      .then(([statsRes, leadsRes]) => {
        setStats(statsRes.data);
        setLeads(leadsRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));

    // Load daily leads separately
    api
      .get("/lead-finder/daily")
      .then((dailyRes) => {
        if (dailyRes.data.incomplete) {
          SetProfileIncomplete(true);
        } else if (dailyRes.data.generating) {
          // Leads are being generated in background — poll every 10 seconds
          setLeadError("Generating your leads... this may take a moment.");
          const interval = setInterval(async () => {
            try {
              const pollRes = await api.get("/lead-finder/daily");
              if (pollRes.data.success && pollRes.data.leads?.length > 0) {
                setDailyLeads(pollRes.data.leads);
                setLeadError("");
                clearInterval(interval);
              }
            } catch {
              clearInterval(interval);
            }
          }, 10000); // poll every 10 seconds

          // Stop polling after 2 minutes
          setTimeout(() => clearInterval(interval), 120000);
        } else if (dailyRes.data.success && dailyRes.data.leads?.length > 0) {
          setDailyLeads(dailyRes.data.leads);
        } else {
          setLeadError(dailyRes.data.message || "Could not load leads.");
        }
      })
      .finally(() => setLeadsLoading(false));
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

  // Lead Finder state
  // const [skill, setSkill] = useState(""); // Selected skill
  // const [niche, setNiche] = useState(""); // Selected niche
  // const [suggestedLeads, setSuggestedLeads] = useState([]); // Placeholder suggestions
  // const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // suggest leads
  // const handleFindLeads = async () => {
  //   if (!skill || !niche) {
  //     alert("Please select both skill and niche");
  //     return;
  //   }

  //   try {
  //     setLoadingSuggestions(true);

  //     const res = await api.post("/lead-finder/find", { skill, niche });

  //     if (res.data.success) {
  //       setSuggestedLeads(res.data.leads);
  //     } else {
  //       alert("Failed to fetch leads: " + res.data.message);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching suggested leads:", err);
  //     alert("Something went wrong while fetching leads.");
  //   } finally {
  //     setLoadingSuggestions(false);
  //   }
  // };

  return (
    <DashboardLayout>
      {/* dashboard header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#E0E0E0]">
            Hello, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[#A0A0A0] mt-1 lg:text-lg text-s">
            Here's what's happening with your outreach.
          </p>
        </div>
        <Link
          to="/leads/add"
          className="btn-primary bg-[#522398] text-sm flex items-center gap-2"
        >
          <Plus size={16} /> <p className="lg:flex hidden ">Add New Lead</p>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="card p-5 bg-[#1E1E1E] cursor-pointer border-gray-800"
          >
            <div
              className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}
            >
              <Icon size={20} />
            </div>
            <p className="text-sm text-[#E0E0E0] font-medium">{label}</p>
            <p className="text-3xl font-black text-[#E0E0E0] mt-0.5">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-[#121212] rounded animate-pulse" />
              ) : (
                value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Daily Leads cards */}
      <div className="card p-6 mb-8 bg-[#1E1E1E] border-gray-800">
        <h2 className="font-bold text-[#e0e0e0] mb-1">Today's Leads</h2>
        <p className="text-sm text-[#A0A0A0] mb-4">
          Fresh leads generated daily based on your profile.
        </p>

        {profileIncomplete ? (
          <div className="text-center py-8">
            <p className="text-[#e0e0e0] text-sm mb-6">
              Complete your profile to get daily leads.
            </p>
            <Link to="/settings" className="btn-primary bg-[#522398] text-sm">
              Update Profile →
            </Link>
          </div>
        ) : leadError ? (
          <div className="text-center py-8">
            <p className="text-[#A0A0A0] text-sm mb-3">{leadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary bg-[#522398] text-sm"
            >
              Try Again
            </button>
          </div>
        ) : leadsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-[#121212] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {dailyLeads.map((lead, idx) => (
              <li
                key={idx}
                className="p-3 bg-[#121212] rounded-xl flex items-start flex-col gap-3"
              >
                <div className="w-full p-3">
                  {/* <h1 className="text-[#e0e0e0] py-2 px-5 bg-[#1e1e1e] w-fit rounded-full font-bold">Lead {idx + 1}</h1> */}
                  <div className="space-y-2">
                    <p className="text-[#CBC3E3] text-sm bg-[#1e1e1e] w-fit py-2 px-5 rounded-lg">
                      Business name
                    </p>
                    <p className="font-semibold text-[#e0e0e0] text-sm mb-2">
                      {lead.title}
                    </p>
                    {lead.address ? (
                      <p className="text-[#CBC3E3] text-sm bg-[#1e1e1e] w-fit py-2 px-5 rounded-lg">
                        Address
                      </p>
                    ) : (
                      <p></p>
                    )}
                    <p className="text-sm text-[#e0e0e0] mb-3">
                      {lead.address}
                    </p>
                    {lead.website ? (
                      <p className="text-[#CBC3E3] text-sm bg-[#1e1e1e] w-fit py-2 px-5 rounded-lg">
                        Webiste
                      </p>
                    ) : (
                      <p></p>
                    )}
                    <a
                      className="text-sm text-[#e0e0e0] underline cursor-pointer mb-3"
                      href={lead.website}
                      target="_blank"
                    >
                      {lead.website}
                    </a>
                    {lead.email ? (
                      <p className="text-[#CBC3E3] text-sm">Email</p>
                    ) : (
                      <p></p>
                    )}
                    <p className="text-sm text-[#e0e0e0] mb-3">{lead.email}</p>
                    {lead.socialHandle ? (
                      <p className="text-[#CBC3E3] text-sm bg-[#1e1e1e] w-fit py-2 px-5 rounded-lg">
                        Social Handle
                      </p>
                    ) : (
                      <p></p>
                    )}
                    <p className="text-sm text-[#e0e0e0] mb-3">
                      {lead.socialHandle}
                    </p>
                    {lead.industry ? (
                      <p className="text-[#CBC3E3] text-sm bg-[#1e1e1e] w-fit py-2 px-5 rounded-lg">
                        Industry
                      </p>
                    ) : (
                      <p></p>
                    )}
                    <p className="text-sm text-[#e0e0e0] mb-3">
                      {lead.industry}
                    </p>
                    {lead.note ? (
                      <p className="text-[#CBC3E3] text-sm bg-[#1e1e1e] w-fit py-2 px-5 rounded-lg">
                        Why they need you
                      </p>
                    ) : (
                      <p></p>
                    )}
                    <p className="lg:text-sm text-[#e0e0e0]">{lead.note}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate("/leads/add", {
                      state: {
                        ideaTitle: lead.title,
                        ideaNote: lead.note,
                        ideaWebsite: lead.website,
                        ideaEmailAddress: lead.email,
                        ideaSocialHandle: lead.socialHandle,
                        ideaIndustry: lead.industry,
                      },
                    })
                  }
                  className="btn-primary text-sm  bg-[#522398] px-5 py-2 rounded-xl lg:w-fit w-full flex gap-3 items-center justify-center"
                >
                  Add lead <ArrowRight size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 card p-6 bg-[#1E1E1E] border-gray-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#E0E0E0]">Recent Leads</h2>
            <Link
              to="/leads"
              className="text-sm text-[#A0A0A0] font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-[#121212] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Users size={40} className="text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No leads yet</p>
              <Link
                to="/leads/add"
                className="text-[#E0E0E0] text-sm font-semibold hover:underline mt-2 inline-block"
              >
                Add your first lead →
              </Link>
            </div>
          ) : (
            <div className="space-y-2 bg-[#121212] rounded-xl border-gray-800">
              {leads.map((lead) => (
                <Link
                  key={lead._id}
                  to={`/leads/${lead._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1e1e1e] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {lead.businessName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#e0e0e0] truncate group-hover:text-[#A0A0A0] transition-colors">
                      {lead.businessName}
                    </p>
                    <p className="text-xs text-[#A0A0A0] truncate">
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
                              : lead.opportunityScore === "low"
                                ? "badge-low"
                                : "Analyze"
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
        <div className="card p-6 bg-[#1e1e1e]  border-gray-800">
          <h2 className="font-bold text-[#e0e0e0] mb-4">Action Items</h2>
          <div className="space-y-3">
            <div className="p-4 bg-[#522386]/5 border border-[#522386]/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} className="text-[#522386]" />
                <span className="text-sm font-bold text-[#522386]">
                  High Opportunity
                </span>
              </div>
              <p className="text-xs text-[#e0e0e0]">
                You have{" "}
                <span className="font-bold">{stats?.highOpportunity ?? 0}</span>{" "}
                leads marked as high potential.
              </p>
              <Link
                to="/leads?status=not_contacted"
                className="text-[#522386] text-xs font-semibold hover:underline mt-1.5 inline-block"
              >
                Draft pitches →
              </Link>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={15} className="text-[#522386]" />
                <span className="text-sm font-bold text-[#522386]">
                  Needs Follow Up
                </span>
              </div>
              <p className="text-xs text-gray-600">
                <span className="font-bold">{stats?.needsFollowUp ?? 0}</span>{" "}
                leads waiting for a reply.
              </p>
              <Link
                to="/leads?status=contacted"
                className="text-[#522386] text-xs font-semibold hover:underline mt-1.5 inline-block"
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
