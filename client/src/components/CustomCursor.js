import { useState, useEffect } from 'react';
import { Utensils, Loader2 } from 'lucide-react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };

    // Listen for custom loading events or check body classes
    const observer = new MutationObserver(() => {
        setIsLoading(document.body.classList.contains('cursor-loading'));
    });
    
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate(-50%, -50%) scale(${isPointer ? 1.5 : 1})`,
        transition: 'transform 0.1s ease-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mixBlendMode: 'difference'
      }}
    >
      {isLoading ? (
        <div className="plate-loader" style={{ animation: 'spin 1s linear infinite' }}>
            {/* SVG for a white plate */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
            </svg>
        </div>
      ) : (
        <div style={{ color: 'white', transform: isPointer ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <Utensils size={24} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}
