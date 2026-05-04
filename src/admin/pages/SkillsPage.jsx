import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Search, X } from 'lucide-react';
import { addSkill, deleteSkill, fetchUsers } from '../../services/adminService';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const SkillsPage = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSkill, setNewSkill] = useState({ name: '', category: 'Development' });
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('skills').select('*').order('name');
            if (error) throw error;
            setSkills(data || []);
        } catch (error) {
            toast.error('Failed to load skills');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addSkill(newSkill);
            toast.success('Skill added successfully');
            setNewSkill({ name: '', category: 'Development' });
            setIsAdding(false);
            loadSkills();
        } catch (error) {
            toast.error('Failed to add skill');
        }
    };



    const filteredSkills = skills.filter(skill => {
        const name = (skill.name || '').toLowerCase();
        const category = (skill.category || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || category.includes(search);
    });

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this skill?')) return;
        try {
            await deleteSkill(id);
            toast.success('Skill deleted');
            loadSkills();
        } catch (error) {
            toast.error('Failed to delete skill');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-skills-100.png" alt="Skills" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Skill Management
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Configure available talent skills and categories</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-accent transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex-shrink-0 inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition font-bold text-sm shadow-lg shadow-accent/20"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">{isAdding ? 'Close' : 'Add New Skill'}</span>
                        <span className="sm:hidden">{isAdding ? 'Close' : 'Add'}</span>
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-transparent border border-white/10 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-semibold text-white/60 uppercase">Skill Name</label>
                            <input
                                required
                                type="text"
                                value={newSkill.name}
                                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                                placeholder="e.g. React.js, Python, UI Design"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent transition"
                            />
                        </div>
                        <div className="w-full md:w-64 space-y-2">
                            <label className="text-xs font-semibold text-white/60 uppercase">Category</label>
                            <CustomDropdown
                                options={[
                                    { label: 'Development', value: 'Development' },
                                    { label: 'Design', value: 'Design' },
                                    { label: 'Marketing', value: 'Marketing' },
                                    { label: 'Writing', value: 'Writing' },
                                    { label: 'Video & Animation', value: 'Video' }
                                ]}
                                value={newSkill.category}
                                onChange={(val) => setNewSkill({ ...newSkill, category: val })}
                                className="w-full"
                            />
                        </div>
                        <button type="submit" className="px-8 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition text-sm h-[42px]">
                            Create Skill
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full py-12 flex justify-center">
                        <InfinityLoader fullScreen={false} text="Loading catalog..."/>
                    </div>
                ) : filteredSkills.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-white/40">No skills found matching your search</div>
                ) : (
                    filteredSkills.map((skill) => (
                        <div key={skill.id} className="bg-transparent border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-accent/40 transition-colors">
                            <div>
                                <h3 className="text-white font-medium">{skill.name}</h3>
                                <span className="text-[10px] text-accent uppercase font-bold tracking-wider">{skill.category}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(skill.id)}
                                className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SkillsPage;
