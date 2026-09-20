import React, { useState } from 'react';
import { PersonCard, Rarity } from '../types';
import { Card } from './Card';
import { soundManager } from '../utils/audio';
import { saveCustomCard, createCardInSupabase } from '../utils/storage';
import { uploadCardPhoto } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Sparkles, Plus, Image as ImageIcon, Loader2, ShieldCheck, Crown, Heart, Film } from 'lucide-react';

interface AdminAddCardModalProps {
  onClose: () => void;
  onCardAdded: (newCard: PersonCard) => void;
}

const SAMPLE_PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
];

export const AdminAddCardModal: React.FC<AdminAddCardModalProps> = ({
  onClose,
  onCardAdded,
}) => {
  const { isConfigured } = useAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('1990-08-15');
  const [age, setAge] = useState(34);
  const [beautyRate, setBeautyRate] = useState(95);
  const [moviesInput, setMoviesInput] = useState('La La Land, Cruella');
  const [rarity, setRarity] = useState<Rarity>('RARE');
  const [category, setCategory] = useState('HOLLYWOOD');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(SAMPLE_PRESET_PHOTOS[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    if (isConfigured) {
      const { url, error } = await uploadCardPhoto(file);
      if (url) {
        setPhoto(url);
        setUploading(false);
        return;
      } else {
        console.warn('Supabase storage fallback to dataUrl:', error);
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhoto(event.target.result);
        setErrorMsg('');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const parsedMovies = moviesInput
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  const previewCard: PersonCard = {
    id: `custom-${Date.now()}`,
    name: name.trim() || 'Actress Name',
    dateOfBirth: dob.trim() || '1990-01-01',
    age: Number(age) || 30,
    beautyRate: Number(beautyRate) || 95,
    movies: parsedMovies.length > 0 ? parsedMovies : ['Iconic Film'],
    photo,
    rarity,
    category: category.trim().toUpperCase() || 'CINEMA',
    description: description.trim() || 'An acclaimed performer in the Actress Card Collection vault.',
    cardNumber: `#A${Math.floor(Math.random() * 900 + 100)}`,
    background: 'linear-gradient(135deg, #450a0a, #7f1d1d)',
    accent: '#ef4444',
    stats: {
      charisma: Number(beautyRate),
      energy: 88,
      style: 92,
    },
    custom: true,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please provide an actress name.');
      return;
    }

    setSaving(true);
    soundManager.playCollectionAdded();

    if (isConfigured) {
      const { card: createdDbCard, error } = await createCardInSupabase(previewCard);
      if (createdDbCard) {
        saveCustomCard(createdDbCard);
        onCardAdded(createdDbCard);
        setSaving(false);
        onClose();
        return;
      }

      setSaving(false);
      setErrorMsg(error || 'Card could not be saved to Supabase catalog.');
      return;
    }

    saveCustomCard(previewCard);
    onCardAdded(previewCard);
    setSaving(false);
    onClose();
  };

  return (
    <div
      id="admin-add-card-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-3xl bg-[#120204] border border-red-500/40 p-6 shadow-2xl flex flex-col lg:flex-row items-center gap-8 my-auto"
      >
        {/* Close Button */}
        <button
          id="close-add-card-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/30 flex items-center justify-center text-red-200 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Live Card Preview */}
        <div className="shrink-0 flex flex-col items-center">
          <span className="text-xs font-mono tracking-widest text-red-300 font-bold uppercase mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Live Card Preview
          </span>
          <Card card={previewCard} size="md" interactiveTilt={true} />
        </div>

        {/* Right: Form inputs */}
        <form onSubmit={handleSubmit} className="flex-1 w-full flex flex-col gap-3.5 text-xs font-mono">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold mb-1.5 border border-amber-500/30">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>ADMIN CATALOG MINTING</span>
            </div>
            <h2 className="text-2xl font-black font-serif uppercase tracking-wide text-white">
              MINT ACTRESS CARD
            </h2>
            <p className="text-red-200/70 font-sans text-xs mt-0.5">
              Add new cards into the master booster pack catalog with photo, birthdate, and filmography.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Photo upload / presets */}
          <div>
            <label className="block text-red-200 font-bold mb-1.5 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-red-400" /> Photo (Upload or Preset)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/40 border border-red-500/40 text-red-200 font-bold cursor-pointer transition-all">
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
                <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {SAMPLE_PRESET_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhoto(preset)}
                  className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    photo === preset ? 'border-red-400 scale-110 shadow-md shadow-red-500/50' : 'border-white/20 opacity-60'
                  }`}
                >
                  <img src={preset} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name, DOB & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-red-200 font-bold mb-1">Actress Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Margot Robbie"
                required
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-500/30 text-white focus:outline-hidden focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-red-200 font-bold mb-1">Date of Birth</label>
              <input
                type="text"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-500/30 text-white focus:outline-hidden focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-red-200 font-bold mb-1">Age</label>
              <input
                type="number"
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-500/30 text-white focus:outline-hidden focus:border-red-400"
              />
            </div>
          </div>

          {/* Rarity & Beauty Rate Slider */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-red-200 font-bold mb-1">Rarity Tier</label>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value as Rarity)}
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-red-500/30 text-white focus:outline-hidden focus:border-red-400 cursor-pointer"
              >
                <option value="COMMON">COMMON</option>
                <option value="RARE">RARE</option>
                <option value="SPECIAL">SPECIAL</option>
                <option value="EPIC">EPIC</option>
                <option value="LEGENDARY">LEGENDARY</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400 fill-red-400" /> Beauty Rate
                </span>
                <span className="text-white font-bold">{beautyRate} / 100</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={beautyRate}
                onChange={(e) => setBeautyRate(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Movies */}
          <div>
            <label className="block text-red-200 font-bold mb-1 flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-red-400" /> Famous Movies (comma-separated)
            </label>
            <input
              type="text"
              value={moviesInput}
              onChange={(e) => setMoviesInput(e.target.value)}
              placeholder="e.g. Barbie, The Wolf of Wall Street, Babylon"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-500/30 text-white focus:outline-hidden focus:border-red-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-red-200 font-bold mb-1">Bio / Profile Dossier</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief bio summarizing her cinematic legacy..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-red-500/30 text-white focus:outline-hidden focus:border-red-400 font-sans text-xs"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black tracking-widest text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/40 transition-all disabled:opacity-50 border border-red-400/40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{saving ? 'SAVING TO MASTER CATALOG...' : 'MINT ACTRESS CARD & ADD TO BOOSTER'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
