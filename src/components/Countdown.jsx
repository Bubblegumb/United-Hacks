import { useState, useEffect, useRef } from 'react';
import '../styles/Countdown.css';

/**
 * @typedef {import('./FixtureCard').Match} Match
 */

/**
 * @typedef {Object} TimeLeft
 * @property {number} days
 * @property {number} hours
 * @property {number} minutes
 * @property {number} seconds
 * @property {boolean} expired
 */

function calcTimeLeft(targetMs) {
  const diff = targetMs - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function TimeBlock({ value, unit }) {
  return (
    <div className="clock-unit">
      <div className="clock-digit">{pad(value)}</div>
      <div className="clock-label">{unit}</div>
    </div>
  );
}

function Separator() {
  return <div className="clock-sep">:</div>;
}

function LiveIndicator() {
  return (
    <div className="clock-live" role="status" aria-live="polite">
      <span className="clock-live-dot" aria-hidden="true" />
      <span className="clock-live-text">LIVE</span>
    </div>
  );
}

export default function Countdown({ nextMatch, loading }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!nextMatch) return null;
    return calcTimeLeft(new Date(nextMatch.utcDate).getTime());
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!nextMatch) {
      setTimeLeft(null);
      return;
    }

    const targetMs = new Date(nextMatch.utcDate).getTime();
    setTimeLeft(calcTimeLeft(targetMs));

    intervalRef.current = setInterval(() => {
      const t = calcTimeLeft(targetMs);
      setTimeLeft(t);
      if (t.expired) clearInterval(intervalRef.current);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [nextMatch]);

  if (loading || !nextMatch || !timeLeft) return null;

  if (timeLeft.expired) {
    return <LiveIndicator />;
  }

  return (
    <div className="clock" role="timer" aria-live="off">
      <TimeBlock value={timeLeft.days} unit="DAYS" />
      <Separator />
      <TimeBlock value={timeLeft.hours} unit="HOURS" />
      <Separator />
      <TimeBlock value={timeLeft.minutes} unit="MINS" />
      <Separator />
      <TimeBlock value={timeLeft.seconds} unit="SECS" />
    </div>
  );
}
