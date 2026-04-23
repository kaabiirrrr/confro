import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2, Send } from "lucide-react";
import * as apiService from "../../../../services/apiService";
import { toast } from "react-hot-toast";
import InfinityLoader from '../../../common/InfinityLoader';

const InviteTeammate = () => {

  const navigate = useNavigate();
  const [role, setRole] = useState("manager");
  const [emails, setEmails] = useState("");
  const [inviteStatus, setInviteStatus] = useState("idle");
  const [teamId, setTeamId] = useState(null);

  React.useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await apiService.getMyTeams();
        if (data && data.length > 0) {
          setTeamId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeam();
  }, []);

  const handleSendInvite = async () => {
    if (!emails.trim()) {
      toast.error("Please enter at least one email address.");
      return;
    }
    
    const emailList = emails.split(",").map(e => e.trim()).filter(e => e);
    if (emailList.length === 0) return;

    setInviteStatus("sending");
    
    try {
      // Send one by one or join them if the backend supported it, 
      // but teamsController.inviteMember takes single email.
      // For simplicity in this demo, let's just send the first one or loop.
      for (const email of emailList) {
        await apiService.inviteTeammate({
          team_id: teamId,
          email: email,
          role: role.toUpperCase()
        });
      }
      
      setInviteStatus("sent");
      toast.success("Invitations sent successfully!");
      
      setTimeout(() => {
        setInviteStatus("idle");
        setEmails("");
      }, 3000);
    } catch (error) {
      setInviteStatus("idle");
      toast.error(error?.response?.data?.message || "Failed to send invitations.");
    }
  };

  const getPermissionsList = () => {
    if (role === "messenger") return ["Chat and access any company room", "Review public profiles"];
    if (role === "recruiter") return ["Chat and access any company room", "View company address book", "Invite, shortlist, and interview freelancers"];
    return ["Chat and access any company room", "View company address book", "Invite, shortlist, and interview freelancers", "Post jobs and review proposals", "Send/review offers, create contracts, and reports"];
  };

