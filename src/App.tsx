import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Edit3, Eye, Share2, Check, Copy } from 'lucide-react';
import LZString from 'lz-string';
import { supabase } from './lib/supabase';
import { DeclarationState, DEFAULT_STATE } from './types';
import { Preview } from './components/Preview';
import { Editor } from './components/Editor';

export default function App() {
  const [state, setState] = useState<DeclarationState>(DEFAULT_STATE);
  const [isEditing, setIsEditing] = useState(true);
  const [isSharedView, setIsSharedView] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [supabaseId, setSupabaseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load state from URL or Supabase on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('d');
    const id = params.get('id');

    const loadFromSupabase = async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('declarations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Supabase load error:", error.message, error.details);
          return;
        }

        if (data) {
          const mappedState: DeclarationState = {
            title: data.title,
            subtitle: data.subtitle,
            message: data.message,
            footer: data.footer,
            images: data.images,
            musicEnabled: data.music_enabled,
            musicUrl: data.music_url,
            backgroundColor: data.background_color,
            textColor: data.text_color,
            animation: data.animation,
            occasion: data.occasion,
            buttonTextYes: data.button_text_yes,
            buttonTextNo: data.button_text_no,
            startDate: data.start_date,
            showCountdown: data.show_countdown,
          };
          setState(mappedState);
          setSupabaseId(id);
          setIsEditing(false);
          setIsSharedView(true);
        }
      } catch (e) {
        console.error("Unexpected error loading from Supabase:", e);
      }
    };

    if (id) {
      loadFromSupabase(id);
    } else if (data) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(data);
        if (decompressed) {
          const decoded = JSON.parse(decompressed);
          setState(decoded);
          setIsEditing(false);
          setIsSharedView(true);
        }
      } catch (e) {
        console.error("Failed to decode state from URL", e);
      }
    }
  }, []);

  const getShareUrl = () => {
    if (supabaseId) {
      return `${window.location.origin}${window.location.pathname}?id=${supabaseId}`;
    }
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));
    return `${window.location.origin}${window.location.pathname}?d=${compressed}`;
  };

  const handleShare = async () => {
    setIsSaving(true);
    try {
      // Check if Supabase is configured
      const url = (import.meta as any).env.VITE_SUPABASE_URL;
      const isConfigured = url && !url.includes('placeholder');
      
      if (!isConfigured) {
        console.warn("Supabase not configured, using URL compression fallback.");
        setShowShareModal(true);
        return;
      }

      const { data, error } = await supabase
        .from('declarations')
        .insert([{
          title: state.title,
          subtitle: state.subtitle,
          message: state.message,
          footer: state.footer,
          images: state.images,
          music_enabled: state.musicEnabled,
          music_url: state.musicUrl,
          background_color: state.backgroundColor,
          text_color: state.textColor,
          animation: state.animation,
          occasion: state.occasion,
          button_text_yes: state.buttonTextYes,
          button_text_no: state.buttonTextNo,
          start_date: state.startDate,
          show_countdown: state.showCountdown,
        }])
        .select()
        .single();

      if (error) {
        console.error("Supabase save error:", error.message, error.details);
        // We don't block the modal, it will just use the fallback URL
      } else if (data) {
        setSupabaseId(data.id);
      }
    } catch (e) {
      console.error("Unexpected error saving to Supabase:", e);
    } finally {
      setIsSaving(false);
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar todas as alterações?")) {
      setState(DEFAULT_STATE);
      setSupabaseId(null);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Main Content Area */}
      <main className={`flex-1 relative overflow-y-auto transition-all duration-500 ${isEditing ? 'mr-0 md:mr-0' : ''}`}>
        <Preview state={state} isEditing={isEditing} />
        
        {/* Mode Toggle Floating Button - Hidden in shared view */}
        {!isSharedView && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-full p-1">
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
                isEditing ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Edit3 size={18} />
              <span className="font-semibold">Editar</span>
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
                !isEditing ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Eye size={18} />
              <span className="font-semibold">Visualizar</span>
            </button>
          </div>
        )}
      </main>

      {/* Sidebar Editor */}
      <AnimatePresence>
        {isEditing && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full md:w-96 z-40"
          >
            <Editor 
              state={state} 
              onChange={setState} 
              onShare={handleShare} 
              onReset={handleReset}
              isSaving={isSaving}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-rose-100 text-rose-600 rounded-2xl mb-2">
                  <Share2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {isSaving ? 'Salvando...' : 'Tudo pronto!'}
                </h3>
                <p className="text-slate-500">
                  {isSaving ? 'Estamos preparando seu link especial...' : 'Copie o link abaixo e envie para o seu amor.'}
                </p>
              </div>

              {!isSaving && (
                <div className="relative group">
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pr-12 text-sm text-slate-600 break-all line-clamp-3">
                    {getShareUrl()}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
