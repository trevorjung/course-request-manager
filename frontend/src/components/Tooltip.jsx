import { useState, useRef } from 'react';

export default function Tooltip({ content, children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  function handleMouseEnter() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
    setVisible(true);
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
        className="cursor-default"
      >
        {children}
      </span>
      {visible && (
        <div
          className="fixed z-50 max-w-sm bg-slate-900 text-slate-100 text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
        >
          {content}
        </div>
      )}
    </>
  );
}
