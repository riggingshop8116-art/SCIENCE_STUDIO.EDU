import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, User as UserIcon, Camera, CheckCircle2, AlertCircle, 
  Sparkles, BookOpen, Phone, Mail, Save, Image as ImageIcon
} from 'lucide-react';
import { compressImageFile } from '../utils/imageHelper';

interface StudentProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  classLevels?: string[];
}

const DEFAULT_CLASS_LEVELS = [
  "Class 9",
  "Class 10",
  "Class 9-10 (SSC)",
  "HSC 1st Year",
  "HSC 2nd Year",
  "HSC (Examinee)",
  "Admission Test",
  "General Science"
];

export default function StudentProfileModal({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  classLevels = DEFAULT_CLASS_LEVELS
}: StudentProfileModalProps) {
  const [name, setName] = useState(user.name || '');
  const [studentClass, setStudentClass] = useState(user.studentClass || 'HSC 1st Year');
  const [customClass, setCustomClass] = useState('');
  const [phone, setPhone] = useState(user.phone || '');
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || user.avatarUrl || '');
  const [previewPhoto, setPreviewPhoto] = useState(user.photoUrl || user.avatarUrl || '');
  
  const [isCompressing, setIsCompressing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Combine default and custom class choices
  const availableClasses = Array.from(new Set([...DEFAULT_CLASS_LEVELS, ...(classLevels || [])]));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMsg('');
      const compressedDataUrl = await compressImageFile(file, 600, 600, 0.85);
      setPhotoUrl(compressedDataUrl);
      setPreviewPhoto(compressedDataUrl);
    } catch (err: any) {
      console.error("Image compression error:", err);
      setErrorMsg("ছবি আপলোড করতে সমস্যা হয়েছে। অন্য একটি ফাইল চেষ্টা করুন।");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg("আপনার নাম দেওয়া বাধ্যতামূলক।");
      return;
    }

    const finalClass = studentClass === 'Other' ? customClass.trim() : studentClass.trim();
    if (!finalClass) {
      setErrorMsg("শ্রেণী বা ক্লাস নির্বাচন অথবা নাম লিখুন।");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('science_studio_token') || `token-${user.id}`;
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          studentClass: finalClass,
          photoUrl: photoUrl || previewPhoto,
          phone: phone.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "প্রোফাইল সেভ করতে ব্যর্থ হয়েছে।");
      }

      const updatedUser: User = {
        ...user,
        name: data.user.name,
        studentClass: data.user.studentClass,
        photoUrl: data.user.photoUrl || data.user.avatarUrl,
        avatarUrl: data.user.photoUrl || data.user.avatarUrl,
        phone: data.user.phone
      };

      // Save updated user to localStorage for instant reload persistence
      try {
        localStorage.setItem('science_studio_user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error(err);
      }

      onUpdateUser(updatedUser);
      setSuccessMsg("আপনার প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!");

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error("Profile submit error:", err);
      setErrorMsg(err.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#0e1628] border-2 border-cyan-400/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-[0_0_50px_rgba(34,211,238,0.25)] overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow corner decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-sm">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <span>প্রোফাইল সম্পাদনা</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-300">
                আপনার নাম, ছবি এবং ক্লাস লেভেল আপডেট করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-900/90 border-2 border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/15 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all duration-300 cursor-pointer group"
            title="বন্ধ করুন (Close)"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-cyan-300 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          {/* Avatar Upload / Preview Section */}
          <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-slate-900 flex items-center justify-center shrink-0 group">
              {previewPhoto ? (
                <img 
                  src={previewPhoto} 
                  alt={name || "Student"} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <UserIcon className="w-12 h-12 text-cyan-400/60" />
              )}
              
              <label 
                htmlFor="avatar-upload-input"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
              >
                <Camera className="w-5 h-5 text-cyan-300 mb-0.5" />
                <span>ছবি বদলান</span>
              </label>
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              <label
                htmlFor="avatar-upload-input"
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm btn-shine"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>{isCompressing ? 'ছবি প্রসেস হচ্ছে...' : 'ছবি আপলোড করুন (Upload Photo)'}</span>
              </label>
              <input 
                id="avatar-upload-input"
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
              />
              <span className="text-[10px] text-slate-400 font-sans">
                স্বচ্ছ ও স্পষ্ট ছবি নির্বাচন করুন (JPG, PNG)
              </span>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>আপনার নাম (Full Name):</span>
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: আফ্রিদি হাসান"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Class / Grade Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>শ্রেণী / ক্লাস (Class / Grade Level):</span>
            </label>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-emerald-300 text-sm font-medium focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-950 text-white">
                  {cls}
                </option>
              ))}
              <option value="Other" className="bg-slate-950 text-amber-300">অন্যান্য (Custom Class)</option>
            </select>

            {studentClass === 'Other' && (
              <input 
                type="text"
                value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                placeholder="আপনার শ্রেনী বা ব্যাচ লিখুন (যেমন: HSC 2026 Batch)"
                className="w-full mt-2 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 placeholder-slate-500 text-xs focus:outline-none"
              />
            )}
          </div>

          {/* Mobile Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>মোবাইল নম্বর (Phone Number):</span>
            </label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01712345678"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none font-mono transition-colors"
            />
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>ইমেইল এড্রেস (Read-only):</span>
            </label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-slate-400 text-xs font-mono cursor-not-allowed opacity-80"
            />
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-500/15 border-2 border-white/10 hover:border-rose-400/60 text-slate-300 hover:text-rose-300 font-bold text-xs transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading || isCompressing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer border border-cyan-300/40 transition-all btn-shine disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'সেভ হচ্ছে...' : 'প্রোফাইল সেভ করুন'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
