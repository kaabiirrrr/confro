import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import {
    fetchUserSessions, fetchRecentErrors, fetchErrorHeatmap,
    fetchUserJourney, fetchStaleUsers, fetchDropoffPoints,
    fetchUserInspector
} from '../../services/adminService';
import api from '../../lib/api';
import InfinityLoader from '../../components/common/InfinityLoader';

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (ts) => {
    if (!ts) return 'N/A';
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const statusColor = (code) => {
    if (!code) return 'text-slate-400 dark:text-white/40';
    if (code >= 500) return 'text-red-500 dark:text-red-400';
    if (code >= 400) return 'text-orange-500 dark:text-orange-400';
    return 'text-emerald-600 dark:text-emerald-400';
};

const roleBadge = (role) => {
    if (role === 'FREELANCER') return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300';
    if (role === 'CLIENT') return 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300';
    return 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50';
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Panel = ({ children, className = '' }) => (
    <div className={`bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ title, subtitle, badge }) => (
    <div className="flex items-start justify-between mb-4">
        <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">{title}</h3>
            {subtitle && <p className="text-slate-400 dark:text-white/25 text-[10px] mt-0.5">{subtitle}</p>}
        </div>
        {badge !== undefined && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60">{badge}</span>
        )}
    </div>
);

const Empty = ({ text = 'No data yet' }) => (
    <p className="text-slate-400 dark:text-white/20 text-sm text-center py-8">{text}</p>
);

const Avatar = ({ name, src, large = false }) => (
    <div className={`${large ? 'w-10 h-10' : 'w-8 h-8'} rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white/60 text-xs font-bold shrink-0 overflow-hidden`}>
        {src ? <img src={src} alt={String(name || '')} className="w-full h-full object-cover" /> : (String(name || '?')[0] || '?').toUpperCase()}
    </div>
);

// ── 1. User Session Tracker ───────────────────────────────────────────────────
const SessionTracker = ({ data, onSelectUser }) => (
    <Panel>
        <SectionTitle title="User Session Tracker" subtitle="Last active · current page · session count" badge={data.length} />
        <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {data.length === 0 ? <Empty text="No active sessions in the last 24h" /> : data.map(u => (
                <button
                    key={u.user_id}
                    onClick={() => onSelectUser(u.user_id, u.name)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left group"
                >
                    <Avatar name={u.name} src={u.avatar} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-700 dark:text-white/80 text-xs font-semibold truncate">{u.name || 'Unknown'}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${roleBadge(u.role)}`}>{u.role}</span>
                        </div>
                        <p className="text-slate-400 dark:text-white/30 text-[10px] truncate">{u.current_page || '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-slate-500 dark:text-white/50 text-[10px] font-bold">{timeAgo(u.last_active)}</p>
                        <p className="text-slate-400 dark:text-white/25 text-[9px]">{u.session_count} visits</p>
                    </div>
                    <span className="text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/50 transition-colors text-xs shrink-0">›</span>
                </button>
            ))}
        </div>
    </Panel>
);

