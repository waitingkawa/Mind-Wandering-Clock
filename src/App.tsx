import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {useEffect, useRef, useState} from 'react';
import {audioEngine} from './utils/audio';

type Theme = 'light' | 'dark';

interface ClockNode {
  minute: number;
  swayDuration: number;
  swayX: number;
  swayY: number;
}

const clockNodes: ClockNode[] = [
  {minute: 1, swayDuration: 7.2, swayX: 3, swayY: -4},
  {minute: 2, swayDuration: 8.4, swayX: -4, swayY: 3},
  {minute: 3, swayDuration: 6.8, swayX: 4, swayY: 2},
  {minute: 4, swayDuration: 9.1, swayX: -3, swayY: -4},
  {minute: 5, swayDuration: 10.4, swayX: 3, swayY: -3},
  {minute: 6, swayDuration: 8.7, swayX: -4, swayY: 3},
  {minute: 7, swayDuration: 9.8, swayX: 3, swayY: 4},
  {minute: 8, swayDuration: 7.6, swayX: -3, swayY: -3},
  {minute: 9, swayDuration: 8.9, swayX: 4, swayY: 2},
  {minute: 10, swayDuration: 9.5, swayX: -4, swayY: -3},
  {minute: 11, swayDuration: 8.2, swayX: 3, swayY: -4},
  {minute: 12, swayDuration: 7.1, swayX: -3, swayY: 3},
];

const DOT_COUNT = 60;
const DOT_COLUMNS = 10;

function getInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem('mind-wandering-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs]
    .map((unit) => unit.toString().padStart(2, '0'))
    .join(':');
}

