import { useRef, useEffect } from 'react';

export const useFocus = () => {
  const focusRef = useRef();
  useEffect(() => {
    focusRef.current.focus();
  }, []);
  return focusRef;
};
