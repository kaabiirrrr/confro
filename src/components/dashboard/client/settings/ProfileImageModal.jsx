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
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="bg-secondary border border-white/10 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Camera size={18} className="text-accent shrink-0" />
                <div>
                  <p className="text-white font-bold text-xs uppercase tracking-widest">
                    {cropMode ? "Crop Photo" : "Profile Editor"}
                  </p>
                  <p className="text-white/30 text-[10px]">
                    {cropMode ? "Drag to reposition" : "Update your profile photo"}
                  </p>
                </div>
              </div>
              <button onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0">
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
                      style={{ borderRadius: "50%", cursor: dragging ? "grabbing" : "grab", border: "2px solid rgba(255,255,255,0.15)" }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>

                  {/* Zoom + rotate */}
                  <div className="flex items-center gap-3 w-full">
                    <ZoomOut size={14} className="text-white/40 shrink-0" />
                    <input type="range" min={0.5} max={3} step={0.05} value={zoom}
                      onChange={e => { setZoom(parseFloat(e.target.value)); setTimeout(drawCrop, 10); }}
                      className="flex-1 accent-accent" />
                    <ZoomIn size={14} className="text-white/40 shrink-0" />
                    <button onClick={() => { setRotation(r => r + 90); setTimeout(drawCrop, 10); }}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all shrink-0">
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
                      className="flex-1 h-11 rounded-full bg-accent text-white font-bold text-sm shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                      {uploading ? <InfinityLoader size={18} /> : <Check size={15} />}
                      {uploading ? "Uploading..." : "Apply"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload mode */
                <div className="space-y-5">
                  {/* Upload zone */}
                  <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag}
                    onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={handleUploadClick}
                    className={`w-full h-36 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      dragActive ? "border-accent bg-accent/5" : "border-white/10 hover:border-accent/40"
                    }`}
                  >
                    <Upload size={24} className="text-white/40" />
                    <p className="text-white font-bold text-sm">Click or Drag Image</p>
                    <p className="text-white/30 text-xs">PNG, JPG or WEBP · Max 5MB</p>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-lg font-black text-white leading-snug">
                      Show clients the best <span className="text-accent italic">version</span> of yourself.
                    </h3>
                    <p className="text-white/40 text-sm mt-1 leading-relaxed">
                      Your profile photo builds confidence with potential clients.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-white/40 text-xs leading-relaxed">
                      Must be an actual photo of you. Logos, group photos, and altered images are not allowed.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-3 pb-2">
                    <button onClick={handleUploadClick}
                      className="w-full h-11 rounded-full bg-accent text-white font-bold text-sm shadow-lg shadow-accent/20 hover:opacity-90 transition-all">
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
