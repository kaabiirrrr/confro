import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2, Crown, Users, AlertCircle, Loader2 } from "lucide-react";
import * as apiService from "../../../../services/apiService";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-hot-toast";

const ROLES = [
  {
    key: "MESSENGER",
    label: "Messenger",
    desc: "Can chat and access any company room",
  },
  {
    key: "RECRUITER",
    label: "Recruiter",
    desc: "Can invite, shortlist, and interview freelancers",
  },
  {
    key: "MANAGER",
    label: "Hiring manager",
    desc: "Can send and review offers, create contracts, and reports",
  },
];

const PERMISSIONS_MAP = {
  MESSENGER: ["Chat and access any company room", "Review public profiles"],
  RECRUITER: [
    "Chat and access any company room",
    "View company address book",
    "Invite, shortlist, and interview freelancers",
  ],
  MANAGER: [
    "Chat and access any company room",
    "View company address book",
    "Invite, shortlist, and interview freelancers",
    "Post jobs and review proposals",
    "Send/review offers, create contracts, and reports",
  ],
};

const InviteTeammate = () => {
  const { membership, profile } = useAuth();

  // Resolve plan name from all possible sources
  const planName =
    membership?.plan?.name ||
    membership?.plan_snapshot?.name ||
    profile?.membership_type ||
    "FREE";

  const isElite = planName?.toUpperCase() === "ELITE";

  const [role, setRole] = useState(null); // null = no role selected yet
  const [emails, setEmails] = useState("");
  const [inviteStatus, setInviteStatus] = useState("idle"); // idle | sending | sent
  const [teamId, setTeamId] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamError, setTeamError] = useState(null);

  // Fetch or auto-create team on mount
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoadingTeam(true);
        const res = await apiService.getMyTeams();
        const teams = res?.data || res;
        if (Array.isArray(teams) && teams.length > 0) {
          setTeamId(teams[0].id);
        }
        // If no team exists, backend will auto-create one on invite
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeamError("Could not load team info. You can still send invites.");
      } finally {
        setLoadingTeam(false);
      }
    };
    fetchTeam();
  }, []);

  const handleSendInvite = async () => {
    if (!emails.trim()) {
      toast.error("Please enter at least one email address.");
      return;
    }

    const emailList = emails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@"));

    if (emailList.length === 0) {
      toast.error("Please enter valid email addresses.");
      return;
    }

    // Elite users must explicitly pick a role
    if (isElite && !role) {
      toast.error("Please select a role before sending invites.");
      return;
    }

    // Role assignment requires Elite plan; non-Elite defaults to MEMBER
    const effectiveRole = isElite ? role : "MEMBER";

    setInviteStatus("sending");

    const results = { sent: [], failed: [] };

    for (const email of emailList) {
      try {
        const res = await apiService.inviteTeammate({
          ...(teamId ? { team_id: teamId } : {}),
          email,
          role: effectiveRole,
        });

        results.sent.push(email);

        // Warn if email delivery failed but user was still added
        if (res?.emailSent === false) {
          toast(`${email} added to team, but invite email could not be delivered.`, {
            icon: "⚠️",
          });
        }
      } catch (error) {
        results.failed.push({ email, msg: error?.response?.data?.message || "Failed" });
      }
    }

    if (results.sent.length > 0) {
      setInviteStatus("sent");
      toast.success(
        results.sent.length === 1
          ? `Invitation sent to ${results.sent[0]}`
          : `${results.sent.length} invitations sent successfully`
      );
      setTimeout(() => {
        setInviteStatus("idle");
        setEmails("");
      }, 3000);
    } else {
      setInviteStatus("idle");
    }

    // Show individual errors for failed ones
    results.failed.forEach(({ msg }) => {
      toast.error(msg);
    });
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* TITLE */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Invite teammate
        </h1>
        <p className="text-slate-500 dark:text-white/40 text-[11px] sm:text-sm mt-1 font-medium leading-relaxed max-w-2xl">
          Add team members and assign roles to collaborate on hiring.
        </p>
      </div>

      {/* TEAM ERROR BANNER */}
      {teamError && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-sm font-medium">
          <AlertCircle size={16} className="shrink-0" />
          {teamError}
        </div>
      )}

      {/* EMAIL FIELD */}
      <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none group-hover:bg-accent/10 transition-all duration-700" />

        <div className="relative z-10">
          <p className="text-[10px] font-black text-slate-900/30 dark:text-white/30 uppercase tracking-[0.2em] mb-1">
            Add emails
          </p>
          <p className="text-slate-500 dark:text-white/40 text-[11px] sm:text-sm mb-5 font-medium leading-relaxed">
            You can invite multiple members to this team at once by adding their emails.
          </p>

          <div className="relative group/input">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 group-focus-within/input:text-accent transition-colors z-10"
            />
            <input
              type="text"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
              placeholder="Emails, separated by commas (e.g., john@company.com)"
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-accent/50 dark:focus:border-accent/50 rounded pl-11 pr-4 py-3.5 text-[13px] sm:text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 transition-all relative z-10"
            />
          </div>
        </div>
      </div>

      {/* ROLE SECTION */}
      <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none group-hover:bg-accent/10 transition-all duration-700" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-start gap-2 sm:gap-3 mb-2">
            {/* Title row — on mobile: title left, badge right */}
            <div className="flex items-center justify-between sm:justify-start sm:gap-2 w-full sm:w-auto">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Assign role
              </h3>
              {!isElite && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-accent sm:ml-2">
                  <Crown size={10} />
                  Elite plan required
                </span>
              )}
              {isElite && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 sm:ml-2">
                  <Crown size={10} />
                  Elite
                </span>
              )}
            </div>
            {!isElite && (
              <Link
                to="/client/membership?plan=elite"
                className="w-full sm:w-auto text-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 px-6 py-2 rounded-full text-sm font-bold transition-all"
              >
                Upgrade
              </Link>
            )}
          </div>

          <p className="text-slate-500 dark:text-white/40 text-[11px] sm:text-sm mb-6 leading-relaxed font-medium">
            {isElite
              ? "Select a predefined role. Each role comes with permissions that will apply to all teammates on this invite."
              : "Role assignment is available on the Elite plan. Teammates will be added as Members by default."}
          </p>

          {/* ROLE CARDS */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${!isElite ? "opacity-50 pointer-events-none select-none" : ""}`}>
            {ROLES.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => isElite && setRole(key)}
                disabled={!isElite}
                className={`relative border rounded-xl p-5 sm:p-6 text-left transition-all duration-300 ${
                  role === key
                    ? "border-accent bg-accent/5"
                    : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4
                    className={`text-sm font-bold transition-colors ${
                      role === key
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-white/50"
                    }`}
                  >
                    {label}
                  </h4>
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${
                      role === key
                        ? "border-accent"
                        : "border-slate-300 dark:border-white/20"
                    }`}
                  >
                    {role === key && (
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    )}
                  </div>
                </div>
                <p className="text-[12px] sm:text-sm text-slate-400 dark:text-white/40 leading-relaxed font-medium">
                  {desc}
                </p>
              </button>
            ))}
          </div>

          {/* Locked overlay hint */}
          {!isElite && (
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 dark:text-white/30 font-medium">
              <span className="shrink-0">🔒</span>
              Upgrade to Elite to unlock custom role assignment for your team.
            </div>
          )}
        </div>
      </div>

      {/* PERMISSIONS */}
      <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl p-6 sm:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none group-hover:bg-accent/10 transition-all duration-700" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-5">
            <Users size={16} className="text-accent shrink-0" />
            <p className="text-[10px] font-black text-slate-900/30 dark:text-white/20 uppercase tracking-[0.3em]">
              Teammate(s) will have these permissions
            </p>
          </div>
          <ul className="space-y-3">
            {PERMISSIONS_MAP.MANAGER.map((perm, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-[12px] sm:text-[14px] text-slate-600 dark:text-white/70 font-medium"
              >
                <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                {perm}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-slate-200 dark:border-white/5 pt-8">
        <Link
          to="/client/settings"
          className="w-full sm:w-auto text-center text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 px-8 py-3.5 rounded-full text-sm font-bold transition-all border border-slate-200 dark:border-white/10"
        >
          Cancel
        </Link>
        <button
          onClick={handleSendInvite}
          disabled={inviteStatus !== "idle" || loadingTeam}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            inviteStatus === "sent"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : inviteStatus === "sending"
              ? "bg-accent/40 text-white cursor-not-allowed"
              : "bg-accent text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          }`}
        >
          {inviteStatus === "idle" && "Send invites"}
          {inviteStatus === "sending" && (
            <>
              <Loader2 size={15} className="animate-spin" /> Sending...
            </>
          )}
          {inviteStatus === "sent" && (
            <>
              <CheckCircle2 size={16} /> Invites Sent!
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InviteTeammate;
