import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce updates to a value over a specific delay.
 * Useful for limiting API calls on keypress search inputs.
 * 
 * @param {any} value - The input value to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {any} The debounced value.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout on unmount or if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
