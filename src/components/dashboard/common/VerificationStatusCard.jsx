import { useNavigate } from 'react-router-dom';
import { ShieldCheck, BadgeCheck, Clock, XCircle, ArrowRight, RefreshCw, User, LayoutDashboard } from 'lucide-react';

const UNLOCKS_FREELANCER = [
  'Trusted IDV badge on your profile',
  'Higher visibility in search results',
  'Clients prefer verified freelancers',
  '3× more contract opportunities',
];

const UNLOCKS_CLIENT = [
  'Trusted badge on your client profile',
  'Freelancers respond faster to verified clients',
  'Unlock higher escrow and payment limits',
  'Access to priority support',
];

export default function VerificationStatusCard({ vstatus, verification, role = 'FREELANCER', onStartVerification }) {
  const navigate = useNavigate();
  const isFreelancer = role === 'FREELANCER';
  const dashboardPath = isFreelancer ? '/freelancer/dashboard' : '/client/dashboard';
  const profilePath   = isFreelancer ? '/freelancer/profile'   : '/client/settings';
  const unlocks = isFreelancer ? UNLOCKS_FREELANCER : UNLOCKS_CLIENT;

  // ── NOT SUBMITTED ────────────────────────────────────────────
  if (vstatus === 'NOT_SUBMITTED' || vstatus === 'NOT_STARTED') {
    return (
      <div className="space-y-6">
        {/* Main card */}
        <div className="max-w-[1500px] mx-auto bg-[#0d1526] border border-[#1a2744] rounded-[2rem] p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#1e3a5f] flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="text-[#3b82f6]" />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg mb-1">
                {isFreelancer ? 'Get Your IDV Badge' : 'Get Verified as a Client'}
              </h2>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                {isFreelancer
                  ? 'Verify your identity to stand out. Verified freelancers earn more trust and get hired faster.'
                  : 'Verified clients attract better talent and get faster responses. Complete verification to unlock your trust badge.'}
              </p>
              <button
                onClick={onStartVerification}
                className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-full transition-colors"
              >
                Start Verification <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* What this unlocks */}
        <div className="max-w-[1500px] mx-auto">
          <p className="text-[#475569] text-xs font-semibold uppercase tracking-wider mb-3">What this unlocks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unlocks.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-3 bg-[#0d1526] border border-[#1a2744] rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0" />
                <span className="text-[#94a3b8] text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PENDING / UNDER REVIEW ───────────────────────────────────
  if (vstatus === 'PENDING' || vstatus === 'UNDER_REVIEW' || vstatus === 'VERIFYING') {
    return (
      <div className="max-w-[1500px] mx-auto space-y-4">
        <div className="bg-[#0d1526] border border-[#1a2744] rounded-[2rem] p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#1c1a0a] border border-[#3d3000] flex items-center justify-center shrink-0">
              <Clock size={22} className="text-[#fbbf24]" />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg mb-1">Verification in progress</h2>
              <p className="text-[#64748b] text-sm leading-relaxed mb-1">
                We're reviewing your documents. This usually takes 1–2 business days.
              </p>
              {verification?.submitted_at && (
                <p className="text-[#475569] text-xs">
                  Submitted {new Date(verification.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-[#0d1526] border border-[#1a2744] rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="flex gap-1.5">
            {['Submitted', 'Under Review', 'Decision'].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#3b82f6]' : i === 1 ? 'bg-[#fbbf24] animate-pulse' : 'bg-[#1a2744]'}`} />
                <span className={`text-xs ${i <= 1 ? 'text-[#94a3b8]' : 'text-[#334155]'}`}>{s}</span>
                {i < 2 && <div className="w-6 h-px bg-[#1a2744]" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate(dashboardPath)}
            className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-full transition-colors">
            <LayoutDashboard size={15} /> Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── APPROVED / VERIFIED ──────────────────────────────────────
  if (vstatus === 'APPROVED' || vstatus === 'VERIFIED') {
    return (
      <div className="max-w-[1500px] mx-auto space-y-5">
        {/* Status card — neutral with blue tint, minimal green */}
        <div className="bg-[#0d1526] border border-[#1a2744] rounded-[2rem] p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#0a1f0a] border border-[#1a3a1a] flex items-center justify-center shrink-0">
              <BadgeCheck size={22} className="text-[#4ade80]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white font-semibold text-lg">Identity verified</h2>
                <span className="px-2 py-0.5 rounded-md bg-[#0a1f0a] border border-[#1a3a1a] text-[#4ade80] text-[10px] font-semibold uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <p className="text-[#64748b] text-sm leading-relaxed">
                Your identity is confirmed. Your trust badge is now visible on your profile.
              </p>
            </div>
          </div>
        </div>

        {/* What this means */}
        <div>
          <p className="text-[#475569] text-xs font-semibold uppercase tracking-wider mb-3">What this unlocks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {unlocks.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-3 bg-[#0d1526] border border-[#1a2744] rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shrink-0" />
                <span className="text-[#94a3b8] text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => navigate(dashboardPath)}
            className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-full transition-colors">
            <LayoutDashboard size={15} /> Go to Dashboard
          </button>
          <button onClick={() => navigate(profilePath)}
            className="flex items-center gap-2 px-6 py-3 border border-[#1a2744] text-[#94a3b8] hover:text-white hover:border-[#2a3a5a] text-sm font-medium rounded-full transition-colors">
            <User size={15} /> View Profile
          </button>
        </div>

        {/* Next step suggestion */}
        <div className="bg-[#0d1526] border border-[#1a2744] rounded-xl px-5 py-4">
          <p className="text-[#475569] text-xs font-semibold uppercase tracking-wider mb-2">Suggested next step</p>
          <p className="text-[#94a3b8] text-sm">
            {isFreelancer
              ? '→ Complete your profile to increase your chances of getting hired.'
              : '→ Start hiring freelancers and post your first job.'}
          </p>
          <button
            onClick={() => navigate(isFreelancer ? '/freelancer/setup-profile' : '/client/post-job')}
            className="mt-3 text-[#3b82f6] text-xs font-semibold hover:underline"
          >
            {isFreelancer ? 'Complete profile →' : 'Post a job →'}
          </button>
        </div>
      </div>
    );
  }

  // ── REJECTED ─────────────────────────────────────────────────
  if (vstatus === 'REJECTED') {
    return (
      <div className="max-w-[1500px] mx-auto space-y-4">
        <div className="bg-[#0d1526] border border-[#1a2744] rounded-[2rem] p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#1a0a0a] border border-[#3a1a1a] flex items-center justify-center shrink-0">
              <XCircle size={22} className="text-[#f87171]" />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg mb-1">Verification failed</h2>
              <p className="text-[#64748b] text-sm leading-relaxed mb-3">
                Please re-upload valid documents. Make sure images are clear and all text is readable.
              </p>
              {verification?.rejection_reason && (
                <div className="px-4 py-3 bg-[#1a0a0a] border border-[#3a1a1a] rounded-xl text-[#f87171] text-sm mb-4">
                  {verification.rejection_reason}
                </div>
              )}
              <button onClick={onStartVerification}
                className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold rounded-full transition-colors">
                <RefreshCw size={15} /> Retry Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