return (

<div className="min-h-screen flex flex-col">

<div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">


{/* BACK */}

<Link
  to="/client/settings"
  className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group"
>
  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
  Back
</Link>



{/* TITLE */}

<h1 className="text-2xl font-semibold text-white tracking-tight">
  Invite teammate
</h1>



{/* EMAIL FIELD */}

<div className="mb-10">

<label className="block text-sm font-semibold text-white/90 mb-2">
  Add emails
</label>

<p className="text-sm text-white/50 mb-4 font-medium">
  You can invite multiple members to this team at once by adding their emails.
</p>

<div className="relative group">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text/40 group-focus-within:text-accent transition-colors" />
  <input
    type="text"
    value={emails}
    onChange={(e) => setEmails(e.target.value)}
    placeholder="Emails, separated by commas (e.g., john@company.com)"
    className="w-full bg-primary border border-white/10 outline-none focus:border-accent/50 rounded-xl pl-12 pr-4 py-4 text-[15px] text-white transition-all relative z-10"
  />
</div>

</div>



{/* ROLE SECTION */}

<div className="bg-secondary border border-white/10 rounded-2xl p-8 mb-10 shadow-xl shadow-black/20">

<div className="flex justify-between items-center mb-6">

<div className="flex items-center gap-3">

<h3 className="text-lg font-bold text-white">
  Assign role
</h3>

<span className="text-[10px] font-black uppercase tracking-widest bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20">
  Unlock Business Plus
</span>

</div>

  <Link 
    to="/client/membership"
    className="bg-white/5 border border-white/10 text-white hover:bg-white/10 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
  >
    Upgrade
  </Link>

</div>

<p className="text-sm text-white/50 mb-8 leading-relaxed font-medium">
  Select relevant predefined role. Each role comes with permissions that will apply to all teammates on this invite.
</p>



{/* ROLE OPTIONS */}

<div className="grid grid-cols-3 gap-4">

      <button
        onClick={() => setRole("messenger")}
        className={`relative border rounded-2xl p-6 text-left transition-all duration-300 ${
          role === "messenger"
            ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(77,199,255,0.05)]"
            : "border-white/5 bg-primary/40 hover:bg-white/5 hover:border-white/10"
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-sm font-bold transition-colors ${role === "messenger" ? "text-white" : "text-white/60"}`}>
            Messenger
          </h4>
          <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
            role === "messenger" ? "border-accent" : "border-white/10"
          }`}>
            {role === "messenger" && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
          </div>
        </div>
        <p className="text-sm text-white/40 leading-relaxed font-medium">
          Can chat and access any company room
        </p>
      </button>



      <button
        onClick={() => setRole("recruiter")}
        className={`relative border rounded-2xl p-6 text-left transition-all duration-300 ${
          role === "recruiter"
            ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(77,199,255,0.05)]"
            : "border-white/5 bg-primary/40 hover:bg-white/5 hover:border-white/10"
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-sm font-bold transition-colors ${role === "recruiter" ? "text-white" : "text-white/60"}`}>
            Recruiter
          </h4>
          <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
            role === "recruiter" ? "border-accent" : "border-white/10"
          }`}>
            {role === "recruiter" && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
          </div>
        </div>
        <p className="text-sm text-white/40 leading-relaxed font-medium">
          Can invite, shortlist, and interview freelancers
        </p>
      </button>



      <button
        onClick={() => setRole("manager")}
        className={`relative border rounded-2xl p-6 text-left transition-all duration-300 ${
          role === "manager"
            ? "border-accent bg-accent/5 shadow-[0_0_20px_rgba(77,199,255,0.05)]"
            : "border-white/5 bg-primary/40 hover:bg-white/5 hover:border-white/10"
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-sm font-bold transition-colors ${role === "manager" ? "text-white" : "text-white/60"}`}>
            Hiring manager
          </h4>
          <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
            role === "manager" ? "border-accent" : "border-white/10"
          }`}>
            {role === "manager" && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
          </div>
        </div>
        <p className="text-sm text-white/40 leading-relaxed font-medium">
          Can send and review offers, create contracts, and reports
        </p>
      </button>

</div>

</div>



{/* PERMISSIONS */}
<div className="mb-10 bg-primary/40 border border-white/5 rounded-xl p-6">
  <h3 className="text-[16px] font-bold text-white mb-5 flex items-center gap-2">
    Teammate(s) will have these permissions:
  </h3>
  <ul className="space-y-3">
    {getPermissionsList().map((perm, idx) => (
      <li key={idx} className="flex items-start gap-3 text-[15px] text-light-text/80 font-medium">
        <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
        {perm}
      </li>
    ))}
  </ul>
</div>

{/* ACTION BUTTONS */}
<div className="flex items-center gap-4 border-t border-white/5 pt-10 mt-6">
  <button 
    onClick={handleSendInvite}
    disabled={inviteStatus !== "idle"}
    className={`px-10 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[220px] shadow-lg shadow-accent/20 border border-white/5 ${
      inviteStatus === "sent" 
        ? "bg-green-500/10 text-green-400 border-green-500/20" 
        : inviteStatus === "sending"
        ? "bg-accent/40 text-white cursor-not-allowed"
        : "bg-accent text-white hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98]"
    }`}
  >
    {inviteStatus === "idle" && <><Send size={18} /> Send invites</>}
    {inviteStatus === "sending" && <><InfinityLoader size={20} /> Sending...</>}
    {inviteStatus === "sent" && <><CheckCircle2 size={18} /> Invites Sent!</>}
  </button>

  <Link to="/client/settings" className="text-white/40 hover:text-white hover:bg-white/5 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all">
    Cancel
  </Link>
</div>

</div>

</div>

);

};

export default InviteTeammate;