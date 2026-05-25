import React, { useRef, useState, useCallback } from "react";
import { X, Upload, Camera, Info, ZoomIn, ZoomOut, RotateCw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadAvatar } from "../../../../services/apiService";
import { toast } from "react-hot-toast";
import { toastApiError } from "../../../../utils/apiErrorToast";
import InfinityLoader from '../../../common/InfinityLoader';

const CANVAS_SIZE = 220;

const ProfileImageModal = ({ isOpen, onClose, onImageSelect }) => {
  const fileRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleUploadClick = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target.result);
      setCropMode(true);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
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
    const actualScale = baseScale * zoom;
    ctx.scale(actualScale, actualScale);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [zoom, baseScale, rotation, offset]);

  const handleImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const scale = Math.max(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight);
    setBaseScale(scale);
    setZoom(1);
  };

  React.useEffect(() => { if (cropMode) drawCrop(); }, [cropMode, drawCrop]);

  const handleDragStart = (clientX, clientY) => {
    setDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };
  const handleDragMove = (clientX, clientY) => {
    if (!dragging) return;
    setOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };
  const handleDragEnd = () => setDragging(false);

  const handleMouseDown = (e) => handleDragStart(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleDragMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleDragEnd();

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e) => {
    if (dragging) e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };
  const handleTouchEnd = () => handleDragEnd();

  const handleCropDone = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      try {
        if (!blob) {
          toast.error("Failed to process image crop. Please try another image.");
          return;
        }
        
        let fileOrBlob;
        try {
            fileOrBlob = new File([blob], "avatar.png", { type: "image/png" });
        } catch (e) {
            fileOrBlob = blob; // Fallback for environments where File constructor is not supported
            fileOrBlob.name = "avatar.png";
        }
        
        setUploading(true);
        const res = await uploadAvatar(fileOrBlob);
        const avatarUrl = res?.data?.avatar_url || res?.avatar_url || res;
        
        if (!avatarUrl) {
            throw new Error("No URL returned from server.");
        }
        
        onImageSelect(avatarUrl);
        toast.success("Profile photo updated");
        setCropMode(false);
        setImageSrc(null);
        onClose();
      } catch (err) {
        console.error("Crop/Upload error:", err);
        const msg = err?.response?.data?.message || err.message || "Failed to upload image";
        toast.error(msg);
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
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target.result);
        setCropMode(true);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => { setCropMode(false); setImageSrc(null); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-start justify-center pt-0 sm:pt-24 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="bg-secondary border border-white/10 w-full sm:max-w-lg rounded-t-xl sm:rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="relative w-full h-14 flex items-center justify-center mt-2">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-0.5">
                  <Camera size={14} className="text-accent shrink-0" />
                  <p className="text-white font-bold text-[11px] uppercase tracking-widest">
                    {cropMode ? "Crop Photo" : "Profile Editor"}
                  </p>
                </div>
                <p className="text-white/40 text-[9px]">
                  {cropMode ? "Drag to reposition" : "Update your profile photo"}
                </p>
              </div>
              
              <button onClick={handleClose}
                className="absolute top-1/2 -translate-y-1/2 right-5 text-white/40 hover:text-accent transition-colors shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {cropMode ? (
                /* Crop mode */
                <div className="flex flex-col items-center gap-5">
                  <div style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                    {imageSrc && <img ref={imgRef} src={imageSrc} onLoad={handleImgLoad} style={{ display: "none" }} alt="" />}
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_SIZE}
                      height={CANVAS_SIZE}
                      style={{ borderRadius: "50%", cursor: dragging ? "grabbing" : "grab", border: "2px solid rgba(255,255,255,0.15)", touchAction: "none" }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    />
                  </div>

                  {/* Zoom + rotate */}
                  <div className="flex items-center gap-3 w-full">
                    <ZoomOut size={14} className="text-white/40 shrink-0" />
                    <input type="range" min={1} max={3} step={0.05} value={zoom}
                      onChange={e => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-accent" />
                    <ZoomIn size={14} className="text-white/40 shrink-0" />
                    <button onClick={() => setRotation(r => r + 90)}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all shrink-0">
                      <RotateCw size={13} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => { setCropMode(false); setImageSrc(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="flex-1 h-11 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all">
                      Back
                    </button>
                    <button onClick={handleCropDone} disabled={uploading}
                      className="flex-1 h-11 rounded-full bg-accent text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                          Uploading...
                        </>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload mode */
                <div className="space-y-5 flex flex-col items-center">
                  {/* Upload zone */}
                  <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag}
                    onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={handleUploadClick}
                    className={`w-40 h-40 rounded-full border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      dragActive ? "border-accent bg-accent/5" : "border-white/10 hover:border-accent/40"
                    }`}
                  >
                    <Upload size={24} className="text-white/40" />
                    <p className="text-white font-bold text-sm">Click or Drag</p>
                    <p className="text-white/30 text-[10px]">PNG, JPG up to 5MB</p>
                  </div>

                  {/* Info */}
                  <div className="text-center w-full">
                    <h3 className="text-lg font-bold text-white leading-snug mb-1">
                      Profile Photo
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      A clear photo builds trust with clients.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 w-full">
                    <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-white/40 text-xs leading-relaxed">
                      Must be an actual photo of you. Logos, group photos, and altered images are not allowed.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-3 pb-2 w-full">
                    <button onClick={handleUploadClick}
                      className="w-full h-11 rounded-full bg-accent text-white font-bold text-sm hover:opacity-90 transition-all">
                      Choose Profile Image
                    </button>
                    <button onClick={handleClose}
                      className="w-full h-11 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all">
                      Cancel
                    </button>
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
