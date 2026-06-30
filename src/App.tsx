import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioEngine } from './utils/audio';

interface FloatingDot {
  num: number;
  radiusOffset: number; // distance from center (pixels)
  angleOffset: number;  // slight angular offset (degrees)
  swayDuration: number;
  swayX: number;
  swayY: number;
}

// Organic hour positions corresponding to the scattered look in the user's reference image
const scatteredDots: FloatingDot[] = [
  { num: 1, radiusOffset: 85, angleOffset: 5, swayDuration: 7, swayX: 6, swayY: -4 },
  { num: 2, radiusOffset: 125, angleOffset: -8, swayDuration: 8, swayX: -5, swayY: 7 },
  { num: 3, radiusOffset: 120, angleOffset: 2, swayDuration: 6, swayX: 8, swayY: 5 },
  { num: 4, radiusOffset: 75, angleOffset: 12, swayDuration: 9, swayX: -4, swayY: -6 },
  { num: 5, radiusOffset: 110, angleOffset: -5, swayDuration: 11, swayX: 7, swayY: -7 },
  { num: 6, radiusOffset: 135, angleOffset: 3, swayDuration: 10, swayX: -8, swayY: 6 },
  { num: 7, radiusOffset: 75, angleOffset: -10, swayDuration: 12, swayX: 5, swayY: 8 },
  { num: 8, radiusOffset: 125, angleOffset: 6, swayDuration: 7.5, swayX: -6, swayY: -5 },
  { num: 9, radiusOffset: 80, angleOffset: -12, swayDuration: 9.5, swayX: 7, swayY: 6 },
  { num: 10, radiusOffset: 115, angleOffset: 8, swayDuration: 8.5, swayX: -7, swayY: -8 },
  { num: 11, radiusOffset: 105, angleOffset: -4, swayDuration: 10.5, swayX: 5, swayY: -5 },
  { num: 12, radiusOffset: 125, angleOffset: 2, swayDuration: 6.5, swayX: -4, swayY: 8 },
];