// ── 2. Feature Error Log ──────────────────────────────────────────────────────
const FeatureErrorLog = ({ data }) => (
    <Panel>
        <SectionTitle title="Feature Error Log" subtitle="Live feed — what broke for who" badge={data.length} />
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {data.length === 0 ? <Empty text="No errors logged recently" /> : data.map(e => (
                <div key={e.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                    <span className={`text-[10px] font-black shrink-0 mt-0.5 ${statusColor(e.status_code)}`}>{e.status_code || '?'}</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-700 dark:text-white/70 text-[11px] font-semibold">{e.user_email || 'Anonymous'}</span>
                            <span className="text-orange-500 dark:text-orange-400/80 text-[10px] font-bold">{e.feature}</span>
                        </div>
                        <p className="text-slate-400 dark:text-white/35 text-[10px] truncate">{e.error_message}</p>
                    </div>
                    <span className="text-slate-400 dark:text-white/20 text-[9px] shrink-0">{timeAgo(e.created_at)}</span>
                </div>
            ))}
        </div>
    </Panel>
);

// ── 3. User Journey Map ───────────────────────────────────────────────────────
const UserJourneyMap = ({ userId, userName, data, loading, onClose }) => {
    if (!userId) return (
        <Panel>
            <SectionTitle title="User Journey Map" subtitle="Click any user in Session Tracker to replay their path" />
            <Empty text="Select a user from Session Tracker above" />
        </Panel>
    );

    if (loading) return (
        <Panel>
            <SectionTitle title={`Journey: ${userName}`} />
            <div className="flex items-center justify-center h-32">
                <InfinityLoader fullScreen={false} size="sm" text="Loading journey..." />
            </div>
        </Panel>
    );

    const { profile, journey, errors } = data || {};

    return (
        <Panel>
            <div className="flex items-center justify-between mb-4">
                <SectionTitle title={`Journey: ${userName || 'User'}`} subtitle={`${journey?.length || 0} steps · ${errors?.length || 0} errors`} />
                <button onClick={onClose} className="text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/60 text-xs transition-colors">✕</button>
            </div>
            {profile && (
                <div className="flex items-center gap-2 mb-3 p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <Avatar name={profile.name} src={profile.avatar_url} />
                    <div className="flex-1 min-w-0">
                        <p className="text-slate-800 dark:text-white/80 text-xs font-semibold">{profile.name}</p>
                        <p className="text-slate-400 dark:text-white/30 text-[10px]">{profile.role} · {profile.email}</p>
                    </div>
                    {profile.is_banned && <span className="text-[9px] bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">BANNED</span>}
                    {profile.is_restricted && !profile.is_banned && <span className="text-[9px] bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold">RESTRICTED</span>}
                </div>
            )}
            <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {(journey || []).length === 0 ? <Empty text="No journey data recorded" /> : journey.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] py-0.5">
                        <span className="text-slate-400 dark:text-white/20 w-5 text-right shrink-0 font-mono">{i + 1}</span>
                        <span className="text-slate-300 dark:text-white/15">›</span>
                        <span className="text-slate-600 dark:text-white/60 truncate flex-1">{step.page_path || step.feature_name || 'Unknown'}</span>
                        <span className="text-slate-400 dark:text-white/20 shrink-0">{timeAgo(step.created_at)}</span>
                    </div>
                ))}
            </div>
            {(errors || []).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    <p className="text-red-400/60 text-[10px] font-bold mb-1.5">Errors in this session:</p>
                    {errors.slice(0, 3).map((e, i) => (
                        <div key={i} className="text-[10px] text-red-400/50 truncate">{e.feature}: {e.error_message}</div>
                    ))}
                </div>
            )}
        </Panel>
    );
};

