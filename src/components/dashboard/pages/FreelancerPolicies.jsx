import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, ChevronLeft, BookOpen } from "lucide-react";
import InfinityLoader from "../../common/InfinityLoader";

const getPolicyDetails = (slug) => {
    const s = slug?.toLowerCase() || '';
    if (s.includes('communication')) {
        return [
            "Maintain professional communication at all times. Harassment or offensive language is grounds for immediate account suspension.",
            "Off-platform communication before a contract is started is prohibited to protect user security and transaction tracking.",
            "Expectations for response times: Freelancers are encouraged to respond to active clients within 24 hours on business days.",
            "Zero tolerance for sharing personal contact information (email, phone, or payment IDs) inside the platform's chat before hiring."
        ];
    }
    if (s.includes('cookie')) {
        return [
            "Functional Cookies: Necessary for maintaining your session, security, and authentication across our platform.",
            "Personalization Cookies: Used to store your job search preferences and provide customized job recommendations ('Best Matches').",
            "Performance Cookies: Helping us understand how freelancers interact with the dashboard to improve platform efficiency.",
            "Security Persistence: Secure tokens stored in localized storage to prevent unauthorized account access."
        ];
    }
    if (s.includes('legal')) {
        return [
            "Independent Contractor Status: You are identified as an independent professional. Connect is a marketplace, not an employer.",
            "Intellectual Property: Upon full payment by the client, ownership rights for the delivered work are transferred according to the contract terms.",
            "Tax Compliance: Freelancers are solely responsible for reporting and paying any applicable taxes on earnings generated through the platform.",
            "Agreement to platform-wide binding arbitration for any disputes arising from service usage or contract delivery."
        ];
    }
    if (s.includes('privacy')) {
        return [
            "Data Encryption: All profile data, proposal attachments, and messages are encrypted both in transit and at rest.",
            "Visibility Control: You manage which parts of your profile are public to search engines or restricted to registered clients only.",
            "Third-Party Sharing: We never sell your personal identification information. Data is shared only with payment providers and verified clients.",
            "Right to Portability: You can request an export of your transaction history and profile data at any time through our support portal."
        ];
    }
    if (s.includes('proposal')) {
        return [
            "Relevance Filtering: Our algorithms prioritize proposals that match the client's explicit skill requirements and job description.",
            "Anti-Spam Measures: Repeatedly sending generic or non-relevant proposals may lower your account visibility in client searches.",
            "Connects Usage: Connects are consumed per proposal and are non-refundable unless the job is canceled due to platform policy violations.",
            "Honest Self-Representation: Misrepresenting credentials or using AI to generate misleading portfolio items is prohibited."
        ];
    }
    if (s.includes('terms')) {
        return [
            "Milestone-Based Escrow: Payments are held securely in escrow and only released upon your delivery and the client's approval of specific milestones.",
            "Platform Service Fees: A standard percentage is deducted from each successful transaction to maintain the marketplace ecosystem.",
            "Dispute Resolution: In case of non-approval, our Trust & Safety team provides mediation based on the evidence presented in the platform chat.",
            "Code of Conduct: Commitment to professional excellence and adherence to agreed-upon project timelines."
        ];
    }
    if (s.includes('withdrawal')) {
        return [
            "Security Holding Period: Standard 5-day security review period for funds before they are eligible for withdrawal to your external account.",
            "Verification for First Withdrawal: Identity verification (KYC) is mandatory for the initial payout to ensure financial compliance.",
            "Minimum Withdrawal Limits: A minimum balance is required to initiate a withdrawal, depending on the chosen payment method.",
            "Fraud Prevention: Multiple unauthorized withdrawal attempts from a single account may trigger a permanent security lockout."
        ];
    }
    return [
        "Commitment to maintaining a secure and professional marketplace environment.",
        "Adherence to platform-wide Trust & Safety guidelines as outlined in your registration agreement.",
        "Reporting any suspicious activity or violation of policies directly to our support team."
    ];
};

const defaultPolicies = [
    { id: '1', slug: 'communication', title: 'Communication Guidelines', updated_at: new Date().toISOString() },
    { id: '2', slug: 'privacy', title: 'Privacy Policy', updated_at: new Date().toISOString() },
    { id: '3', slug: 'legal', title: 'Legal Agreement', updated_at: new Date().toISOString() },
    { id: '4', slug: 'terms', title: 'Terms of Service', updated_at: new Date().toISOString() },
    { id: '5', slug: 'proposal', title: 'Proposal Standards', updated_at: new Date().toISOString() },
    { id: '6', slug: 'cookie', title: 'Cookie Policy', updated_at: new Date().toISOString() },
    { id: '7', slug: 'withdrawal', title: 'Withdrawal Limits', updated_at: new Date().toISOString() },
];

const FreelancerPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [activePolicy, setActivePolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading from a network request for the aesthetic effect
        const timer = setTimeout(() => {
            setPolicies(defaultPolicies);
            setActivePolicy(defaultPolicies[0]);
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full pt-32 pb-32">
                <InfinityLoader size={60} />
            </div>
        );
    }

    if (!activePolicy) {
        return (
            <div className="max-w-[1630px] mx-auto px-6 md:px-10 mt-6 pb-12 text-center text-white/40 font-medium italic">
                No policies available at this time.
            </div>
        );
    }

    return (
        <div className="w-full lg:max-w-[1400px] mx-auto mt-0 pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Back Button and Header Section */}
            <div className="space-y-4">
                <Link
                    to="/freelancer/account-health"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </Link>

                <div className="relative pt-2 pb-4 border-b border-white/10 mb-6">
                    <div className="relative z-10 max-w-2xl flex flex-col items-start gap-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                            <Lock size={16} />
                            <span>Platform Policies</span>
                        </div>
                        <h1 className="text-xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight">
                            Policies & Guidelines
                        </h1>
                        <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xl">
                            Everything you need to know about operating successfully and securely on Connect. Adhering to these guidelines ensures you maintain full platform access.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-14 items-start">

                {/* Vertical Sidebar Switcher — horizontal scroll on mobile */}
                <div className="w-full md:w-[180px] shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {policies.map((p) => {
                        const isActive = activePolicy.id === p.id;
                        const isRed = p.slug?.includes('refund') || p.slug?.includes('withdrawal') || p.title?.toLowerCase().includes('withdrawal');

                        return (
                            <button
                                key={p.id}
                                onClick={() => setActivePolicy(p)}
                                className={`relative text-left pl-4 md:pl-6 pr-3 py-2 md:py-3 transition-all duration-300 whitespace-nowrap md:whitespace-normal ${isActive
                                    ? isRed ? 'text-red-500 font-medium' : 'text-white font-medium'
                                    : isRed ? 'text-red-500/60 hover:text-red-500' : 'text-light-text/60 hover:text-light-text'
                                    }`}
                            >
                                {isActive && (
                                    <span className={`absolute left-0 top-0 h-full w-[3px] ${isRed ? 'bg-red-500' : 'bg-accent'}`}></span>
                                )}
                                <span className="text-sm tracking-wide">
                                    {p.title}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-transparent border border-white/10 rounded-2xl p-5 sm:p-8 md:p-10 min-h-[300px] sm:min-h-[500px] shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/10">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                            {activePolicy.slug?.includes('privacy') || activePolicy.title?.toLowerCase().includes('privacy') ? (
                                <img src="/Icons/icons8-privacy-policy-100.png" alt="Privacy" className="w-16 h-16 object-contain" />
                            ) : activePolicy.slug?.includes('communication') || activePolicy.title?.toLowerCase().includes('communication') ? (
                                <img src="/Icons/icons8-communication-100.png" alt="Communication" className="w-16 h-16 object-contain" />
                            ) : activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? (
                                <img src="/Icons/icons8-withdrawal-80.png" alt="Withdrawal" className="w-16 h-16 object-contain" />
                            ) : activePolicy.slug?.includes('legal') || activePolicy.title?.toLowerCase().includes('legal') ? (
                                <img src="/Icons/icons8-legal-80.png" alt="Legal" className="w-16 h-16 object-contain" />
                            ) : activePolicy.slug?.includes('terms') || activePolicy.title?.toLowerCase().includes('terms') ? (
                                <img src="/Icons/icons8-terms-and-conditions-80.png" alt="Terms" className="w-16 h-16 object-contain" />
                            ) : activePolicy.slug?.includes('cookie') || activePolicy.title?.toLowerCase().includes('cookie') ? (
                                <img src="/Icons/icons8-cookies-100.png" alt="Cookie" className="w-16 h-16 object-contain" />
                            ) : (
                                <BookOpen size={32} className={activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500' : 'text-accent'} />
                            )}
                        </div>
                        <div>
                            <h2 className={`text-lg sm:text-2xl font-bold mb-1 ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500' : 'text-white'}`}>
                                {activePolicy.title}
                            </h2>
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                                Last updated: {activePolicy.updated_at ? new Date(activePolicy.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                            </p>
                        </div>
                    </div>

                    <div className={`prose prose-invert max-w-none text-sm leading-relaxed space-y-6 ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500/70' : 'text-white/50'}`}>
                        {activePolicy.description && (
                            <p className={`text-base font-medium ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500' : 'text-white/80'}`}>
                                {activePolicy.description}
                            </p>
                        )}

                        <div className="space-y-8 text-sm">
                            {activePolicy.content && (
                                <div className={`prose prose-sm prose-invert space-y-4 ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500/60' : 'text-white/50'}`}>
                                    {activePolicy.content}
                                </div>
                            )}

                            <div>
                                <h3 className={`text-lg font-bold mb-4 ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500' : 'text-white'}`}>Core Guidelines</h3>
                                <ul className={`space-y-4 list-none p-0`}>
                                    {getPolicyDetails(activePolicy.slug || activePolicy.title?.toLowerCase()).map((detail, idx) => (
                                        <li key={idx} className="flex gap-3 items-start group">
                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'bg-red-500' : 'bg-accent'}`} />
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className={`mt-10 p-6 bg-transparent rounded-xl border border-white/10 ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'border-red-500/20' : ''}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <Shield size={18} className={activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500' : 'text-accent'} />
                                <h4 className={`text-xs font-black uppercase tracking-widest ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500' : 'text-white/80'}`}>Compliance Verification</h4>
                            </div>
                            <p className={`text-[11px] uppercase tracking-[0.1em] leading-relaxed font-bold ${activePolicy.slug?.includes('withdrawal') || activePolicy.title?.toLowerCase().includes('withdrawal') ? 'text-red-500/40' : 'text-white/30'}`}>
                                Note: These terms are subject to change. As an active freelancer, it is your responsibility to stay up-to-date with our Trust & Safety policies to avoid account restriction or loss of access.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default FreelancerPolicies;
