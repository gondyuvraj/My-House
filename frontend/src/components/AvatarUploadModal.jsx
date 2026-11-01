import React, { useState, useRef } from 'react';
import { 
  X, UploadCloud, Camera, Link as LinkIcon, Check, 
  Sparkles, RotateCcw, AlertCircle, Image as ImageIcon, Loader2 
} from 'lucide-react';
import apiClient from '../api/client';
import { AVATAR_PRESETS, getDisplayAvatar } from '../utils/avatarPresets';
import toast from 'react-hot-toast';

export default function AvatarUploadModal({
  isOpen,
  onClose,
  currentAvatar,
  userName = "User",
  userEmail = "user@example.com",
  userRole = "seeker",
  onAvatarUpdated
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url' | 'presets'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Upload file to backend
  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please choose a photo to upload first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // 1. Try dedicated avatar upload
      const res = await apiClient.post('/uploads/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newAvatarUrl = res.data.avatar_url;
      toast.success("Profile photo uploaded successfully!");
      if (onAvatarUpdated) {
        onAvatarUpdated(newAvatarUrl);
      }
      handleClose();
    } catch (err) {
      // Fallback to general upload endpoint
      try {
        const fallbackData = new FormData();
        fallbackData.append('files', selectedFile);
        const res2 = await apiClient.post('/uploads', fallbackData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const savedUrl = res2.data[0];
        if (onAvatarUpdated) {
          await onAvatarUpdated(savedUrl);
        }
        toast.success("Profile photo uploaded successfully!");
        handleClose();
      } catch (err2) {
        console.error("Upload error:", err2);
        toast.error(err2.response?.data?.detail || "Failed to upload image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply custom URL
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      toast.error("Please enter a valid image web URL");
      return;
    }

    setLoading(true);
    try {
      if (onAvatarUpdated) {
        await onAvatarUpdated(urlInput.trim());
      }
      toast.success("Profile picture updated from URL!");
      handleClose();
    } catch (err) {
      toast.error("Failed to update profile picture.");
    } finally {
      setLoading(false);
    }
  };

  // Apply selected preset
  const handlePresetSelect = async (preset) => {
    setSelectedPreset(preset.url);
    setLoading(true);
    try {
      if (onAvatarUpdated) {
        await onAvatarUpdated(preset.url);
      }
      toast.success(`Applied ${preset.label}!`);
      handleClose();
    } catch (err) {
      toast.error("Failed to apply avatar preset.");
    } finally {
      setLoading(false);
    }
  };

  // Reset to default Dicebear generated avatar
  const handleResetDefault = async () => {
    const defaultUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail || 'user')}`;
    setLoading(true);
    try {
      if (onAvatarUpdated) {
        await onAvatarUpdated(defaultUrl);
      }
      toast.success("Reverted to default generated avatar!");
      handleClose();
    } catch (err) {
      toast.error("Failed to reset avatar.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUrlInput('');
    setSelectedPreset(null);
    onClose();
  };

  const activeDisplay = previewUrl || (activeTab === 'url' && urlInput) || getDisplayAvatar(currentAvatar, userEmail);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-50/50 to-indigo-50/30 dark:from-rose-950/20 dark:to-indigo-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-soft">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Update Profile Photo</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userRole === 'owner' ? 'Host & Lister Profile' : 'Room Seeker Profile'} • {userName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current / Live Preview Section */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <img
                src={activeDisplay}
                alt="Avatar Preview"
                className="w-16 h-16 rounded-2xl border-2 border-rose-500/80 object-cover shadow-md bg-white dark:bg-slate-800"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`;
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow">
                ✓
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Live Photo Preview</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Visible to roommates, hosters, and in conversations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDefault}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Reset to default cartoon avatar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-3 space-x-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Device Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curated Avatars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Web Image Link</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">

          {/* TAB 1: UPLOAD PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                  dragActive
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
                
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    Click to browse or drag & drop photo here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP (Max 10MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60">
                    <Check className="w-3.5 h-3.5" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={loading || !selectedFile}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-rose-600 to-indigo-600 shadow-soft hover:shadow-glow transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? "Uploading Photo..." : "Save Profile Photo"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CURATED AVATARS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a ready-to-use persona tailored for hosts, students, and working flatmates:
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                {AVATAR_PRESETS.map((preset) => {
                  const isCurrent = (currentAvatar === preset.url) || (selectedPreset === preset.url);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`group relative p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center space-y-1.5 ${
                        isCurrent
                          ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-14 h-14 rounded-xl object-cover shadow-xs group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1 leading-tight">
                        {preset.label}
                      </span>
                      {isCurrent && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE WEB URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Direct Image Web URL (HTTPS)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Paste any public direct image URL from Unsplash, LinkedIn, Imgur, or cloud storage.
                </p>
              </div>

              {urlInput && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`;
                    }}
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Image URL Verified</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">{urlInput}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !urlInput.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-rose-600 to-indigo-600 shadow-soft hover:shadow-glow transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? "Applying URL..." : "Apply Photo Link"}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center">
            <Sparkles className="w-3 h-3 text-rose-500 mr-1.5" />
            Updates automatically across your listings, chats & roommate profile
          </span>
          <span className="font-bold text-rose-600">{userRole === 'owner' ? 'Host' : 'Seeker'}</span>
        </div>
      </div>
    </div>
  );
}

