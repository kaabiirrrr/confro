import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, FileText, Tag, IndianRupee, Layers, Clock, Paperclip,
  ChevronDown, X, Plus, Save, Send
} from 'lucide-react';
import { USD_TO_INR, convertToUSD } from '../../../../utils/currencyUtils';
import SectionHeader from '../../../ui/SectionHeader';
import Button from '../../../ui/Button';
import { createJob, updateJob, getJobById, uploadJobAttachment, aiImproveJob, aiSuggestSkills, getMyJobs, getConnectsSettings, getConnectsBalance } from '../../../../services/apiService';
import { toast } from 'react-hot-toast';
import { toastApiError } from '../../../../utils/apiErrorToast';
import InfinityLoader from '../../../common/InfinityLoader';
import analytics from "../../../../services/analytics.service";
import CustomDropdown from '../../../ui/CustomDropdown';
import AIJobPreviewModal from './AIJobPreviewModal';
import { Sparkles, Wand2 } from 'lucide-react';
import OtpModal from '../../../OtpModal';
import { useOtp } from '../../../../hooks/useOtp';
import { useAuth } from '../../../../context/AuthContext';
import { getApiUrl } from '../../../../utils/authUtils';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Design & Creative', 'Writing & Translation',
  'Data Science & ML', 'DevOps & Cloud', 'Cybersecurity', 'Marketing & SEO',
  'Finance & Accounting', 'Video & Animation', 'Customer Support', 'Other'
];

const SKILLS_LIST = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Vue.js', 'Angular',
  'PHP', 'Laravel', 'Django', 'Flutter', 'Swift', 'Kotlin', 'Java', 'C#',
  'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL',
  'UI/UX Design', 'Figma', 'Photoshop', 'SEO', 'Content Writing', 'Data Analysis'
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Entry Level', desc: 'Looking for someone just starting out' },
  { value: 'intermediate', label: 'Intermediate', desc: '1-3 years experience' },
  { value: 'expert', label: 'Expert', desc: '3+ years with proven portfolio' },
];

const DURATIONS = [
  'Less than 1 week', '1-2 weeks', '1 month', '2-3 months', '3-6 months', 'More than 6 months'
];

const PostJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');
  const { profile } = useAuth();
  const phone = profile?.mobile_number || profile?.phone || '';

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!editJobId);
  const [isFirstJob, setIsFirstJob] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [connectsSettings, setConnectsSettings] = useState(null);
  const [connectsBalance, setConnectsBalance] = useState(0);

  useEffect(() => {
    const fetchConnectsInfo = async () => {
      try {
        const [settings, balanceRes] = await Promise.all([
          getConnectsSettings(),
          getConnectsBalance()
        ]);
        if (settings.success) setConnectsSettings(settings.data);
        if (balanceRes.success) setConnectsBalance(balanceRes.data.balance || 0);
      } catch (err) {
        console.error('Failed to fetch connects info:', err);
      }
    };
    fetchConnectsInfo();
  }, []);

  const { openOtp, otpProps } = useOtp({
    phone,
    onSuccess: async () => {
      if (pendingPayload) {
        setIsLoading(true);
        try {
          const result = editJobId
            ? await updateJob(editJobId, pendingPayload)
            : await createJob(pendingPayload);
          toast.success(editJobId ? 'Job updated!' : pendingStatus === 'DRAFT' ? 'Draft saved!' : 'Job posted successfully!');
          navigate('/client/jobs');
        } catch (err) {
          toastApiError(err, 'Failed to post job');
        } finally {
          setIsLoading(false);
          setPendingPayload(null);
        }
      }
    },
  });

  // Check if this is the client's first job
  useEffect(() => {
    if (!editJobId) {
      getMyJobs().then(res => {
        const jobs = res?.data ?? res ?? [];
        setIsFirstJob(Array.isArray(jobs) ? jobs.length === 0 : false);
      }).catch(() => {});
    }
  }, [editJobId]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    budget_type: 'fixed',
    budget_amount: '',
    experience_level: 'intermediate',
    duration: '',
    bid_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    job_mode: 'single', // NEW: 'single' | 'team'
    roles: [{ title: '', description: '', budget: '', positions: 1, priority: 0 }], // NEW: Role Builder state
  });

  const [aiModal, setAiModal] = useState({
    isOpen: false,
    aiData: null,
    type: 'improve',
    isThinking: false
  });


  const API_URL = getApiUrl();

  useEffect(() => {
    analytics.trackVisit();
  }, []);

  useEffect(() => {
    if (!editJobId) return;
    const loadJob = async () => {
      try {
        const res = await getJobById(editJobId);
        if (res.success) {
          const job = res.data;
          setForm(prev => ({
            ...prev,
            title: job.title || '',
            description: job.description || '',
            category: job.category || '',
            budget_type: job.budget_type || 'fixed',
            budget_amount: job.budget_amount ? Math.round(job.budget_amount * USD_TO_INR) : '',
            experience_level: job.experience_level || 'intermediate',
            duration: job.duration || '',
            bid_deadline: job.bid_deadline ? new Date(job.bid_deadline).toISOString().slice(0, 16) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            job_mode: job.job_mode || 'single',
            roles: job.roles?.length > 0 ? job.roles.map(r => ({ ...r, budget: Math.round((r.budget || 0) * USD_TO_INR) })) : prev.roles
          }));
          setSelectedSkills(job.skills || []);
          setAttachments(job.attachments || []);
        }
      } catch (err) {
        toastApiError(err, 'Failed to load job for editing');
      } finally {
        setIsFetching(false);
      }
    };
    loadJob();
  }, [editJobId]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 10) {
      setSelectedSkills(prev => [...prev, skill]);
    }
    setSkillInput('');
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skill) => setSelectedSkills(prev => prev.filter(s => s !== skill));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingFile(true);
    try {
      const uploaded = await Promise.all(files.map(f => uploadJobAttachment(f)));
      setAttachments(prev => [...prev, ...uploaded]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (err) {
      toast.error('File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const addRole = () => {
    setForm(f => ({
      ...f,
      roles: [...f.roles, { title: '', description: '', budget: '', positions: 1, priority: 0 }]
    }));
  };

  const removeRole = (index) => {
    setForm(f => ({
      ...f,
      roles: f.roles.filter((_, i) => i !== index)
    }));
  };

  const updateRole = (index, field, value) => {
    const newRoles = [...form.roles];
    newRoles[index][field] = value;
    setForm(f => ({ ...f, roles: newRoles }));
  };

  // --- CONNECT AI HANDLERS ---
  const handleAIImprove = async () => {
    if (form.description.length < 10 && form.title.length < 5) {
        return toast.error('Please type a title or rough description first.');
    }
    
    setAiModal(prev => ({ ...prev, isThinking: true }));
    try {
        // Send a clean, consolidated context string instead of raw JSON
        const context = `Title: ${form.title}\nDescription: ${form.description}`;
        const res = await aiImproveJob(context);
        
        if (res.success) {
            // Ensure we handle both string and object data gracefully
            const description = typeof res.data === 'string' 
                ? res.data 
                : res.data.improvedPost || res.data.description || JSON.stringify(res.data);

            setAiModal({
                isOpen: true,
                aiData: { description: description, skills: [] },
                type: 'improve',
                isThinking: false
            });
        }
    } catch (err) {
        toast.error('AI refinement failed. Please try again.');
        setAiModal(prev => ({ ...prev, isThinking: false }));
    }
  };

  const handleAISuggestSkills = async () => {
    if (!form.category) return toast.error('Please select a category first.');
    
    setAiModal(prev => ({ ...prev, isThinking: true }));
    try {
        const res = await aiSuggestSkills(form.category);
        if (res.success) {
            setAiModal({
                isOpen: true,
                aiData: { skills: res.data.skills },
                type: 'skills',
                isThinking: false
            });
        }
    } catch (err) {
        toast.error('AI skill suggestion failed.');
        setAiModal(prev => ({ ...prev, isThinking: false }));
    }
  };

  const applyAISuggestions = (aiData) => {
    if (aiData.description) {
        setForm(f => ({ ...f, description: aiData.description }));
    }
    if (aiData.skills && aiData.skills.length > 0) {
        const uniqueNewSkills = aiData.skills.filter(s => !selectedSkills.includes(s));
        setSelectedSkills(prev => [...prev, ...uniqueNewSkills].slice(0, 10));
    }
    setAiModal(prev => ({ ...prev, isOpen: false }));
    toast.success('AI suggestions applied!');
  };

  const handleSubmit = async (status = 'open') => {
    if (form.title.trim().length < 5) return toast.error('Job title must be at least 5 characters');
    if (form.description.trim().length < 20) return toast.error('Description must be at least 20 characters');
    if (!form.category) return toast.error('Please select a category');

    if (form.job_mode === 'single') {
      if (!form.budget_amount) return toast.error('Budget amount is required');
    } else {
      if (form.roles.length === 0) return toast.error('Please add at least one role for the team');
      for (const r of form.roles) {
        if (!r.title || !r.budget) return toast.error('Each role needs a title and budget');
      }
    }

    const payload = {
      ...form,
      budget_amount: form.job_mode === 'single' ? convertToUSD(form.budget_amount) : 0,
      skills: selectedSkills,
      attachments,
      status,
      roles: form.job_mode === 'team' ? form.roles.map(r => ({ ...r, budget: convertToUSD(r.budget) })) : undefined
    };

    // Gate first job post behind OTP
    if (isFirstJob && !editJobId && phone) {
      setPendingPayload(payload);
      setPendingStatus(status);
      openOtp('first_job');
      return;
    }

    setIsLoading(true);
    try {
      const result = editJobId
        ? await updateJob(editJobId, payload)
        : await createJob(payload);
      toast.success(editJobId ? 'Job updated!' : status === 'DRAFT' ? 'Draft saved!' : 'Job posted successfully!');
      navigate('/client/jobs');
    } catch (err) {
      toastApiError(err, 'Failed to post job');
    } finally {
      setIsLoading(false);
    }
  };


  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <InfinityLoader size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title={editJobId ? 'Edit Job' : 'Post a Job'}
        subtext="Find the perfect freelancer for your project"
      />

      {/* ECONOMY & BUDGET SUMMARY — Front and Center for Transparency */}
      {connectsSettings?.is_connect_system_enabled && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3 rounded-2xl bg-transparent"
        >
             <div className="flex items-center gap-3">
               <img src="/Icons/link.png" alt="Connects" className="w-5 h-5 object-contain opacity-60" />
               <p className="text-xs text-white/40">
                 Posting requires <span className="text-accent font-bold">{connectsSettings.job_post_cost} connects</span>
               </p>
             </div>

             <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <p className="text-[10px] text-white/20 uppercase tracking-widest">Connects Required</p>
                 <p className="text-sm font-black text-accent">{connectsSettings.job_post_cost}</p>
               </div>
               <div className="w-px h-4 bg-white/10" />
               <div className="flex items-center gap-2">
                 <p className="text-[10px] text-white/20 uppercase tracking-widest">Connects Available</p>
                 <p className={`text-sm font-black ${connectsBalance < connectsSettings.job_post_cost ? 'text-rose-500' : 'text-white/50'}`}>
                   {connectsBalance}
                 </p>
               </div>
               {connectsBalance < connectsSettings.job_post_cost && (
                 <Link to="/client/buy-connects" className="px-4 py-1.5 bg-rose-500 text-white font-bold rounded-full text-[10px] uppercase tracking-widest hover:bg-rose-400 transition whitespace-nowrap">
                   Refill
                 </Link>
               )}
             </div>
        </motion.div>
      )}

      <div className="mt-10 space-y-12">

        {/* Hiring Type Toggle */}
        <FormSection label="Hiring Type" icon={<Layers size={14} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleChange('job_mode', 'single')}
              className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${form.job_mode === 'single' ? 'border-accent bg-transparent' : 'bg-transparent border-white/5 hover:border-white/20'}`}
            >

              <div className="flex items-center gap-3 mb-2">
                <Briefcase size={20} className={form.job_mode === 'single' ? 'text-accent' : 'text-white/20'} />
                <span className={`text-sm font-bold ${form.job_mode === 'single' ? 'text-accent' : 'text-white'}`}>Individual</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium uppercase tracking-wider">Hire one freelancer for a specific project with a single budget.</p>
              {form.job_mode === 'single' && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>

            <button
              onClick={() => handleChange('job_mode', 'team')}
              className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${form.job_mode === 'team' ? 'border-accent bg-transparent' : 'bg-transparent border-white/5 hover:border-white/20'}`}
            >

              <div className="flex items-center gap-3 mb-2">
                <Layers size={20} className={form.job_mode === 'team' ? 'text-accent' : 'text-white/20'} />
                <span className={`text-sm font-bold ${form.job_mode === 'team' ? 'text-accent' : 'text-white'}`}>Team Hiring</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium uppercase tracking-wider">Build a team with multiple roles, each with their own budget and positions.</p>
              {form.job_mode === 'team' && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
          </div>
        </FormSection>

        
        {/* Job Title */}
        <FormSection label="Job Title" icon={<Briefcase size={14} />}>
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-full px-5 py-4 text-sm text-white placeholder-white/10 focus:outline-none focus:border-accent transition-all"
            placeholder="e.g. React Developer Needed for E-commerce Website"
            maxLength={100}
          />
          <div className="flex justify-end mt-1.5">
             <span className="text-[10px] font-medium text-white/10">{form.title.length}/100</span>
          </div>
        </FormSection>

        {/* Description */}
        <FormSection 
            label="Job Description" 
            icon={<FileText size={14} />}
            action={
                <button 
                    onClick={handleAIImprove}
                    disabled={aiModal.isThinking}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-full text-accent text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                    title={aiModal.isThinking ? 'Reading Context...' : 'Rewrite with Connect AI'}
                >
                    <Sparkles size={12} className="sm:w-2.5 sm:h-2.5" />
                    <span className="hidden sm:inline">
                        {aiModal.isThinking ? 'Reading Context...' : 'Rewrite with Connect AI'}
                    </span>
                </button>
            }
        >
          <textarea
            rows="10"
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-5 text-sm text-white placeholder-white/10 focus:outline-none focus:border-accent resize-none transition-all leading-relaxed"
            placeholder="Describe your project in detail..."
          />
        </FormSection>

        {/* Category */}
        <FormSection label="Category" icon={<Layers size={14} />}>
          <CustomDropdown
            options={CATEGORIES}
            value={form.category}
            onChange={val => handleChange('category', val)}
            placeholder="Select a category..."
            className="w-full"
          />
        </FormSection>

        {/* Skills */}
        <FormSection 
            label="Skills Required" 
            icon={<Tag size={14} />}
            action={
                <button 
                    onClick={handleAISuggestSkills}
                    disabled={aiModal.isThinking}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-full text-accent text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                    title={aiModal.isThinking ? 'Analyzing Market...' : 'Suggest Skills'}
                >
                    <Wand2 size={12} className="sm:w-2.5 sm:h-2.5" />
                    <span className="hidden sm:inline">
                        {aiModal.isThinking ? 'Analyzing Market...' : 'Suggest Skills'}
                    </span>
                </button>
            }
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 bg-accent/5 text-accent border border-accent/10 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={skillInput}
              onChange={e => { setSkillInput(e.target.value); setShowSkillSuggestions(true); }}
              onFocus={() => setShowSkillSuggestions(true)}
              onKeyDown={e => { if (e.key === 'Enter' && skillInput.trim()) { addSkill(skillInput.trim()); } }}
              className="w-full bg-white/[0.02] border border-white/5 rounded-full px-5 py-4 text-sm text-white placeholder-white/10 focus:outline-none focus:border-accent transition-all"
              placeholder="Add skill (up to 10)..."
              disabled={selectedSkills.length >= 10}
            />
          </div>
        </FormSection>

        {/* Budget Section (Conditional) */}
        {form.job_mode === 'single' ? (
          <FormSection label="Budget & Pricing" icon={<IndianRupee size={14} />}>
            <div className="space-y-4">
              <div className="flex gap-3">
                {['fixed', 'hourly'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleChange('budget_type', type)}
                    className={`flex-1 py-3 px-4 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${form.budget_type === type
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04]'
                      }`}
                  >
                    {type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="number"
                  value={form.budget_amount}
                  onChange={e => handleChange('budget_amount', e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-full pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:border-accent transition-all"
                  placeholder={form.budget_type === 'hourly' ? '0.00 / hr' : '0.00'}
                  min="1"
                />
              </div>
            </div>
          </FormSection>
        ) : (
          <FormSection label="Role Builder" icon={<Layers size={14} />}>
            <div className="space-y-6">
              {form.roles?.map((role, idx) => (
                <div key={idx} className="p-6 bg-transparent border border-white/5 rounded-2xl relative group/role animate-in fade-in slide-in-from-right-4 duration-300">

                  {form.roles.length > 1 && (
                    <button 
                      onClick={() => removeRole(idx)}
                      className="absolute top-4 right-4 p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover/role:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20">Role Title</label>
                        <input
                          type="text"
                          value={role.title}
                          onChange={e => updateRole(idx, 'title', e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-accent"
                          placeholder="e.g. Lead Frontend Architect"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20">Role Description (Internal)</label>
                        <textarea
                          value={role.description}
                          onChange={e => updateRole(idx, 'description', e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent h-24 resize-none"
                          placeholder="What will this person specifically do?"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/20">Budget (₹)</label>
                          <div className="relative">
                            <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                            <input
                              type="number"
                              value={role.budget}
                              onChange={e => updateRole(idx, 'budget', e.target.value)}
                              className="w-full bg-white/[0.02] border border-white/5 rounded-full pl-10 pr-5 py-3 text-sm text-white focus:outline-none focus:border-accent"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/20">Positions</label>
                          <input
                            type="number"
                            value={role.positions}
                            onChange={e => updateRole(idx, 'positions', e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/5 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-accent"
                            min="1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20">Priority (0-10)</label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={role.priority}
                          onChange={e => updateRole(idx, 'priority', e.target.value)}
                          className="w-full accent-accent bg-transparent"
                        />
                        <div className="flex justify-between text-[8px] font-black uppercase text-white/10 tracking-[0.2em]">
                          <span>Low Priority</span>
                          <span>High Priority ({role.priority})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addRole}
                className="w-full py-6 border-2 border-dashed border-white/5 rounded-2xl hover:border-accent hover:bg-accent/5 font-bold uppercase text-[10px] tracking-[0.2em] text-white/20 hover:text-accent transition-all flex items-center justify-center gap-3"
              >
                <Plus size={16} />
                Add Another Role
              </button>
            </div>
          </FormSection>
        )}


        {/* Experience Level */}
        <FormSection label="Experience Level" icon={<Layers size={14} />}>
          <div className="space-y-3">
            {EXPERIENCE_LEVELS.map(level => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleChange('experience_level', level.value)}
                className={`w-full p-4 rounded-full border text-left transition-all px-8 ${form.experience_level === level.value
                  ? 'border-accent bg-accent/5'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                  }`}
              >
                <p className={`text-sm font-bold ${form.experience_level === level.value ? 'text-accent' : 'text-white'}`}>
                  {level.label}
                </p>
                <p className="text-[10px] text-white/20 mt-0.5 uppercase font-bold tracking-wider">{level.desc}</p>
              </button>
            ))}
          </div>
        </FormSection>

        {/* Project Timeline */}
        <FormSection label="Project Timeline" icon={<Clock size={14} />}>
          <div className="space-y-2">
            {DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => handleChange('duration', d)}
                className={`w-full py-3.5 px-8 rounded-full border text-[10px] font-bold uppercase tracking-widest text-left transition-all ${form.duration === d
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'bg-white/[0.02] border-white/5 text-white/20 hover:bg-white/[0.04]'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </FormSection>

        {/* Bidding Deadline */}
        <FormSection label="Bidding Deadline" icon={<Clock size={14} />}>
          <div className="relative group">
            <input
              type="datetime-local"
              value={form.bid_deadline}
              onChange={e => handleChange('bid_deadline', e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:border-accent transition-all [color-scheme:dark]"
            />
            <p className="mt-2 text-[10px] text-white/20 uppercase font-bold tracking-wider">
              Bidding will automatically close at this time.
            </p>
          </div>
        </FormSection>

        {/* Attachments */}
        <FormSection label="Attachments (optional)" icon={<Paperclip size={14} />}>
           <div className="grid grid-cols-1 gap-3">
              {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.04] border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                          <Paperclip size={14} className="text-accent shrink-0" />
                          <span className="text-xs text-white/60 truncate">{file.name}</span>
                      </div>
                      <button
                          type="button"
                          onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                          className="p-1 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-colors"
                      >
                          <X size={14} />
                      </button>
                  </div>
              ))}
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-2xl hover:border-accent hover:bg-accent/5 cursor-pointer transition-all group">
                <Plus size={20} className="text-white/10 group-hover:text-accent mb-2 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/20 group-hover:text-accent transition-colors">
                   {uploadingFile ? 'Uploading...' : 'Attach Files'}
                </span>
                <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" />
              </label>
           </div>
        </FormSection>


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-10 border-t border-white/5">
          <button
            onClick={() => navigate('/client/jobs')}
            className="w-full sm:w-auto py-4 px-8 rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all order-2 sm:order-1"
          >
            Discard
          </button>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={() => handleSubmit('DRAFT')}
              disabled={isLoading}
              className="w-full sm:w-auto py-4 px-8 rounded-full bg-white/[0.04] border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <InfinityLoader size={20} /> : <Save size={16} />}
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('OPEN')}
              disabled={isLoading}
              className="w-full sm:w-auto py-4 px-10 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/10"
            >
              {isLoading ? <InfinityLoader size={20} /> : <Send size={16} />}
              {editJobId ? 'Update Job' : 'Launch Project'}
            </button>
          </div>
        </div>

      </div>

      <AIJobPreviewModal 
        isOpen={aiModal.isOpen}
        onClose={() => setAiModal(prev => ({ ...prev, isOpen: false }))}
        onApply={applyAISuggestions}
        originalData={{ description: form.description }}
        aiData={aiModal.aiData}
        type={aiModal.type}
      />
      <OtpModal {...otpProps} />
    </div>
  );
};

const FormSection = ({ label, icon, action, children }) => (
  <div className="mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/20 shrink-0">
          {icon}
        </div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 truncate">{label}</h3>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="w-full">
      {children}
    </div>
  </div>
);

export default PostJob;