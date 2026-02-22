import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Stars, Volume2, VolumeX } from 'lucide-react';
import { DeclarationState } from '../types';
import { cn } from '../utils';

interface PreviewProps {
  state: DeclarationState;
  isEditing?: boolean;
}

const FUNNY_MESSAGES = [
    "Tem certeza?",
    "Pensa bem...",
    "Olha o que você está perdendo!",
    "Errou o botão?",
    "Não aceito não como resposta!",
    "Tente de novo!",
    "Quase lá!",
    "Sério mesmo?"
];

export const Preview: React.FC<PreviewProps> = ({ state, isEditing = false }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [daysCount, setDaysCount] = useState(0);
  const [noClickCount, setNoClickCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (state.startDate) {
      const start = new Date(state.startDate);
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      setDaysCount(diff);
    }
  }, [state.startDate]);

  useEffect(() => {
    if (audioRef.current) {
        if (state.musicEnabled && !isMuted && (isOpened || isEditing)) {
            audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [state.musicEnabled, state.musicUrl, isMuted, isOpened, isEditing]);

  const handleOpenEnvelope = () => {
    if (isOpened) return;
    setIsOpened(true);
    setTimeout(() => {
      setShowLetter(true);
    }, 1000);
  };

  const handleYes = () => {
    setAccepted(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fb7185', '#fff']
    });
  };

  const moveNoButton = () => {
    if (isEditing) return;
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    setNoButtonPos({ x, y });
    setNoClickCount(prev => prev + 1);
  };

  if (!isOpened && !isEditing) {
    return (
      <div 
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-700"
        style={{ backgroundColor: state.backgroundColor }}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8"
        >
          <div className="envelope-wrapper" onClick={handleOpenEnvelope}>
            <div className={cn("envelope", isOpened && "open")}>
              <div className="envelope-flap" />
              <div className="envelope-front" />
              <div className="letter-preview" />
            </div>
          </div>
          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-rose-600 font-bold uppercase tracking-widest text-sm"
          >
            Toque para abrir sua carta
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-8 pt-20 pb-32 transition-colors duration-700"
      style={{ backgroundColor: state.backgroundColor, color: state.textColor }}
    >
      {state.musicEnabled && (
          <>
            <audio ref={audioRef} src={state.musicUrl} loop />
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className="fixed top-6 right-6 z-50 p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition-all"
            >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </>
      )}

      {/* Background Animations */}
      <AnimatePresence>
        {(state.animation === 'hearts' && (showLetter || isEditing)) && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: '110vh', x: `${Math.random() * 100}vw`, opacity: 0, scale: 0.5 }}
                animate={{ 
                  y: '-10vh', 
                  opacity: [0, 1, 1, 0],
                  rotate: Math.random() * 360,
                  scale: [0.5, 1, 0.8]
                }}
                transition={{ 
                  duration: 5 + Math.random() * 5, 
                  repeat: Infinity, 
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
                className="absolute text-rose-400/30"
              >
                <Heart size={24 + Math.random() * 40} fill="currentColor" />
              </motion.div>
            ))}
          </div>
        )}
        {(state.animation === 'sparkles' && (showLetter || isEditing)) && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3, 
                  repeat: Infinity, 
                  delay: Math.random() * 2 
                }}
                className="absolute text-yellow-400/40"
              >
                <Stars size={16 + Math.random() * 20} fill="currentColor" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showLetter || isEditing) && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="z-10 max-w-5xl w-full paper-card p-12 md:p-24 text-center space-y-16 shadow-2xl"
          >
        {!accepted ? (
          <>
            {/* Image Gallery - Larger and more dynamic */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.2
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {state.images.map((img, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 40, rotate: idx % 2 === 0 ? -3 : 3 },
                    visible: { 
                      opacity: 1, 
                      scale: 1, 
                      y: 0, 
                      rotate: 0,
                      transition: { type: 'spring', damping: 12 }
                    }
                  }}
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    y: {
                      duration: 4 + idx,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  whileHover={{ scale: 1.1, zIndex: 20, rotate: idx % 2 === 0 ? 1 : -1 }}
                  className={cn(
                    "relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-8 border-white",
                    idx === 0 && "md:col-span-2 lg:col-span-2 lg:row-span-2 aspect-auto min-h-[400px]"
                  )}
                >
                  <img 
                    src={img || "https://picsum.photos/seed/love/800/600"} 
                    alt={`Couple ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              ))}
            </motion.div>

            <div className="space-y-12">
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="font-script text-8xl md:text-[10rem] font-bold leading-none"
                >
                  {state.title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="font-serif text-3xl md:text-4xl italic opacity-80"
                >
                  {state.subtitle}
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="max-w-3xl mx-auto relative px-8"
              >
                <div className="absolute -left-8 -top-8 text-rose-300/30">
                  <Heart size={60} fill="currentColor" />
                </div>
                <p className="font-serif text-2xl md:text-3xl italic opacity-90 leading-relaxed relative z-10">
                  "{state.message}"
                </p>
                <div className="absolute -right-8 -bottom-8 text-rose-300/30">
                  <Heart size={60} fill="currentColor" />
                </div>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="font-script text-5xl md:text-6xl opacity-80 pt-10"
              >
                {state.footer}
              </motion.p>
            </div>

            {state.showCountdown && (
              <div className="py-6 border-y border-rose-200/50">
                <p className="text-xs uppercase tracking-[0.3em] font-sans font-bold opacity-60 mb-2">
                  Nossa história começou há
                </p>
                <p className="text-5xl md:text-6xl font-bold font-serif">
                  {daysCount} dias
                </p>
              </div>
            )}

            {state.occasion === 'proposal' && (
              <div className="flex flex-wrap items-center justify-center gap-8 pt-4 min-h-[120px]">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleYes}
                  className="px-12 py-5 bg-rose-600 text-white rounded-full font-bold text-2xl shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all"
                >
                  {state.buttonTextYes}
                </motion.button>

                <div className="relative">
                  <motion.button
                      animate={noButtonPos}
                      onMouseEnter={moveNoButton}
                      onClick={moveNoButton}
                      className="px-10 py-4 border-2 border-rose-300 text-rose-600 rounded-full font-bold text-lg hover:bg-rose-50 transition-all whitespace-nowrap"
                  >
                      {noClickCount > 0 ? FUNNY_MESSAGES[noClickCount % FUNNY_MESSAGES.length] : state.buttonTextNo}
                  </motion.button>
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-16 space-y-8"
          >
            <div className="flex justify-center">
              <div className="relative">
                <Heart size={160} className="text-rose-600 animate-pulse" fill="currentColor" />
                <Stars className="absolute -top-6 -right-6 text-yellow-500 animate-spin-slow" size={60} />
              </div>
            </div>
            <h2 className="font-script text-8xl font-bold text-rose-600">
              Eu te amo! ❤️
            </h2>
            <p className="font-serif text-3xl italic">
              Você me faz a pessoa mais feliz do mundo!
            </p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-12"
            >
              <button 
                onClick={() => {
                    setAccepted(false);
                    setNoClickCount(0);
                    setNoButtonPos({ x: 0, y: 0 });
                }}
                className="text-sm font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
              >
                Voltar e editar
              </button>
            </motion.div>
          </motion.div>
        )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};
