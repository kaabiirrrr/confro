import React, { useRef, useState, useCallback } from "react";
import { X, Upload, Camera, Info, ZoomIn, ZoomOut, RotateCw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadAvatar } from "../../../../services/apiService";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import InfinityLoader from '../../../common/InfinityLoader';

const ProfileImageModal = ({ isOpen, onClose, onImageSelect }) => {
  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const CANVAS_SIZE = 300;

  const handleUploadClick = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setImageSrc(ev.target.result); setCropMode(true); setZoom(1); setRotation(0); setOffset({ x: 0, y: 0 }); };
    reader.readAsDataURL(file);
  };

  const drawCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();
    ctx.translate(CANVAS_SIZE / 2 + offset.x, CANVAS_SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
    // Circle mask
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [zoom, rotation, offset]);

  const handleImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const scale = Math.max(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight);
    setZoom(scale);
    setTimeout(drawCrop, 50);
  };

  React.useEffect(() => { if (cropMode) drawCrop(); }, [cropMode, drawCrop]);

  const handleMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const handleMouseMove = (e) => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setDragging(false);

  const handleCropDone = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "avatar.png", { type: "image/png" });
      setUploading(true);
      try {
        const res = await uploadAvatar(file);
        const avatarUrl = res.data?.avatar_url || res.avatar_url || res;
        onImageSelect(avatarUrl);
        toast.success("Profile photo updated");
        setCropMode(false);
        setImageSrc(null);
        onClose();
      } catch (err) {
        toastApiError(err, "Failed to upload image");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    }, "image/png");
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => { setImageSrc(ev.target.result); setCropMode(true); setZoom(1); setRotation(0); setOffset({ x: 0, y: 0 }); }; reader.readAsDataURL(file); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[100] p-4 sm:p-6">
          <motion.div
            drag dragMomentum={false}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-[800px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 pointer-events-auto cursor-default"
          >
            {/* Header */}
            <div className="h-14 px-6 border-b border-white/10 bg-white/5 flex items-center justify-between cursor-move select-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  <Camera size={16} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white font-bold text-[11px] uppercase tracking-[0.2em]">
                    {cropMode ? "Crop Photo" : "Profile Editor"}
                  </h2>
                  <p className="text-white/20 text-[9px] font-medium uppercase tracking-widest">
                    {cropMode ? "Drag to reposition · Scroll to zoom" : "Modalless Window"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setCropMode(false); setImageSrc(null); onClose(); }}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 lg:p-12 bg-gradient-to-br from-transparent to-accent/5">
              {cropMode ? (
                /* -- CROP MODE -- */
                <div className="flex flex-col items-center gap-6">
                  <div className="relative" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                    {imageSrc && (
                      <img ref={imgRef} src={imageSrc} onLoad={handleImgLoad}
                        style={{ display: "none" }} alt="" />
                    )}
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_SIZE} height={CANVAS_SIZE}
                      style={{ borderRadius: "50%", cursor: dragging ? "grabbing" : "grab", border: "2px solid rgba(255,255,255,0.15)" }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4 w-full max-w-xs">
                    <ZoomOut size={16} className="text-white/40 shrink-0" />
                    <input type="range" min={0.5} max={3} step={0.05} value={zoom}
                      onChange={e => { setZoom(parseFloat(e.target.value)); setTimeout(drawCrop, 10); }}
                      className="flex-1 accent-accent" />
                    <ZoomIn size={16} className="text-white/40 shrink-0" />
                    <button onClick={() => { setRotation(r => r + 90); setTimeout(drawCrop, 10); }}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                      <RotateCw size={14} />
                    </button>
                  </div>

                  <div className="flex gap-4 w-full max-w-xs">
                    <button onClick={() => { setCropMode(false); setImageSrc(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">
                      Back
                    </button>
                    <button onClick={handleCropDone} disabled={uploading}
                      className="flex-1 h-11 rounded-xl bg-accent text-white font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2">
                      {uploading ? <InfinityLoader size={20} /> : <Check size={16} />}
                      {uploading ? "Uploading..." : "Apply"}
                    </button>
                  </div>
                </div>
              ) : (
                /* -- UPLOAD MODE -- */
                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                  <div className="w-full lg:w-[320px] shrink-0">
                    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                      onClick={handleUploadClick}
                      className={`relative aspect-square rounded-full border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${dragActive ? "border-accent bg-accent/5" : "border-white/10 hover:border-accent/40 bg-white/[0.02]"}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                      <div className="flex flex-col items-center text-center px-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
                          <Upload size={32} className="text-white/60" />
                        </div>
                        <p className="text-white font-bold text-lg mb-1 tracking-tight">Click or Drag Image</p>
                        <p className="text-white/30 text-xs font-medium">PNG, JPG or WEBP (Max 5MB)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                        Show clients the best <span className="text-accent italic">version</span> of yourself.
                      </h3>
                      <p className="text-white/40 text-sm font-medium leading-relaxed">
                        Maintaining a professional identity is crucial for trust. Your profile photo helps building confidence with potential clients.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                          <Info size={16} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-white text-xs font-bold uppercase tracking-wider">Photo Guidelines</p>
                          <p className="text-white/30 text-[13px] font-medium leading-normal">
                            Must be an actual photo of you. Logos, clip-art, group photos, and digitally altered images are strictly not allowed.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                      <button onClick={handleUploadClick}
                        className="flex-1 h-12 rounded-xl bg-accent text-white font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20">
                        Choose Profile Image
                      </button>
                      <button onClick={onClose}
                        className="px-8 h-12 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <input type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileImageModal;