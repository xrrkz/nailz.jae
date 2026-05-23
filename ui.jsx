// ui.jsx — shared building blocks for nailz.jae

// ─────────────────────────────────────────────────────────────
// Icons (single stroke, 22x22)
// ─────────────────────────────────────────────────────────────
const Icon = {
  home: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>
    </svg>
  ),
  grid: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  calendar: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/>
    </svg>
  ),
  sparkle: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>
      <path d="M19 3l.6 1.7L21 5.3l-1.4.6L19 7.6l-.6-1.7L17 5.3l1.4-.6L19 3z"/>
    </svg>
  ),
  more: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||22} height={p.size||22} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>
    </svg>
  ),
  back: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||20} height={p.size||20} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||20} height={p.size||20} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||20} height={p.size||20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7"/>
    </svg>
  ),
  copy: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  instagram: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||20} height={p.size||20} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none"/>
    </svg>
  ),
  facebook: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||20} height={p.size||20} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h-2a4 4 0 0 0-4 4v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h2V3z"/>
    </svg>
  ),
  snapchat: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||20} height={p.size||20} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.75c3.04 0 5.25 2.3 5.25 5.35 0 .9-.05 1.8-.1 2.5-.03.4.16.62.5.78.36.17.92.32 1.3.45.42.14.55.36.55.6 0 .47-.6.78-1.6 1.08-.5.15-.93.27-1.13.6-.13.22-.18.5-.3.83-.13.36-.36.55-.78.55-.42 0-.95-.16-1.6-.16-.83 0-1.32.2-1.95.78-.7.65-1.32 1.18-2.14 1.18s-1.44-.53-2.14-1.18c-.63-.58-1.12-.78-1.95-.78-.65 0-1.18.16-1.6.16-.42 0-.65-.19-.78-.55-.12-.33-.17-.61-.3-.83-.2-.33-.63-.45-1.13-.6-1-.3-1.6-.61-1.6-1.08 0-.24.13-.46.55-.6.38-.13.94-.28 1.3-.45.34-.16.53-.38.5-.78-.05-.7-.1-1.6-.1-2.5 0-3.05 2.21-5.35 5.25-5.35z"/>
      <circle cx="9.5" cy="10" r="0.6" fill="currentColor" stroke="none"/>
      <circle cx="14.5" cy="10" r="0.6" fill="currentColor" stroke="none"/>
    </svg>
  ),
  cog: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||20} height={p.size||20} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
    </svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  trash: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  message: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  mail: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
// Wordmark — the brand logo
// ─────────────────────────────────────────────────────────────
function Wordmark({ size = 38, color, style = {} }) {
  return (
    <span className="wordmark" style={{ fontSize: size, color, ...style }}>
      nailz<span className="dot">.</span>jae
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// AppBar — top bar with optional back button & title
// ─────────────────────────────────────────────────────────────
function AppBar({ title, onBack, right }) {
  return (
    <div className="appbar">
      {onBack ? (
        <button className="appbar-back" onClick={onBack} aria-label="Back">
          <Icon.back />
        </button>
      ) : <div style={{ width: 38 }}/>}
      {title && <div className="h-card" style={{ fontSize: 17, fontStyle: 'italic' }}>{title}</div>}
      <div style={{ width: 38, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom tab bar
// ─────────────────────────────────────────────────────────────
function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'home',     label: 'Home',     icon: Icon.home },
    { id: 'gallery',  label: 'Gallery',  icon: Icon.grid },
    { id: 'services', label: 'Services', icon: Icon.sparkle },
    { id: 'contact',  label: 'Contact',  icon: Icon.more },
  ];
  return (
    <nav className="tabbar">
      {tabs.map(t => {
        const Ico = t.icon;
        return (
          <button key={t.id} className={active === t.id ? 'is-active' : ''} onClick={() => onChange(t.id)}>
            <span className="ic"><Ico /></span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// Sheet — bottom sheet modal
// ─────────────────────────────────────────────────────────────
function Sheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="sheet" onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="sheet-body">
        <div className="sheet-handle"/>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CopyButton — copy to clipboard with feedback
// ─────────────────────────────────────────────────────────────
function CopyButton({ value, label = 'Copy' }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button className="copy-btn" onClick={() => {
      try {
        navigator.clipboard?.writeText(value);
      } catch (e) {}
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }}>
      <Icon.copy/>
      {copied ? 'Copied' : label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// PriceTag
// ─────────────────────────────────────────────────────────────
function PriceTag({ amount, size = 22 }) {
  return (
    <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: size, color: 'var(--cream)' }}>
      ${amount}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// NailTile — placeholder visual for nail photo with subtle gradient
// ─────────────────────────────────────────────────────────────
function NailTile({ slotId, src, caption, tall = false, onClick }) {
  return (
    <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <image-slot
        id={slotId}
        shape="rounded"
        radius="14"
        placeholder={caption || 'tap to add photo'}
        src={src || undefined}
        style={{
          aspectRatio: tall ? '3 / 8.4' : '3 / 4',
          width: '100%',
          display: 'block',
        }}
      ></image-slot>
    </div>
  );
}

// expose
Object.assign(window, {
  Icon, Wordmark, AppBar, TabBar, Sheet, CopyButton, PriceTag, NailTile,
});
