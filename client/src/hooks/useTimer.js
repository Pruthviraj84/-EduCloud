import { useState, useEffect, useRef } from 'react';

export const useTimer = (testId, durationMinutes, onTimeUp) => {
  const storageKey = `exam_timer_${testId}`;
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedEndTime = localStorage.getItem(storageKey);
    if (savedEndTime) {
      const remainingSeconds = Math.max(0, Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000));
      return remainingSeconds;
    }
    const initialSeconds = durationMinutes * 60;
    const endTime = Date.now() + initialSeconds * 1000;
    localStorage.setItem(storageKey, endTime.toString());
    return initialSeconds;
  });

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.removeItem(storageKey);
      if (onTimeUpRef.current) {
        onTimeUpRef.current();
      }
      return;
    }

    const interval = setInterval(() => {
      const savedEndTime = localStorage.getItem(storageKey);
      if (savedEndTime) {
        const remaining = Math.max(0, Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          localStorage.removeItem(storageKey);
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [testId, storageKey, timeLeft]);

  const resetTimer = () => {
    localStorage.removeItem(storageKey);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return { timeLeft, formattedTime, resetTimer };
};
