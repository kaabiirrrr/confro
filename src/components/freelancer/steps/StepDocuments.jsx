import { useState } from "react";
import { motion } from "framer-motion";
import { FiUploadCloud, FiCheckCircle, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { profileApi } from "../../../services/profileApi";
import { toast } from "react-hot-toast";

export default function StepDocuments({ next, back }) {

  const [documents, setDocuments] = useState({
    idFront: null,
    idBack: null,
    resume: null,
    portfolio: null,
    certificates: null
  });

  const [loading, setLoading] = useState(false);

  const handleUpload = (type, files) => {
    // If it's a FileList (from input), convert to array
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (type === 'certificates' || type === 'portfolio') {
      setDocuments({ ...documents, [type]: fileArray });
    } else {
      setDocuments({ ...documents, [type]: fileArray[0] });
    }
  };

  const requiredCompleted = documents.idFront && documents.idBack && documents.resume;

  const handleContinue = async () => {
    setLoading(true);
    try {
      const uploadResults = {};
      
      console.log("[StepDocuments] Starting uploads...");

      const uploadOne = async (file, type) => {
        if (type === 'portfolio') {
          const res = await profileApi.uploadPortfolioItem(file);
          return res.data?.url || res.url;
        }
        const res = await profileApi.uploadDocument(file, type);
        return res.data?.url || res.url;
      };

      const uploadMany = async (files, type) => {
        const urls = [];
        for (const file of files) {
          const url = await uploadOne(file, type);
          urls.push(url);
        }
        return urls;
      };

      if (documents.idFront) {
        uploadResults.idFront = await uploadOne(documents.idFront, 'idFront');
      }

      if (documents.idBack) {
        uploadResults.idBack = await uploadOne(documents.idBack, 'idBack');
      }

      if (documents.resume) {
        uploadResults.resume = await uploadOne(documents.resume, 'resume');
      }

      if (documents.portfolio) {
        if (Array.isArray(documents.portfolio)) {
           uploadResults.portfolio = await uploadMany(documents.portfolio, 'portfolio');
        } else {
           uploadResults.portfolio = await uploadOne(documents.portfolio, 'portfolio');
        }
      }

      if (documents.certificates) {
        if (Array.isArray(documents.certificates)) {
           uploadResults.certificates = await uploadMany(documents.certificates, 'certificates');
        } else {
           uploadResults.certificates = await uploadOne(documents.certificates, 'certificates');
        }
      }

      console.log("[StepDocuments] Finalizing step data...", uploadResults);
      await profileApi.updateStepStatus('documents', { documents: uploadResults });
      
      toast.success("Documents uploaded successfully!");
      next();
    } catch (e) {
      console.error("[StepDocuments] Upload failed:", e);
      const msg = e.response?.data?.message || e.message || "Unknown error";
      toast.error("Failed to upload documents: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({ label, type, required, allowMultiple }) => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white/50 px-1">
        {label} {required && <span className="text-accent">*</span>}
      </p>

      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 cursor-pointer transition-all group ${
        documents[type] ? 'border-accent/40 bg-accent/5' : 'border-white/5 hover:border-white/20 bg-white/[0.01]'
      }`}>
        <div className="flex flex-col items-center gap-2">
          {documents[type] ? (
            <>
              <FiCheckCircle className="text-2xl text-accent" />
              <p className="text-xs font-semibold text-white truncate max-w-[150px]">
                {Array.isArray(documents[type]) 
                  ? `${documents[type].length} files selected` 
                  : documents[type].name}
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                <FiUploadCloud className="text-xl" />
              </div>
              <p className="text-[10px] font-medium text-white/20 group-hover:text-white/40 transition-colors uppercase tracking-widest">
                {allowMultiple ? 'Select Files/Folder' : 'Upload File'}
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          multiple={allowMultiple}
          webkitdirectory={allowMultiple ? "" : undefined}
          onChange={(e) => handleUpload(type, e.target.files)}
        />
      </label>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Verify Your Identity</h2>
        <p className="text-white/40 text-sm">Upload documents to verify your freelancer profile and increase client trust.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UploadBox label="ID Proof (Front)" type="idFront" required />
        <UploadBox label="ID Proof (Back)" type="idBack" required />
        <UploadBox label="Resume / CV" type="resume" required />
        <UploadBox label="Portfolio (Optional)" type="portfolio" allowMultiple />
        <UploadBox label="Certificates (Optional)" type="certificates" allowMultiple />
      </div>

      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
        <p className="text-[10px] text-white/30 flex items-center gap-2 leading-relaxed">
          <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
          Tip: For certificates and portfolio, you can select multiple files or even a folder. Supported: PDF, JPG, PNG, DOCX (Max 25MB).
        </p>
      </div>

      <div className="flex justify-end gap-5 pt-4">
        <button
          onClick={back}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-4 text-white/40 hover:text-white transition-colors text-sm font-semibold"
        >
          <FiArrowLeft />
          Back
        </button>

        <button
          disabled={!requiredCompleted || loading}
          onClick={handleContinue}
          className="bg-accent text-white font-bold px-10 py-4 rounded-full hover:bg-accent/90 disabled:opacity-30 flex items-center gap-3 transition-all shadow-xl shadow-accent/10"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              Continue
              <FiArrowRight />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}