export default function App() {
  const [initialDuration, setInitialDuration] = useState(300); // Default 5 minutes (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically handle active background ambient rain + hum mix when running
  useEffect(() => {
    // Silence active channels first to reset
    audioEngine.toggleSound('hum', false);
    audioEngine.toggleSound('rain', false);
    audioEngine.toggleSound('wind', false);
    audioEngine.toggleSound('waves', false);

    if (!isRunning || isCompleted) return;

    // Autoplay our beautiful hifi ambient rain and wind mix when the timer runs
    audioEngine.toggleSound('rain', true);
    audioEngine.setVolume('rain', 0.5);
    audioEngine.toggleSound('hum', true);
    audioEngine.setVolume('hum', 0.35);
    audioEngine.toggleSound('wind', true);
    audioEngine.setVolume('wind', 0.25);
  }, [isRunning, isCompleted]);

  // Cleanup sound generators
  useEffect(() => {
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  // Timer Countdown Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            audioEngine.playChime(); // Singing bowl metallic tone chimes
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Click handler on clock nodes starts/resumes/toggles the timer
  const handleSelectPreset = (minutes: number) => {
    const secs = minutes * 60;
    const isSameMinute = Math.round(initialDuration / 60) === minutes;

    if (isSameMinute) {
      // Toggle play/pause if we click the already selected minute node
      if (isCompleted) {
        setIsCompleted(false);
        setTimeLeft(secs);
        setIsRunning(true);
      } else {
        setIsRunning(!isRunning);
      }
    } else {
      // If clicking a new number, reset to that time and start immediately
      setIsCompleted(false);
      setInitialDuration(secs);
      setTimeLeft(secs);
      setIsRunning(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert hours/minutes to angles for mechanical clock hands
  const currentSeconds = timeLeft % 60;

  // Second sweep angle: smooth 360-degree rotation
  const secondHandRotation = (currentSeconds * 6) + 180;
  // Minute hand angle representing timer countdown remaining progress
  const minuteHandRotation = ((timeLeft / initialDuration) * 360) + 180;

  // Selected equivalent minute representation
  const selectedMinute = Math.round(initialDuration / 60);

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#111111] flex flex-col items-center justify-center font-sans relative select-none p-4 md:p-8">
      
      {/* Aesthetic Background Grid lines to resemble an Architect's Sketchbook or Drafting Paper */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e1dfda_1px,transparent_1px),linear-gradient(to_bottom,#e1dfda_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.25] pointer-events-none" />

      {/* Main Daydreaming Stage & Layout */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 z-10">
        
        {/* LEFT COMPONENT: The Airy, Free Floating Organically Scattered Clock Face (Pure Line Art) */}
        <div style={{ width: '420px', height: '500px' }} className="relative flex items-center justify-center bg-transparent shrink-0">
          
          {/* Subtle Outer Guideline Circles (Line Art Details) */}
          <div className="absolute w-[300px] h-[300px] md:w-[360px] md:h-[360px] rounded-full border border-dashed border-[#111111]/10 pointer-events-none" />
          <div className="absolute w-[220px] h-[220px] md:w-[280px] md:h-[280px] rounded-full border border-[#111111]/15 pointer-events-none" />
          <div className="absolute w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full border border-dashed border-[#111111]/5 pointer-events-none" />

          {/* Render scattered outline hour nodes with gentle floating/swaying animations */}
          {scatteredDots.map((dot) => {
            // Calculate absolute polar coordinate positions
            const baseAngle = (dot.num * 30) - 90; // 30 deg per hour, offset for 12 at top
            const finalAngle = (baseAngle + dot.angleOffset) * (Math.PI / 180);
            
            // Adjust radius scale slightly for responsive layouts
            const baseRadius = dot.radiusOffset;
            const x = Math.cos(finalAngle) * baseRadius;
            const y = Math.sin(finalAngle) * baseRadius;

            const isSelected = selectedMinute === dot.num;

            return (
              <motion.div
                key={dot.num}
                id={`floating-dot-${dot.num}`}
                onClick={() => handleSelectPreset(dot.num)}
                className="absolute cursor-pointer flex items-center justify-center z-10"
                style={{
                  left: `calc(50% + ${x}px - 14px)`,
                  top: `calc(50% + ${y}px - 14px)`,
                }}
                animate={{
                  x: [0, dot.swayX, 0],
                  y: [0, dot.swayY, 0],
                }}
                transition={{
                  duration: dot.swayDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.2, zIndex: 30 }}
                title={`Click to start/pause ${dot.num} Min timer`}
              >
                {/* The beautifully minimalist outline node container */}
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono tracking-tighter relative transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[#111111] text-[#fcfbfa] border border-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-bold' 
                      : 'bg-[#fcfbfa] text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-[#fcfbfa]'
                  }`}
                >
                  {/* Decorative tiny inner dot (from Image 1 style) */}
                  <span className={`absolute left-[5px] top-[11px] w-[3px] h-[3px] rounded-full transition-colors ${
                    isSelected ? 'bg-[#fcfbfa]/80' : 'bg-[#111111]/40'
                  }`} />
                  <span className="translate-x-[3px]">{dot.num}</span>
                </div>

                {/* Concentric helper technical line circle when active */}
                {isSelected && (
                  <motion.div 
                    layoutId="activeCircleOutline"
                    className="absolute -inset-1.5 rounded-full border border-dashed border-[#111111]/40 pointer-events-none"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </motion.div>
            );
          })}

          {/* Minimal Clock Hands (Pure line-art aesthetics) */}
          <div className="relative w-12 h-12 flex items-center justify-center z-20">
            
            {/* Center metal pin cap - minimalist black concentric rings */}
            <div className="w-4 h-4 rounded-full bg-[#fcfbfa] border-2 border-[#111111] flex items-center justify-center shadow-sm z-30">
              <div className="w-1 h-1 rounded-full bg-[#111111]" />
            </div>

            {/* Minute Hand (Continuous line representing remaining progress) */}
            <div 
              className="absolute inset-0 pointer-events-none transition-transform duration-1000 ease-linear"
              style={{ transform: `rotate(${minuteHandRotation}deg)`, height: '170px', top: '-61px' }}
            >
              <div className="w-[1.5px] h-16 bg-[#111111] mx-auto" />
            </div>

            {/* Sweep second hand (Thin delicate vector line with a circular terminal ring) */}
            <div 
              className="absolute inset-0 pointer-events-none transition-transform duration-1000 ease-linear"
              style={{ transform: `rotate(${secondHandRotation}deg)`, height: '230px', top: '-91px' }}
            >
              <div className="w-[1px] h-24 bg-[#111111]/70 mx-auto relative">
                {/* Tiny outline loop ring on the second hand */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-[#111111] bg-[#fcfbfa]" />
              </div>
            </div>
          </div>



        </div>

        {/* RIGHT COMPONENT: Elegant line-drawn tactile display */}
        <div style={{ height: '408.8125px', marginBottom: '-16px' }} className="w-full max-w-sm flex flex-col gap-5">
          
          {/* T3-Style body with flat line boundaries */}
          <div style={{ height: '348.8125px' }} className="bg-[#fcfbfa] border border-[#111111] rounded-[24px] p-6 md:p-8 flex flex-col gap-6 w-full shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative">
            
            {/* Fine Speaker Vent represented as pure minimal line-art circles */}
            <div className="flex flex-col gap-2">
              <span style={{ fontFamily: 'system-ui' }} className="text-[9px] uppercase tracking-[0.2em] text-[#111111]/50 block">
                Chamber Speaker Vent
              </span>
              <div className="grid grid-cols-10 gap-2 p-4 bg-transparent border border-[#111111]/15 rounded-xl">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="aspect-square rounded-full border border-[#111111]/25 transition-colors duration-500" 
                    style={{
                      backgroundColor: isRunning && (i % 4 === 0) ? '#111111' : 'transparent'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Line-drawn high-contrast time box */}
            <div className="border border-[#111111] rounded-2xl p-5 text-center bg-transparent relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isCompleted ? (
                  <motion.div
                    key="finished"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#111111] font-mono font-bold text-base tracking-[0.2em] uppercase py-2"
                  >
                    ✦ COMPLETED ✦
                  </motion.div>
                ) : (
                  <motion.div
                    key="time"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#111111] font-mono text-4xl font-light tracking-widest block"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Minimal Line indicator instead of green LED */}
              <div className="absolute top-2 right-3 flex items-center gap-1.5">
                <span className="text-[8px] font-mono text-[#111111]/40 uppercase tracking-wider">
                  {isRunning ? 'RUN' : 'STOP'}
                </span>
                <div 
                  className={`w-1.5 h-1.5 rounded-full border ${
                    isRunning ? 'bg-[#111111] border-[#111111]' : 'bg-transparent border-[#111111]'
                  }`}
                />
              </div>
            </div>

          </div>

          {/* Quick instructions indicator */}
          <div className="text-center px-4">
            <p style={{ fontFamily: 'system-ui' }} className="text-[10px] text-[#111111]/40 leading-relaxed uppercase tracking-widest">
              Tap any scattered number on the left to start/pause timer.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}
