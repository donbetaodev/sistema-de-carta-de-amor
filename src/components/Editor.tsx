import React, { useState, useCallback } from 'react';
import { Heart, Image as ImageIcon, Type, Palette, Calendar, Play, Music, RotateCcw, Upload, Gift, Crop, X, Check, Database, AlertCircle } from 'lucide-react';
import { DeclarationState, AnimationType, OccasionType } from '../types';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../cropUtils';

interface EditorProps {
  state: DeclarationState;
  onChange: (newState: DeclarationState) => void;
  onShare: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ state, onChange, onShare, onReset, isSaving = false }) => {
  const [isAdjusting, setIsAdjusting] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleChange = (key: keyof DeclarationState, value: any) => {
    onChange({ ...state, [key]: value });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...state.images];
    newImages[index] = value;
    handleChange('images', newImages);
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert("Apenas formatos JPEG e PNG são suportados.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleImageChange(index, reader.result as string);
      setIsAdjusting(index); // Open adjuster after upload
    };
    reader.readAsDataURL(file);
  };

  const saveCroppedImage = async () => {
    try {
      if (croppedAreaPixels && isAdjusting !== null && state.images[isAdjusting]) {
        const croppedImage = await getCroppedImg(state.images[isAdjusting], croppedAreaPixels);
        handleImageChange(isAdjusting, croppedImage);
        setIsAdjusting(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("O áudio deve ter no máximo 5MB para garantir que o link possa ser compartilhado.");
      return;
    }

    if (file.type !== 'audio/mpeg' && !file.name.endsWith('.mp3')) {
      alert("Apenas arquivos MP3 são suportados.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('musicUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-2xl overflow-y-auto">
      <div className="p-6 border-b border-slate-100 flex flex-col gap-4 bg-rose-50/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 text-rose-700">
            <Heart size={20} fill="currentColor" />
            Personalizar
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              title="Resetar para o padrão"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={onShare}
              disabled={isSaving}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? 'Salvando...' : 'Compartilhar'}
            </button>
          </div>
        </div>

        {/* Database Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
          {(() => {
            const url = (import.meta as any).env.VITE_SUPABASE_URL;
            const isConfigured = url && !url.includes('placeholder');
            return isConfigured ? (
              <>
                <Database size={12} className="text-green-500" />
                <span className="text-slate-600">Banco de Dados Conectado</span>
              </>
            ) : (
              <>
                <AlertCircle size={12} className="text-amber-500" />
                <span className="text-amber-600">Banco de Dados Não Configurado</span>
              </>
            );
          })()}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Occasion */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Gift size={14} /> Ocasião
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'declaration', label: 'Declaração de Amor' },
              { id: 'proposal', label: 'Pedido de Namoro' },
              { id: 'anniversary', label: 'Aniversário de Casamento' }
            ].map((occ) => (
              <button
                key={occ.id}
                onClick={() => handleChange('occasion', occ.id as OccasionType)}
                className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${
                  state.occasion === occ.id
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50'
                }`}
              >
                {occ.label}
              </button>
            ))}
          </div>
        </section>

        {/* Texts */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Type size={14} /> Textos
          </label>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Título</label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Subtítulo</label>
              <input
                type="text"
                value={state.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Mensagem Principal</label>
              <textarea
                value={state.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Rodapé / Assinatura</label>
              <input
                type="text"
                value={state.footer}
                onChange={(e) => handleChange('footer', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Visuals */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ImageIcon size={14} /> Fotos (Até 5)
          </label>
          <div className="space-y-6">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-xs font-bold text-slate-400">Foto {index + 1}</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors border-2 border-dashed border-slate-200">
                    <Upload size={16} />
                    <span className="text-xs font-semibold">Upload</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="hidden"
                    />
                  </label>
                  {state.images[index] && (
                    <button
                      onClick={() => setIsAdjusting(index)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors border border-rose-200"
                      title="Ajustar imagem"
                    >
                      <Crop size={18} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={state.images[index]?.startsWith('data:') ? 'Imagem carregada localmente' : state.images[index]}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="Ou cole uma URL aqui"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-xs"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Fundo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={state.backgroundColor}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="h-10 w-full rounded cursor-pointer border-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={state.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="h-10 w-full rounded cursor-pointer border-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Music */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Music size={14} /> Música
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Ativar música</span>
              <input
                type="checkbox"
                checked={state.musicEnabled}
                onChange={(e) => handleChange('musicEnabled', e.target.checked)}
                className="w-5 h-5 accent-rose-600"
              />
            </div>
            {state.musicEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Arquivo MP3</label>
                  <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors border-2 border-dashed border-slate-300">
                    <Upload size={18} />
                    <span className="text-sm font-semibold">Upload MP3</span>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Ou URL do MP3</label>
                  <input
                    type="text"
                    value={state.musicUrl.startsWith('data:') ? 'Áudio carregado localmente' : state.musicUrl}
                    onChange={(e) => handleChange('musicUrl', e.target.value)}
                    placeholder="https://exemplo.com/musica.mp3"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Animation */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Play size={14} /> Animação
          </label>
          <div className="flex flex-wrap gap-2">
            {(['hearts', 'sparkles', 'none'] as AnimationType[]).map((anim) => (
              <button
                key={anim}
                onClick={() => handleChange('animation', anim)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  state.animation === anim
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {anim === 'hearts' ? 'Corações' : anim === 'sparkles' ? 'Brilhos' : 'Nenhuma'}
              </button>
            ))}
          </div>
        </section>

        {/* Buttons */}
        {state.occasion === 'proposal' && (
          <section className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Palette size={14} /> Botões
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Botão Sim</label>
                <input
                  type="text"
                  value={state.buttonTextYes}
                  onChange={(e) => handleChange('buttonTextYes', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Botão Não</label>
                <input
                  type="text"
                  value={state.buttonTextNo}
                  onChange={(e) => handleChange('buttonTextNo', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>
          </section>
        )}

        {/* Date */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar size={14} /> Contador
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Mostrar contador</span>
              <input
                type="checkbox"
                checked={state.showCountdown}
                onChange={(e) => handleChange('showCountdown', e.target.checked)}
                className="w-5 h-5 accent-rose-600"
              />
            </div>
            {state.showCountdown && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Data de início</label>
                <input
                  type="date"
                  value={state.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Image Adjuster Modal */}
      {isAdjusting !== null && state.images[isAdjusting] && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Ajustar Imagem {isAdjusting + 1}</h3>
              <button onClick={() => setIsAdjusting(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 relative bg-slate-900">
              <Cropper
                image={state.images[isAdjusting]}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAdjusting(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCroppedImage}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Salvar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
