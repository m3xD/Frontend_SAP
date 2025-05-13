import { useEffect } from "react";

interface UsePreventCheatingProps {
  isActive: boolean;
  onViolationDetected?: () => void;
}

export const usePreventCheating = ({ 
  isActive = true,
  onViolationDetected
}: UsePreventCheatingProps) => {
  
  // Effect to prevent copy/paste, keyboard shortcuts, and text selection
  useEffect(() => {
    if (!isActive) return;

    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Block Windows Snipping Tool (Win+Shift+S)
      if (e.shiftKey && e.key === 'S' && (e.metaKey || e.getModifierState('Meta'))) {
        e.preventDefault();
        return false;
      }
      
      // Block Alt+PrintScreen
      if (e.altKey && (e.key === 'PrintScreen' || e.code === 'PrintScreen')) {
        e.preventDefault();
        return false;
      }
      
      // Block other common screenshot shortcuts
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' ||
          ((e.ctrlKey || e.metaKey) && 
           (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'p'))) {
        e.preventDefault();
        return false;
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Add CSS for preventing text selection
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Cleanup function
    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.head.removeChild(style);
    };
  }, [isActive]);
  
  return {
    isActive
  };
};