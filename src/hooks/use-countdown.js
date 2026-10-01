'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

function pad2(value) {
  return String(Math.max(0, value)).padStart(2, '0');
}

export function useCountdownDate(date) {
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const setNewTime = () => {
      const distanceToNow = Math.max(0, date.valueOf() - Date.now());

      const getDays = Math.floor(distanceToNow / (1000 * 60 * 60 * 24));
      const getHours = Math.floor((distanceToNow % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const getMinutes = Math.floor((distanceToNow % (1000 * 60 * 60)) / (1000 * 60));
      const getSeconds = Math.floor((distanceToNow % (1000 * 60)) / 1000);

      setCountdown({
        days: pad2(getDays),
        hours: pad2(getHours),
        minutes: pad2(getMinutes),
        seconds: pad2(getSeconds),
      });
    };

    setNewTime();
    const interval = setInterval(setNewTime, 1000);
    return () => clearInterval(interval);
  }, [date]);

  return countdown;
}

// Usage
// const countdown = useCountdownDate(new Date('2027-08-08T21:30:00'));

// ----------------------------------------------------------------------

export function useCountdownSeconds(initCountdown) {
  const [countdown, setCountdown] = useState(initCountdown);

  const remainingSecondsRef = useRef(countdown);

  const startCountdown = useCallback(() => {
    remainingSecondsRef.current = countdown;

    const intervalId = setInterval(() => {
      remainingSecondsRef.current -= 1;

      if (remainingSecondsRef.current <= 0) {
        clearInterval(intervalId);
        setCountdown(initCountdown);
      } else {
        setCountdown(remainingSecondsRef.current);
      }
    }, 1000);
  }, [initCountdown, countdown]);

  const counting = initCountdown > countdown;

  return {
    counting,
    countdown,
    startCountdown,
    setCountdown,
  };
}

// Usage
// const { countdown, startCountdown, counting } = useCountdownSeconds(30);