export default function App() {
  const [initialDuration, setInitialDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endsAtRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('mind-wandering-theme', theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#101112' : '#e6e0d7');
  }, [theme]);

  useEffect(() => {
    audioEngine.toggleSound('hum', false);
    audioEngine.toggleSound('rain', false);
    audioEngine.toggleSound('wind', false);
    audioEngine.toggleSound('waves', false);

    if (!isRunning || isCompleted) return;

    audioEngine.toggleSound('rain', true);
    audioEngine.setVolume('rain', 0.5);
    audioEngine.toggleSound('hum', true);
    audioEngine.setVolume('hum', 0.35);
    audioEngine.toggleSound('wind', true);
    audioEngine.setVolume('wind', 0.25);
  }, [isRunning, isCompleted]);

  useEffect(() => {
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      if (endsAtRef.current === null) {
        endsAtRef.current = Date.now() + timeLeft * 1000;
      }

      const updateTimer = () => {
        const remaining = Math.max(
          0,
          Math.ceil(((endsAtRef.current ?? Date.now()) - Date.now()) / 1000),
        );

        setTimeLeft(remaining);

        if (remaining === 0) {
          endsAtRef.current = null;
          setIsRunning(false);
          setIsCompleted(true);
          audioEngine.playChime();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 250);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleSelectPreset = (minutes: number) => {
    audioEngine.unlock();

    const seconds = minutes * 60;
    const selectedMinute = Math.round(initialDuration / 60);
    const isSameMinute = selectedMinute === minutes;

    if (isSameMinute) {
      if (isCompleted) {
        setIsCompleted(false);
        setTimeLeft(seconds);
        endsAtRef.current = Date.now() + seconds * 1000;
        setIsRunning(true);
        return;
      }

      endsAtRef.current = isRunning ? null : Date.now() + timeLeft * 1000;
      setIsRunning(!isRunning);
      return;
    }

    setIsCompleted(false);
    setInitialDuration(seconds);
    setTimeLeft(seconds);
    endsAtRef.current = Date.now() + seconds * 1000;
    setIsRunning(true);
  };

  const toggleTimer = () => {
    audioEngine.unlock();

    if (isCompleted) {
      setIsCompleted(false);
      setTimeLeft(initialDuration);
      endsAtRef.current = Date.now() + initialDuration * 1000;
      setIsRunning(true);
      return;
    }

    endsAtRef.current = isRunning ? null : Date.now() + timeLeft * 1000;
    setIsRunning(!isRunning);
  };

  const selectedMinute = Math.round(initialDuration / 60);
  const elapsedSeconds = initialDuration - timeLeft;
  const elapsedRatio = Math.min(1, Math.max(0, elapsedSeconds / initialDuration));
  const filledDots = isCompleted ? DOT_COUNT : Math.ceil(elapsedRatio * DOT_COUNT);
  const minuteHandRotation = (timeLeft / initialDuration) * 360 + 180;
  const secondHandRotation = (timeLeft % 60) * 6 + 180;

  return (
    <div className="desktop-drag-surface app-shell">
      <div className="desktop-drag-handle" aria-hidden="true">
        <span />
      </div>

      <header className="app-header">
        <div className="brand-lockup">
          <span className="eyebrow">Mind-Wandering / 001</span>
          <h1>
            Follow
            <span>The Pause</span>
          </h1>
        </div>

        <button
          className="desktop-no-drag theme-switch"
          type="button"
          onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          aria-label={`Switch to ${theme === 'light' ? 'night' : 'day'} mode`}
          aria-pressed={theme === 'dark'}
        >
          <span>{theme === 'light' ? 'Day' : 'Night'}</span>
          <span className="switch-track" aria-hidden="true">
            <span className="switch-thumb" />
          </span>
        </button>
      </header>

      <main className="clock-layout">
        <section className="clock-stage" aria-label="Choose a timer duration">
          <div className="dial-guide dial-guide-outer" aria-hidden="true" />
          <div className="dial-guide dial-guide-inner" aria-hidden="true" />
          <span className="dial-label dial-label-top" aria-hidden="true">12</span>
          <span className="dial-label dial-label-right" aria-hidden="true">03</span>
          <span className="dial-label dial-label-bottom" aria-hidden="true">06</span>
          <span className="dial-label dial-label-left" aria-hidden="true">09</span>

          {clockNodes.map((node) => {
            const angle = (node.minute * 30 - 90) * (Math.PI / 180);
            const radius = 142;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const selected = selectedMinute === node.minute;

            return (
              <motion.button
                key={node.minute}
                className={`desktop-no-drag clock-node ${selected ? 'is-selected' : ''}`}
                type="button"
                onClick={() => handleSelectPreset(node.minute)}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
                animate={reduceMotion ? undefined : {
                  x: [0, node.swayX, 0],
                  y: [0, node.swayY, 0],
                }}
                transition={reduceMotion ? undefined : {
                  duration: node.swayDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={reduceMotion ? undefined : {scale: 1.08}}
                aria-label={`${node.minute} minute timer${selected ? ', selected' : ''}`}
                aria-pressed={selected}
              >
                <span className="node-speck" aria-hidden="true" />
                <span>{node.minute}</span>
              </motion.button>
            );
          })}

          <div className="clock-hands" aria-hidden="true">
            <div className="center-pin">
              <span />
            </div>
            <div
              className="hand-layer hand-layer-minute"
              style={{transform: `rotate(${minuteHandRotation}deg)`}}
            >
              <span className="minute-hand" />
            </div>
            <div
              className="hand-layer hand-layer-second"
              style={{transform: `rotate(${secondHandRotation}deg)`}}
            >
              <span className="second-hand">
                <span />
              </span>
            </div>
          </div>

          <div className="clock-caption">
            <span>Selected interval</span>
            <strong>{selectedMinute.toString().padStart(2, '0')} MIN</strong>
          </div>
        </section>

        <section className="timer-console" aria-label="Timer progress">
          <div className="timer-readout">
            <div>
              <span>Elapsed</span>
              <time dateTime={`PT${elapsedSeconds}S`}>{formatDuration(elapsedSeconds)}</time>
            </div>
            <div className="remaining-readout">
              <span>Remaining</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.time
                  key={isCompleted ? 'completed' : 'running'}
                  dateTime={`PT${timeLeft}S`}
                  initial={reduceMotion ? false : {opacity: 0, y: 5}}
                  animate={{opacity: 1, y: 0}}
                  exit={reduceMotion ? undefined : {opacity: 0, y: -5}}
                >
                  {isCompleted ? 'COMPLETE' : formatDuration(timeLeft)}
                </motion.time>
              </AnimatePresence>
            </div>
          </div>

          <div
            className="dot-matrix"
            role="progressbar"
            aria-label="Elapsed timer progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(elapsedRatio * 100)}
          >
            {Array.from({length: DOT_COUNT}).map((_, index) => {
              const row = Math.floor(index / DOT_COLUMNS);
              const column = index % DOT_COLUMNS;
              const pathPosition = row % 2 === 0
                ? row * DOT_COLUMNS + column
                : row * DOT_COLUMNS + (DOT_COLUMNS - 1 - column);
              const filled = pathPosition < filledDots;

              return (
                <span
                  key={index}
                  className={`progress-dot ${filled ? 'is-filled' : ''}`}
                  aria-hidden="true"
                />
              );
            })}
          </div>

          <div className="console-footer">
            <div className="status-copy" aria-live="polite">
              <span className={`status-pip ${isRunning ? 'is-live' : ''}`} />
              <span>
                {isCompleted
                  ? 'A small pause, completed.'
                  : isRunning
                    ? 'Follow the line. Let the mind wander.'
                    : timeLeft < initialDuration
                      ? 'Pause held. Begin again when ready.'
                      : 'Choose a circle, then take your pause.'}
              </span>
            </div>

            <button
              type="button"
              className="desktop-no-drag timer-toggle"
              onClick={toggleTimer}
            >
              {isCompleted ? 'Again' : isRunning ? 'Pause' : 'Begin'}
            </button>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <span>Nature sounds / Rain + wind + low hum</span>
        <span>Tap any numbered circle to begin</span>
      </footer>
    </div>
  );
}
