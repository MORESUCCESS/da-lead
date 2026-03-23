import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { Plus, Search, Filter, ExternalLink, MessageSquare, TrendingUp, Users } from 'lucide-react';

const statusColors = {
  not_contacted: 'bg-gray-100 text-gray-600',
  contacted: 'bg-blue-100 text-blue-700',
  replied: 'bg-amber-100 text-amber-700',
  closed: 'bg-green-100 text-green-700',
};

const statusLabels = {
  not_contacted: 'Not Contacted',
  contacted: 'Contacted',
  replied: 'Replied',
  closed: 'Closed',
};

export default function LeadList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/leads', { params })
      .then((res) => setLeads(res.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = leads.filter((l) =>
    l.businessName.toLowerCase().includes(search.toLowerCase()) ||
    (l.website || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Leads Pipeline</h1>
          <p className="text-gray-500 mt-1">Manage and track your outreach opportunities.</p>
        </div>
        <Link to="/leads/add" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> <span className='lg:flex hidden'>Add Lead</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business or website..."
            className="input-field pl-10 !py-2.5"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setSearchParams(e.target.value ? { status: e.target.value } : {})}
            className="input-field !py-2.5 !w-auto min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="not_contacted">Not Contacted</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No leads found</p>
            <p className="text-sm text-gray-400 mt-1">We couldn't find any leads matching your current filters.</p>
            <Link to="/leads/add" className="text-primary text-sm font-semibold hover:underline mt-3 inline-block">
              Add a new lead
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Business</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Website</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Social</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                          {lead.businessName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{lead.businessName}</p>
                          {lead.industry && <p className="text-xs text-gray-400 truncate">{lead.industry}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {lead.website ? (
                        <a href={`https://${lead.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 max-w-[160px] truncate">
                          {lead.website.replace(/^https?:\/\//, '')}
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-500">{lead.socialHandle || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.opportunityScore ? (
                        <span className={
                          lead.opportunityScore === 'high' ? 'badge-high' :
                          lead.opportunityScore === 'medium' ? 'badge-medium' : 'badge-low'
                        }>
                          {lead.opportunityScore === 'high' ? '●' : lead.opportunityScore === 'medium' ? '●' : '●'} {lead.opportunityScore}
                        </span>
                      ) : (
                        <button
                          onClick={() => window.location.href = `/leads/${lead.id}/analyze`}
                          className="text-xs text-gray-400 hover:text-primary font-medium flex items-center gap-1"
                        >
                          <TrendingUp size={12} /> Analyze
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge-status ${statusColors[lead.status]}`}>
                        {statusLabels[lead.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/leads/${lead._id}`}
                          className="text-xs font-semibold text-gray-600 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          to={`/leads/${lead._id}/message`}
                          className="text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1"
                        >
                          <MessageSquare size={12} /> Pitch
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
