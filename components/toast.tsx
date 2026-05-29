'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'approve' | 'discard' | 'save';
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const styles = {
    approve: 'border-[#22C48A] text-[#22C48A] bg-[#0E2A1A]',
    discard: 'border-[#E8A838] text-[#E8A838] bg-[#2A1A0E]',
    save: 'border-[#22C48A] text-[#22C48A] bg-[#0E2A1A]',
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full border transition-all duration-300 ${
        styles[type]
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