// ── 4. Broken Feature Heatmap ─────────────────────────────────────────────────
const ErrorHeatmap = ({ data }) => {
    const max = data[0]?.count || 1;
    return (
        <Panel>
            <SectionTitle title="Broken Feature Heatmap" subtitle="Most errors this week — fix priority" />
            <div className="space-y-3">
                {data.length === 0 ? <Empty text="No errors this week" /> : data.map((f, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 dark:text-white/65 font-medium">{f.feature}</span>
                            <span className="text-orange-500 dark:text-orange-400 font-black">{f.count} errors</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
                                style={{ width: `${Math.round((f.count / max) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    );
};

// ── 5. User Problem Reports Timeline ─────────────────────────────────────────
const ProblemsTimeline = ({ data, onResolve }) => {
    const openCount = data.filter(p => p.status === 'open' || p.status === 'pending').length;
    return (
        <Panel>
            <SectionTitle title="Problem Reports Timeline" subtitle="Support tickets with status" badge={`${openCount} open`} />
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {data.length === 0 ? <Empty text="No problem reports" /> : data.map(p => {
                    const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || 'User';
                    const isOpen = p.status === 'open' || p.status === 'pending';
                    return (
                        <div key={p.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isOpen ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-slate-700 dark:text-white/75 text-[11px] font-semibold">{name}</span>
                                    <span className="text-slate-400 dark:text-white/30 text-[10px]">{p.email}</span>
                                </div>
                                <p className="text-slate-500 dark:text-white/40 text-[10px] line-clamp-2 mt-0.5">{p.problem_description || p.description || p.message}</p>
                                <p className="text-slate-400 dark:text-white/20 text-[9px] mt-0.5">{timeAgo(p.created_at)}</p>
                            </div>
                            {isOpen && (
                                <button
                                    onClick={() => onResolve(p.id)}
                                    className="shrink-0 text-[9px] font-black px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition-colors border border-emerald-200 dark:border-emerald-500/20"
                                >
                                    Resolve
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
};

// ── 6. Failed API Calls Monitor ───────────────────────────────────────────────
const FailedAPIMonitor = ({ data }) => (
    <Panel>
        <SectionTitle title="Failed API Calls Monitor" subtitle="Last 20 backend errors in real-time" />
        <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {data.length === 0 ? <Empty text="No recent API failures" /> : data.map(e => (
                <div key={e.id} className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 text-[10px]">
                    <span className={`font-black w-8 shrink-0 ${statusColor(e.status_code)}`}>{e.status_code}</span>
                    <span className="text-slate-500 dark:text-white/45 truncate flex-1 font-mono">{e.endpoint}</span>
                    <span className="text-slate-400 dark:text-white/30 shrink-0">{e.user_email?.split('@')[0] || '—'}</span>
                    <span className="text-slate-400 dark:text-white/20 shrink-0">{timeAgo(e.created_at)}</span>
                </div>
            ))}
        </div>
    </Panel>
);

// ── 7. User Behavior Heatmap by Role ─────────────────────────────────────────
const RoleBehaviorHeatmap = ({ sessions }) => {
    const freelancerPages = {};
    const clientPages = {};

    sessions.forEach(u => {
        const map = u.role === 'FREELANCER' ? freelancerPages : clientPages;
        (u.pages_visited || []).forEach(p => {
            const label = p.split('/').filter(Boolean).slice(0, 2).join('/') || 'home';
            map[label] = (map[label] || 0) + 1;
        });
    });

    const topFreelancer = Object.entries(freelancerPages).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const topClient = Object.entries(clientPages).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const hasData = topFreelancer.length > 0 || topClient.length > 0;

    return (
        <Panel>
            <SectionTitle title="Behavior Heatmap by Role" subtitle="Freelancers vs Clients — which features each role uses most" />
            {!hasData ? <Empty text="No session data to analyze" /> : (
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-blue-500 dark:text-blue-400/70 text-[10px] font-black uppercase tracking-widest mb-2">Freelancers</p>
                        {topFreelancer.length === 0 ? <p className="text-slate-400 dark:text-white/20 text-xs">No data</p> : topFreelancer.map(([page, count], i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                                <span className="text-slate-600 dark:text-white/55 truncate">{page}</span>
                                <span className="text-blue-500 dark:text-blue-400 font-bold shrink-0 ml-2">{count}</span>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-purple-500 dark:text-purple-400/70 text-[10px] font-black uppercase tracking-widest mb-2">Clients</p>
                        {topClient.length === 0 ? <p className="text-slate-400 dark:text-white/20 text-xs">No data</p> : topClient.map(([page, count], i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                                <span className="text-slate-600 dark:text-white/55 truncate">{page}</span>
                                <span className="text-purple-500 dark:text-purple-400 font-bold shrink-0 ml-2">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Panel>
    );
};

// ── 8. Stale User Alert ───────────────────────────────────────────────────────
const StaleUserAlert = ({ data, onNudge, nudging }) => (
    <Panel>
        <SectionTitle title="Stale User Alert" subtitle="Registered but never completed profile / posted / applied" badge={data.length} />
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {data.length === 0 ? <Empty text="No stale users — everyone is active" /> : data.map(u => (
                <div key={u.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-yellow-200 dark:border-yellow-500/10 bg-yellow-50 dark:bg-yellow-500/[0.03]">
                    <Avatar name={u.name} src={u.avatar_url} />
                    <div className="flex-1 min-w-0">
                        <p className="text-slate-700 dark:text-white/75 text-xs font-semibold truncate">{u.name || u.email}</p>
                        <p className="text-slate-500 dark:text-white/30 text-[10px]">{u.role} · {u.days_since_registration}d since signup</p>
                    </div>
                    <button
                        onClick={() => onNudge(u.user_id, u.name)}
                        disabled={nudging === u.user_id}
                        className="shrink-0 text-[9px] font-black px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-500/25 transition-colors border border-yellow-300 dark:border-yellow-500/20 disabled:opacity-40"
                    >
                        {nudging === u.user_id ? '...' : 'Nudge'}
                    </button>
                </div>
            ))}
        </div>
    </Panel>
);

// ── 9. Drop-off Points ────────────────────────────────────────────────────────
const DropoffPoints = ({ data }) => (
    <Panel>
        <SectionTitle title="Drop-off Points" subtitle="Where users abandon flows — started vs completed" />
        <div className="space-y-5">
            {data.length === 0 ? <Empty text="No drop-off data available" /> : data.map((d, i) => {
                const dropRate = d.started > 0 ? Math.round(((d.started - d.completed) / d.started) * 100) : 0;
                const completePct = d.started > 0 ? Math.round((d.completed / d.started) * 100) : 0;
                return (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-700 dark:text-white/70 font-semibold">{d.flow}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-slate-400 dark:text-white/35">{d.started} started</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{d.completed} completed</span>
                                <span className={`font-black ${dropRate > 50 ? 'text-red-500 dark:text-red-400' : dropRate > 25 ? 'text-orange-500 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {dropRate}% drop-off
                                </span>
                            </div>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${completePct}%` }} />
                            <div className="h-full bg-red-400/40 transition-all duration-700" style={{ width: `${dropRate}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    </Panel>
);

// ── 10. Per-User Activity Inspector ──────────────────────────────────────────
const UserInspector = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetchUserInspector(query.trim());
            setResult(res?.data ?? null);
        } catch (err) {
            console.error('[UserInspector] Search failed:', err);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const u = result;

    return (
        <Panel>
            <SectionTitle title="Per-User Activity Inspector" subtitle="Search any user by name or email — full profile, errors, contracts, risk score" />
            <form onSubmit={handleSearch} className="flex gap-2 mb-5">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/25 focus:outline-none focus:border-accent transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-white/15 hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-40"
                >
                    {loading ? 'Searching...' : 'Inspect'}
                </button>
            </form>

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <InfinityLoader fullScreen={false} size="sm" text="Fetching user data..." />
                </div>
            )}

            {!loading && searched && !u && (
                <p className="text-slate-400 dark:text-white/30 text-sm text-center py-6">No user found for "{query}"</p>
            )}

            {!loading && u && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Profile */}
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-bold text-base shrink-0 overflow-hidden border border-slate-200 dark:border-white/10">
                                {u.profile?.avatar
                                    ? <img src={u.profile.avatar} alt={u.profile.name || ''} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                                    : <span>{(String(u.profile?.name || '?')[0] || '?').toUpperCase()}</span>
                                }
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-800 dark:text-white font-bold text-sm truncate">{u.profile?.name || 'Unknown'}</p>
                                <p className="text-slate-400 dark:text-white/40 text-[10px] truncate">{u.profile?.email || '—'}</p>
                                {u.profile?.title && <p className="text-slate-400 dark:text-white/25 text-[10px] truncate">{u.profile.title}</p>}
                            </div>
                        </div>
                        <div className="space-y-2 text-[11px] pt-2 border-t border-slate-100 dark:border-white/5">
                            {[
                                { label: 'Role', value: u.profile?.role || 'Unknown', cls: u.profile?.role === 'FREELANCER' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300' : u.profile?.role === 'CLIENT' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300' : u.profile?.role === 'SUPER_ADMIN' || u.profile?.role === 'ADMIN' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50', badge: true },
                                { label: 'Last login', value: timeAgo(u.profile?.last_sign_in || u.profile?.updated_at) },
                                { label: 'Member since', value: u.profile?.created_at ? new Date(u.profile.created_at).toLocaleDateString() : '—' },
                                { label: 'Contracts', value: u.contracts?.length || 0 },
                                { label: 'Errors', value: u.errors?.length || 0, errCls: (u.errors?.length || 0) > 5 ? 'text-red-500 dark:text-red-400' : '' },
                                { label: 'Verified', value: u.profile?.is_verified ? 'Yes' : 'No', valCls: u.profile?.is_verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-white/30' },
                                { label: 'Status', value: u.profile?.is_banned ? 'Banned' : u.profile?.is_restricted ? 'Restricted' : 'Active', valCls: u.profile?.is_banned ? 'text-red-500 dark:text-red-400' : u.profile?.is_restricted ? 'text-orange-500 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400' },
                                { label: 'Risk Score', value: `${u.riskScore}/100`, valCls: u.riskScore > 70 ? 'text-red-500 dark:text-red-400 font-black' : u.riskScore > 40 ? 'text-orange-500 dark:text-orange-400 font-black' : 'text-emerald-600 dark:text-emerald-400 font-black' },
                            ].map(({ label, value, cls, badge: isBadge, errCls, valCls }) => (
                                <div key={label} className="flex justify-between items-center">
                                    <span className="text-slate-400 dark:text-white/35">{label}</span>
                                    {isBadge
                                        ? <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${cls}`}>{value}</span>
                                        : <span className={`font-bold ${errCls || valCls || 'text-slate-700 dark:text-white/75'}`}>{value}</span>
                                    }
                                </div>
                            ))}
                            {u.profile?.profile_completion_percentage > 0 && (
                                <div className="pt-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-slate-400 dark:text-white/35">Profile complete</span>
                                        <span className="text-slate-600 dark:text-white/60 font-bold">{u.profile.profile_completion_percentage}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent rounded-full" style={{ width: `${u.profile.profile_completion_percentage}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Actions */}
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4">
                        <p className="text-slate-400 dark:text-white/35 text-[10px] font-black uppercase tracking-widest mb-3">Recent Actions</p>
                        <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
                            {(u.journey || []).length === 0 ? <Empty text="No activity recorded" /> : u.journey.slice(0, 15).map((j, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="text-slate-400 dark:text-white/20 w-4 shrink-0 font-mono">{i + 1}</span>
                                    <span className="text-slate-600 dark:text-white/55 truncate flex-1">{j.page_path || j.feature_name}</span>
                                    <span className="text-slate-400 dark:text-white/20 shrink-0">{timeAgo(j.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Errors */}
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4">
                        <p className="text-red-400/60 text-[10px] font-black uppercase tracking-widest mb-3">Errors Encountered</p>
                        <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar">
                            {(u.errors || []).length === 0 ? <Empty text="No errors" /> : u.errors.slice(0, 10).map((e, i) => (
                                <div key={i} className="text-[10px] border-b border-slate-100 dark:border-white/5 pb-1.5 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-black ${statusColor(e.status_code)}`}>{e.status_code}</span>
                                        <span className="text-orange-500 dark:text-orange-400/70 font-bold">{e.feature}</span>
                                        <span className="text-slate-400 dark:text-white/20 ml-auto">{timeAgo(e.created_at)}</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-white/30 truncate mt-0.5">{e.error_message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Panel>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const UserMonitoringPage = () => {
    const [sessions, setSessions] = useState([]);
    const [recentErrors, setRecentErrors] = useState([]);
    const [heatmap, setHeatmap] = useState([]);
    const [staleUsers, setStaleUsers] = useState([]);
    const [dropoffs, setDropoffs] = useState([]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [nudging, setNudging] = useState(null);

    const [journeyUserId, setJourneyUserId] = useState(null);
    const [journeyUserName, setJourneyUserName] = useState('');
    const [journeyData, setJourneyData] = useState(null);
    const [journeyLoading, setJourneyLoading] = useState(false);

    const loadAll = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        const [sessRes, errRes, heatRes, staleRes, dropRes, probRes] = await Promise.allSettled([
            fetchUserSessions(),
            fetchRecentErrors(),
            fetchErrorHeatmap(),
            fetchStaleUsers(),
            fetchDropoffPoints(),
            api.get('/api/admin/problems', { params: { limit: 30 } })
        ]);

        if (sessRes.status === 'fulfilled') setSessions(sessRes.value?.data || []);
        if (errRes.status === 'fulfilled') setRecentErrors(errRes.value?.data || []);
        if (heatRes.status === 'fulfilled') setHeatmap(heatRes.value?.data || []);
        if (staleRes.status === 'fulfilled') setStaleUsers(staleRes.value?.data || []);
        if (dropRes.status === 'fulfilled') setDropoffs(dropRes.value?.data || []);
        if (probRes.status === 'fulfilled') setProblems(probRes.value?.data?.data || []);

        setLastRefresh(new Date());
        if (!silent) setLoading(false);
        else setRefreshing(false);
    }, []);

    useEffect(() => {
        loadAll();
        const interval = setInterval(() => loadAll(true), 30000);
        return () => clearInterval(interval);
    }, [loadAll]);

    const handleSelectUser = async (userId, name) => {
        setJourneyUserId(userId);
        setJourneyUserName(name);
        setJourneyLoading(true);
        setJourneyData(null);
        try {
            const res = await fetchUserJourney(userId);
            setJourneyData(res?.data || null);
        } catch {
            setJourneyData(null);
        } finally {
            setJourneyLoading(false);
        }
    };

    const handleResolve = async (problemId) => {
        try {
            await api.patch(`/api/admin/problems/${problemId}`, { status: 'resolved' });
            setProblems(prev => prev.map(p => p.id === problemId ? { ...p, status: 'resolved' } : p));
        } catch { /* silent */ }
    };

    const handleNudge = async (userId, name) => {
        setNudging(userId);
        try {
            await api.post('/api/admin/notifications/send', {
                user_ids: [userId],
                title: 'Complete your profile',
                message: `Hi ${name || 'there'}, complete your profile to get started on Connect!`,
                type: 'SYSTEM'
            });
        } catch { /* silent */ }
        finally { setNudging(null); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <InfinityLoader fullScreen={false} size="lg" text="LOADING MONITORING DATA..." />
            </div>
        );
    }

    const openProblems = problems.filter(p => p.status === 'open' || p.status === 'pending').length;

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">User Monitoring Center</h1>
                    <p className="text-slate-400 dark:text-white/35 text-xs mt-1">
                        Sessions · Errors · Journeys · Heatmaps · Drop-offs · Inspector
                        {lastRefresh && <span className="ml-2 text-slate-300 dark:text-white/20">· refreshed {timeAgo(lastRefresh)}</span>}
                    </p>
                </div>
                <button
                    onClick={() => loadAll(true)}
                    disabled={refreshing}
                    className="disabled:opacity-40 transition-opacity"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={`text-accent ${refreshing ? 'animate-spin' : 'hover:opacity-70 transition-opacity'}`} />
                </button>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Active Sessions', value: sessions.length, color: 'text-slate-800 dark:text-white' },
                    { label: 'Recent Errors', value: recentErrors.length, color: recentErrors.length > 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-800 dark:text-white' },
                    { label: 'Stale Users', value: staleUsers.length, color: staleUsers.length > 0 ? 'text-yellow-500 dark:text-yellow-400' : 'text-slate-800 dark:text-white' },
                    { label: 'Open Problems', value: openProblems, color: openProblems > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-slate-800 dark:text-white' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="border border-slate-200 dark:border-white/10 rounded-xl p-4 text-center">
                        <p className={`text-3xl font-black ${color}`}>{value}</p>
                        <p className="text-slate-400 dark:text-white/25 text-[10px] uppercase tracking-widest mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SessionTracker data={sessions} onSelectUser={handleSelectUser} />
                <FeatureErrorLog data={recentErrors} />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <UserJourneyMap
                    userId={journeyUserId}
                    userName={journeyUserName}
                    data={journeyData}
                    loading={journeyLoading}
                    onClose={() => { setJourneyUserId(null); setJourneyData(null); }}
                />
                <ErrorHeatmap data={heatmap} />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ProblemsTimeline data={problems} onResolve={handleResolve} />
                <FailedAPIMonitor data={recentErrors} />
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <RoleBehaviorHeatmap sessions={sessions} />
                <StaleUserAlert data={staleUsers} onNudge={handleNudge} nudging={nudging} />
            </div>

            {/* Row 5 */}
            <DropoffPoints data={dropoffs} />

            {/* Row 6 */}
            <UserInspector />
        </div>
    );
};

export default UserMonitoringPage;
