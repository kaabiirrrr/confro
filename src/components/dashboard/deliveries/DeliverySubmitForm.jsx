import { useState, useRef } from 'react';
import { 
    Upload, Link, MessageSquare, AlertCircle, CheckCircle2, 
    X, FileText, Loader2, Sparkles 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getUploadUrl, submitDelivery } from '../../../services/apiService';
import { supabase } from '../../../lib/supabase';

export default function DeliverySubmitForm({ contractId, jobId, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [workLink, setWorkLink] = useState('');
    const [files, setFiles] = useState([]); // { name, size, type, url, hash }
    const [uploadProgress, setUploadProgress] = useState(0);
    const [aiFeedback, setAiFeedback] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const uploadedFiles = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                
                // 1. Get Signed URL from Backend
                const { data: uploadData } = await getUploadUrl(jobId, file.name, file.size, file.type);
                
                // 2. Upload directly to Supabase Storage
                const { error: storageError } = await supabase.storage
                    .from('deliveries')
                    .uploadToSignedUrl(uploadData.path, uploadData.token, file);

                if (storageError) throw storageError;

                // 3. Store file metadata
                uploadedFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: uploadData.path,
                    hash: null // Simple implementation for now
                });
                
                setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
            }
            setFiles(prev => [...prev, ...uploadedFiles]);
            toast.success('Files uploaded successfully');
        } catch (err) {
            console.error('Upload error:', err);
            toast.error(err.message || 'Failed to upload files');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return toast.error('Please add a message describing your work');
        if (files.length === 0 && !workLink.trim()) return toast.error('Please upload a file or provide a work link');

        setSubmitting(true);
        setAiFeedback(null);

        try {
            const delivery_type = files.length > 0 && workLink ? 'mixed' : (files.length > 0 ? 'file' : 'link');
            
            const payload = {
                contract_id: contractId,
                message,
                work_link: workLink,
                delivery_type,
                files
            };

            const res = await submitDelivery(payload);
            toast.success(res.message || 'Work submitted successfully');
            
            if (res.aiFeedback) {
                setAiFeedback(res.aiFeedback);
            }

            // Cleanup
            setMessage('');
            setWorkLink('');
            setFiles([]);
            
            if (onSuccess) onSuccess(res.data);
        } catch (err) {
            console.error('Submission error:', err);
            toast.error(err.response?.data?.message || 'Failed to submit work');
            if (err.response?.data?.suggestions) {
                setAiFeedback(`AI Suggestion: ${err.response.data.suggestions[0]}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-transparent border-none p-0 backdrop-blur-none">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-accent">
                    <Upload size={18} />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg tracking-tight">Deliver Work</h3>
                    <p className="text-white/20 text-xs mt-1">Submit your final files or live project links</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Description */}
                <div className="space-y-2">
                    <label className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] ml-1">Work Description</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What have you completed? Highlight key updates..."
                        className="w-full h-32 bg-transparent border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:border-accent/30 outline-none transition-all resize-none text-sm"
                    />
                </div>

                {/* Link (Optional) */}
                <div className="space-y-2">
                    <label className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] ml-1">Live Project Link (Optional)</label>
                    <div className="relative">
                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={14} />
                        <input
                            type="text"
                            value={workLink}
                            onChange={(e) => setWorkLink(e.target.value)}
                            placeholder="https://figma.com/..., https://github.com/..."
                            className="w-full bg-transparent border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/10 focus:border-accent/30 outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <label className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] ml-1">Attachments</label>
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-accent/40 hover:bg-accent/5 cursor-pointer transition-all group"
                    >
                        <input 
                            type="file" 
                            multiple 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            className="hidden" 
                        />
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-accent" size={32} />
                                <p className="text-sm font-medium text-white">{uploadProgress}% Uploading...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-white/40 group-hover:bg-accent/20 group-hover:text-accent transition-all">
                                    <Upload size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-medium">Click to upload files</p>
                                    <p className="text-white/40 text-xs mt-1">ZIP, PDF, JPG, PNG, DOCX (Max 5GB)</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-transparent border border-white/10 rounded-xl group transition-all">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-white/30 text-xs">{formatSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeFile(idx)}
                                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex justify-between items-center px-1 pt-2">
                                <p className="text-xs text-white/30 truncate">Total size: {formatSize(totalSize)}</p>
                                <button type="button" onClick={() => setFiles([])} className="text-xs text-red-400/60 hover:text-red-400 font-medium">Clear all</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Feedback */}
                {aiFeedback && (
                    <div className="flex gap-4 p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Sparkles className="text-accent shrink-0" size={18} />
                        <p className="text-accent/90 text-sm leading-relaxed">{aiFeedback}</p>
                    </div>
                )}

                {/* Submit Action */}
                <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale active:scale-[0.98]"
                >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    <span className="text-[12px] uppercase tracking-widest font-bold">{submitting ? 'Verifying Work...' : 'Submit Work Delivery'}</span>
                </button>
            </form>
        </div>
    );
}
