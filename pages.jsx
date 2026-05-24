// pages.jsx — Home, Gallery, Services, Contact

// ─────────────────────────────────────────────────────────────
// GalleryCycle — animated carousel that crossfades through portfolio
// ─────────────────────────────────────────────────────────────
function GalleryCycle({ items, onTap }) {
  const [idx, setIdx] = React.useState(0);
  const count = items.length;
  const reduce = typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  React.useEffect(() => {
    if (count < 2 || reduce) return;
    const id = setInterval(() => setIdx(i => (i + 1) % count), 2800);
    return () => clearInterval(id);
  }, [count, reduce]);

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onTap}
      className="gallery-cycle"
      aria-label="View gallery"
    >
      <div className="gallery-cycle-stage">
        {items.map((g, i) => (
          <img
            key={g.id}
            src={g.src}
            alt=""
            className={'gallery-cycle-img' + (i === idx ? ' is-active' : '')}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchpriority={i === 0 ? 'high' : 'auto'}
          />
        ))}
      </div>
      {count > 1 && (
        <div className="gallery-cycle-dots" aria-hidden="true">
          {items.map((_, i) => (
            <span key={i} className={'gcd' + (i === idx ? ' is-on' : '')}/>
          ))}
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Home
// ─────────────────────────────────────────────────────────────
function HomePage({ go }) {
  const [state] = useStore();
  const next = nextOpenDay(state.availability);
  return (
    <div className="scroll">
      <div className="safe-top"></div>

      {/* Hero */}
      <div style={{ padding: '30px 24px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }} className="hero-line">
          <span className="tiny" style={{ color: 'var(--rose-deep)' }}>✶ {state.settings.psaShort}</span>
          <span style={{ width: 14 }}/>
        </div>

        <div className="hero-mark"><Wordmark size={68}/></div>
        <div className="h-eyebrow hero-eyebrow" style={{ marginTop: 18, color: 'var(--ink-mute)' }}>by jaelyn ervin</div>

        <p className="body hero-body" style={{ marginTop: 22, color: 'var(--ink)', maxWidth: 320 }}>
          {state.settings.welcome}
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 26 }} className="hero-ctas">
          <button className="btn btn-primary" onClick={() => go('book')} style={{ flex: 1 }}>
            Book now <Icon.arrow/>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => go('services')}>
            Menu
          </button>
        </div>

        {next && (
          <div className="card-tight hero-next" style={{ marginTop: 22, background: 'rgba(201, 142, 142, 0.10)', border: '1px solid rgba(201, 142, 142, 0.28)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
            <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em' }}>NEXT AVAILABLE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
              <div className="h-card" style={{ fontSize: 18 }}>{fmtDateLong(parseYmd(next))}</div>
              <button onClick={() => go('book')} style={{ background: 'transparent', border: 0, color: 'var(--espresso)', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                Reserve →
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => go('appts')}
          className="card-tight"
          style={{
            marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: 'transparent', border: '1px dashed var(--line-2)',
            borderRadius: 'var(--r-md)', padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
            color: 'var(--ink)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon.calendar size={18}/>
            <div>
              <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>ALREADY BOOKED?</div>
              <div className="h-card" style={{ fontSize: 14, marginTop: 2 }}>See my appointments</div>
            </div>
          </div>
          <Icon.arrow size={14}/>
        </button>
      </div>

      {/* Sets preview */}
      <div style={{ padding: '28px 24px 0' }}>
        <div className="row-between" style={{ marginBottom: 14 }}>
          <div className="grow">
            <div className="h-eyebrow" style={{ marginBottom: 4 }}>recent work</div>
            <div className="h-section">Sets I've Done</div>
          </div>
          <button onClick={() => go('gallery')} className="copy-btn" style={{ textTransform: 'none', letterSpacing: '0.04em' }}>
            See all
          </button>
        </div>
        <GalleryCycle items={state.gallery.sets.filter(g => g.src)} onTap={() => go('gallery')}/>
      </div>

      {/* Services preview */}
      <div style={{ padding: '32px 24px 0' }}>
        <div className="row-between" style={{ marginBottom: 14 }}>
          <div className="grow">
            <div className="h-eyebrow" style={{ marginBottom: 4 }}>menu</div>
            <div className="h-section">Services</div>
          </div>
          <button onClick={() => go('services')} className="copy-btn" style={{ textTransform: 'none', letterSpacing: '0.04em' }}>
            View all
          </button>
        </div>
        <div className="stack">
          {SERVICE_BUILDER.types.map(t => (
            <button key={t.id} className="card" onClick={() => go('book')} style={{ width: '100%', textAlign: 'left' }}>
              <div className="row-between">
                <div className="grow">
                  <div className="h-card" style={{ marginTop: 4, fontSize: 18 }}>{t.label}</div>
                  <div className="body-mute" style={{ marginTop: 4 }}>
                    {t.id === 'full-set' && 'French tip, full paint, custom design, or jems/charms'}
                    {t.id === 'fill-in' && 'My work or foreign work — with design options'}
                    {t.id === 'soak-off' && 'My work or foreign work'}
                  </div>
                </div>
                <Icon.arrow size={16}/>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing info */}
      <div style={{ padding: '36px 24px 12px' }}>
        <div className="card" style={{ background: 'rgba(201, 142, 142, 0.08)', border: '1px solid rgba(201, 142, 142, 0.22)' }}>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>pricing guide</div>

          <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em', marginBottom: 6 }}>LENGTH</div>
          <div className="body-mute" style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>0–2 (Short)</span><b style={{ color: 'var(--espresso)' }}>$55</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>3–4 (Medium)</span><b style={{ color: 'var(--espresso)' }}>$60</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>5–7 (Long)</span><b style={{ color: 'var(--espresso)' }}>$65</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>8–10 (X-Long)</span><b style={{ color: 'var(--espresso)' }}>$70</b></div>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }}/>

          <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em', marginBottom: 6 }}>SHAPE (BOTH HANDS)</div>
          <div className="body-mute" style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Square</span><b style={{ color: 'var(--espresso)' }}>$0</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tapered Square</span><b style={{ color: 'var(--espresso)' }}>+$2</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Coffin</span><b style={{ color: 'var(--espresso)' }}>+$3</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Lipstick</span><b style={{ color: 'var(--espresso)' }}>+$2</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Stiletto</span><b style={{ color: 'var(--espresso)' }}>+$4</b></div>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }}/>

          <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em', marginBottom: 6 }}>DESIGNS</div>
          <div className="body-mute" style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Polish & french tip / easy designs</span><b style={{ color: 'var(--espresso)' }}>$0</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bling (5–10+ gems)</span><b style={{ color: 'var(--espresso)' }}>+$4</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>More than 2 charms</span><b style={{ color: 'var(--espresso)' }}>+$1</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Glitter</span><b style={{ color: 'var(--espresso)' }}>+$1</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cateye</span><b style={{ color: 'var(--espresso)' }}>+$2</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>3D art</span><b style={{ color: 'var(--espresso)' }}>+$1</b></div>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }}/>

          <p className="body-mute" style={{ margin: 0, fontSize: 12, fontStyle: 'italic' }}>
            All final pricing will be discussed during appt aside from ${state.settings.depositAmount} no-show deposit.
          </p>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <div className="card" style={{ background: 'transparent', borderStyle: 'dashed' }}>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>before booking</div>
          <p className="body-mute" style={{ margin: 0 }}>
            A <b style={{ color: 'var(--espresso)' }}>${state.settings.depositAmount} no-show deposit</b> is required to secure your appointment. Deposits are non-refundable.
          </p>
        </div>
      </div>

      <div style={{ height: 110 }}/>
    </div>
  );
}

function nextOpenDay(av) {
  const today = ymd(new Date());
  const keys = Object.keys(av).sort();
  for (const k of keys) {
    if (k < today) continue;
    if (av[k].open && av[k].slots.length > 0) return k;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Gallery
// ─────────────────────────────────────────────────────────────
function GalleryPage({ go }) {
  const [state] = useStore();
  const [tab, setTab] = React.useState('sets');
  const [lightboxIdx, setLightboxIdx] = React.useState(null);

  const items = state.gallery[tab];
  // only items with a photo are navigable in the lightbox
  const viewable = items.filter(g => g.src);

  return (
    <div className="scroll">
      <div className="safe-top"></div>
      <div style={{ padding: '20px 24px 14px' }}>
        <div className="h-eyebrow">portfolio</div>
        <div className="h-display" style={{ fontSize: 44, marginTop: 6 }}>Sets I've Done</div>
        <p className="body-mute" style={{ marginTop: 10 }}>Tap any photo to view it full-size.</p>

        <div className="admin-pill" style={{ marginTop: 18 }}>
          <button className={tab === 'sets' ? 'is-active' : ''} onClick={() => setTab('sets')}>Sets · {state.gallery.sets.filter(g => g.src).length}</button>
          <button className={tab === 'retention' ? 'is-active' : ''} onClick={() => setTab('retention')}>Retention · {state.gallery.retention.filter(g => g.src).length}</button>
        </div>
      </div>

      <div style={{ padding: '8px 20px 20px' }}>
        {tab === 'retention' && (
          <div className="card-tight" style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'rgba(201, 142, 142, 0.10)', border: '1px solid rgba(201, 142, 142, 0.28)' }}>
            <p className="body-mute" style={{ margin: 0 }}>
              <b style={{ color: 'var(--espresso)' }}>Retention </b>matters. These photos show how my sets look at the 2–3 week mark.
            </p>
          </div>
        )}

        {viewable.length === 0 ? (
          <div className="card" style={{ background: 'transparent', borderStyle: 'dashed', textAlign: 'center', padding: 32 }}>
            <Icon.grid size={28}/>
            <div className="body-mute" style={{ marginTop: 10 }}>No photos yet.</div>
            <div className="tiny" style={{ marginTop: 4, color: 'var(--ink-faint)' }}>Jae can add some from the admin panel.</div>
          </div>
        ) : (
          <div key={tab} className="gallery-grid stagger">
            {viewable.map((g, i) => (
              <button
                key={g.id}
                onClick={() => setLightboxIdx(i)}
                className="gallery-tile"
                style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
                aria-label="View photo"
              >
                <img
                  src={g.src}
                  alt=""
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchpriority={i === 0 ? 'high' : 'auto'}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        <button className="btn btn-rose btn-block" onClick={() => go('book')}>
          Book a set like this <Icon.arrow/>
        </button>
      </div>

      <div style={{ height: 110 }}/>

      {lightboxIdx !== null && (
        <Lightbox
          items={viewable}
          index={lightboxIdx}
          onChange={setLightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onBook={(item) => {
            setLightboxIdx(null);
            go('book', { inspirationSrc: item.src, inspirationId: item.id });
          }}
        />
      )}
    </div>
  );
}

function Lightbox({ items, index, onChange, onClose, onBook }) {
  const cur = items[index];
  if (!cur) return null;

  // keyboard nav
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onChange(index - 1);
      if (e.key === 'ArrowRight' && index < items.length - 1) onChange(index + 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, items.length, onChange, onClose]);

  // touch swipe
  const touchX = React.useRef(null);
  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && index < items.length - 1) onChange(index + 1);
      if (dx > 0 && index > 0) onChange(index - 1);
    }
    touchX.current = null;
  }

  return (
    <div className="lightbox">
      {/* top bar */}
      <div className="lightbox-bar">
        <button
          onClick={onClose}
          aria-label="Close"
          className="lightbox-close"
        >
          <Icon.close size={20}/>
        </button>
        <div className="tiny" style={{ color: 'rgba(243,234,219,.8)', letterSpacing: '0.14em', fontWeight: 500 }}>
          {index + 1} / {items.length}
        </div>
        <div style={{ width: 44 }}/>
      </div>

      {/* image */}
      <div
        className="lightbox-img-wrap"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img key={cur.id} src={cur.src} alt="" className="lightbox-img" decoding="async"/>
      </div>

      {/* nav arrows */}
      {index > 0 && (
        <button
          className="lightbox-nav lightbox-prev"
          onClick={() => onChange(index - 1)}
          aria-label="Previous"
        >
          <Icon.back size={22}/>
        </button>
      )}
      {index < items.length - 1 && (
        <button
          className="lightbox-nav lightbox-next"
          onClick={() => onChange(index + 1)}
          aria-label="Next"
        >
          <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Icon.back size={22}/></span>
        </button>
      )}

      {/* bottom CTA — Book this set */}
      {onBook && (
        <div className="lightbox-cta">
          <button className="btn btn-rose btn-block" onClick={() => onBook(cur)}>
            I want this set <Icon.arrow/>
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────
function ServicesPage({ go }) {
  const [state] = useStore();

  const serviceDescriptions = {
    'full-set': {
      desc: 'New acrylic full set — choose your length, shape, and design.',
      options: SERVICE_BUILDER.designs.map(d => d.label),
    },
    'fill-in': {
      desc: 'Acrylic fill-in — my work or foreign work.',
      options: [...SERVICE_BUILDER.origins.map(o => o.label), ...SERVICE_BUILDER.designs.map(d => d.label)],
    },
    'soak-off': {
      desc: 'Full soak-off removal.',
      options: SERVICE_BUILDER.origins.map(o => o.label),
    },
  };

  return (
    <div className="scroll page-enter">
      <div className="safe-top"></div>
      <div style={{ padding: '20px 24px 14px' }}>
        <div className="h-eyebrow">menu</div>
        <div className="h-display" style={{ fontSize: 44, marginTop: 6 }}>Build<br/>Your Set</div>
        <p className="body-mute" style={{ marginTop: 12 }}>
          All sets include shaping, cuticle care, and a top-coat finish. All final pricing will be discussed during your appointment.
        </p>
      </div>

      <div style={{ padding: '14px 24px 0' }} className="stack stagger">
        {SERVICE_BUILDER.types.map(t => {
          const info = serviceDescriptions[t.id];
          return (
            <div key={t.id} className="card" style={{ padding: 16 }}>
              <div className="h-card" style={{ fontSize: 20 }}>{t.label}</div>
              <div className="body-mute" style={{ marginTop: 4, fontSize: 13 }}>{info.desc}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {info.options.map(opt => (
                  <span key={opt} className="chip" style={{ fontSize: 12 }}>{opt}</span>
                ))}
              </div>
              <button className="btn btn-primary btn-block" onClick={() => go('book')} style={{ marginTop: 14 }}>
                Book {t.label} <Icon.arrow/>
              </button>
            </div>
          );
        })}
      </div>

      {/* Pricing guide */}
      <div style={{ padding: '28px 24px 12px' }}>
        <div className="card" style={{ background: 'rgba(201, 142, 142, 0.08)', border: '1px solid rgba(201, 142, 142, 0.22)' }}>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>pricing guide</div>

          <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em', marginBottom: 6 }}>LENGTH</div>
          <div className="body-mute" style={{ fontSize: 13, lineHeight: 1.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>0–2 (Short)</span><b style={{ color: 'var(--espresso)' }}>$55</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>3–4 (Medium)</span><b style={{ color: 'var(--espresso)' }}>$60</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>5–7 (Long)</span><b style={{ color: 'var(--espresso)' }}>$65</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>8–10 (X-Long)</span><b style={{ color: 'var(--espresso)' }}>$70</b></div>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }}/>

          <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em', marginBottom: 6 }}>SHAPE (BOTH HANDS)</div>
          <div className="body-mute" style={{ fontSize: 13, lineHeight: 1.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Square</span><b style={{ color: 'var(--espresso)' }}>$0</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tapered Square</span><b style={{ color: 'var(--espresso)' }}>+$2</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Coffin</span><b style={{ color: 'var(--espresso)' }}>+$3</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Lipstick</span><b style={{ color: 'var(--espresso)' }}>+$2</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Stiletto</span><b style={{ color: 'var(--espresso)' }}>+$4</b></div>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }}/>

          <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em', marginBottom: 6 }}>DESIGNS</div>
          <div className="body-mute" style={{ fontSize: 13, lineHeight: 1.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Polish & french tip / easy designs</span><b style={{ color: 'var(--espresso)' }}>$0</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bling (5–10+ gems)</span><b style={{ color: 'var(--espresso)' }}>+$4</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>More than 2 charms</span><b style={{ color: 'var(--espresso)' }}>+$1</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Glitter</span><b style={{ color: 'var(--espresso)' }}>+$1</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cateye</span><b style={{ color: 'var(--espresso)' }}>+$2</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>3D art</span><b style={{ color: 'var(--espresso)' }}>+$1</b></div>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }}/>

          <p className="body-mute" style={{ margin: 0, fontSize: 12, fontStyle: 'italic' }}>
            All final pricing will be discussed during appt aside from ${state.settings.depositAmount} no-show deposit.
          </p>
        </div>
      </div>

      <div style={{ height: 110 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Contact
// ─────────────────────────────────────────────────────────────
function ContactPage({ go }) {
  const socials = [
    { id: 'ig1',  label: 'Instagram',         handle: '@nailz.jae',       icon: Icon.instagram,  href: 'https://instagram.com/nailz.jae' },
    { id: 'ig2',  label: 'Instagram',         handle: '@jaelynervin_',    icon: Icon.instagram,  href: 'https://instagram.com/jaelynervin_' },
    { id: 'fb',   label: 'Facebook',          handle: 'Jaelyn Ervin',     icon: Icon.facebook,   href: 'https://www.facebook.com/jaelyn.ervin' },
    { id: 'sc',   label: 'Snapchat',          handle: 'jaelyn-ervin5',    icon: Icon.snapchat,   href: 'https://www.snapchat.com/add/jaelyn-ervin5' },
  ];
  return (
    <div className="scroll page-enter">
      <div className="safe-top"></div>
      <div style={{ padding: '20px 24px 14px' }}>
        <div className="h-eyebrow">say hi</div>
        <div className="h-display" style={{ fontSize: 44, marginTop: 6 }}>Let's<br/>connect</div>
        <p className="body-mute" style={{ marginTop: 12 }}>
          Book online above, or message me on any of my socials and we'll figure it out from there.
        </p>
      </div>

      <div style={{ padding: '14px 24px 24px' }} className="stack stagger">
        {socials.map(s => {
          const Ico = s.icon;
          return (
            <a key={s.id} href={s.href} target="_blank" rel="noreferrer" className="card social-card" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: 'inherit' }}>
              <div className="social-icon">
                <Ico size={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="tiny" style={{ color: 'var(--ink-mute)' }}>{s.label}</div>
                <div className="h-card" style={{ fontSize: 17, marginTop: 2 }}>{s.handle}</div>
              </div>
              <Icon.arrow size={16}/>
            </a>
          );
        })}
      </div>

      <div style={{ padding: '8px 24px 24px' }}>
        <div className="card" style={{ background: 'transparent', borderStyle: 'dashed', textAlign: 'center' }}>
          <Wordmark size={32} style={{ display: 'block', marginBottom: 8 }}/>
          <div className="body-mute" style={{ fontSize: 12 }}>nailzjae.tech</div>
        </div>
      </div>

      <div style={{ height: 110 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// My Appointments — look up your bookings by email
// ─────────────────────────────────────────────────────────────
const APPTS_CONTACT_KEY = 'nailzjae.appts.contact';

function isContactValid(s) {
  const t = (s || '').trim();
  if (!t) return false;
  if (t.includes('@')) return /.+@.+\..+/.test(t);
  // phone: count digits
  const digits = t.replace(/\D/g, '');
  return digits.length >= 7;
}

function MyAppointmentsPage({ go }) {
  const [contact, setContact] = React.useState(() => {
    try { return localStorage.getItem(APPTS_CONTACT_KEY) || ''; } catch (e) { return ''; }
  });
  const [submittedContact, setSubmittedContact] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState(null);
  const [results, setResults] = React.useState(null);

  async function lookup(e) {
    if (e?.preventDefault) e.preventDefault();
    const clean = contact.trim();
    if (!isContactValid(clean)) {
      setError('Enter the email or phone number you used to book.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await window.lookupBookingsByContact(clean);
      setResults(list);
      setSubmittedContact(clean);
      try { localStorage.setItem(APPTS_CONTACT_KEY, clean); } catch (err) {}
    } catch (err) {
      setError('Something went wrong — please try again.');
    } finally {
      setLoading(false);
    }
  }

  // auto-lookup on mount if we have a remembered contact
  React.useEffect(() => {
    if (contact && isContactValid(contact) && results === null) {
      lookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearMemory() {
    try { localStorage.removeItem(APPTS_CONTACT_KEY); } catch (e) {}
    setResults(null);
    setSubmittedContact('');
    setContact('');
  }

  const today = ymd(new Date());
  const upcoming = (results || []).filter(b => {
    if (b.status === 'denied') return false;
    if (!b.date || b.time === 'TBD') return b.status !== 'denied';
    return b.date >= today;
  });
  const past = (results || []).filter(b => {
    if (b.status === 'denied') return true;
    if (!b.date || b.time === 'TBD') return false;
    return b.date < today;
  });

  return (
    <div className="scroll page-enter">
      <div className="safe-top"></div>
      <AppBar onBack={() => go('home')} title="My Appointments"/>

      <div style={{ padding: '8px 24px 14px' }}>
        <div className="h-eyebrow">your bookings</div>
        <div className="h-display" style={{ fontSize: 38, marginTop: 6 }}>Look up<br/>your appts</div>
        <p className="body-mute" style={{ marginTop: 10 }}>
          Enter the email or phone number you used when booking — I'll pull up all your appointments.
        </p>
      </div>

      <form onSubmit={lookup} style={{ padding: '6px 24px 0' }}>
        <div className="field">
          <label>Email or phone</label>
          <input
            className="input"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="you@example.com or (555) 123-4567"
            autoComplete="email"
            inputMode={contact.includes('@') ? 'email' : 'text'}
          />
        </div>
        {error && (
          <div className="tiny" style={{ color: 'var(--rose-deep)', marginTop: 6, letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
          style={{ marginTop: 12 }}
        >
          {loading ? 'Looking up…' : 'Find my appointments'} {!loading && <Icon.arrow/>}
        </button>
      </form>

      {results !== null && (
        <div style={{ padding: '24px 24px 0' }}>
          {results.length === 0 ? (
            <div className="card" style={{ background: 'transparent', borderStyle: 'dashed', textAlign: 'center', padding: 28 }}>
              <Icon.calendar size={28}/>
              <div className="body-mute" style={{ marginTop: 10 }}>No appointments found for <b style={{ color: 'var(--espresso)' }}>{submittedContact}</b>.</div>
              <div className="tiny" style={{ marginTop: 8, color: 'var(--ink-faint)', letterSpacing: 0, textTransform: 'none', fontSize: 12 }}>
                Double-check the email or phone, or book a new appointment.
              </div>
              <button className="btn btn-rose" onClick={() => go('book')} style={{ marginTop: 16 }}>
                Book now <Icon.arrow/>
              </button>
            </div>
          ) : (
            <div className="stack-loose stagger">
              {upcoming.length > 0 && (
                <div>
                  <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em', marginBottom: 10 }}>
                    UPCOMING · {upcoming.length}
                  </div>
                  <div className="stack">
                    {upcoming.map(b => <ApptCard key={b.id} b={b}/>)}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em', marginBottom: 10 }}>
                    PAST · {past.length}
                  </div>
                  <div className="stack">
                    {past.map(b => <ApptCard key={b.id} b={b} muted/>)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
            <button onClick={clearMemory} className="copy-btn" style={{ textTransform: 'none', letterSpacing: '0.04em' }}>
              Forget me on this device
            </button>
          </div>
        </div>
      )}

      <div style={{ height: 140 }}/>
    </div>
  );
}

function ApptCard({ b, muted }) {
  const statusLabel = b.status === 'confirmed' ? 'Confirmed'
                    : b.status === 'denied'    ? 'Denied'
                    : 'Pending';
  const badgeCls = b.status === 'confirmed' ? 'badge badge-confirmed'
                 : b.status === 'denied'    ? 'badge badge-denied'
                 : 'badge badge-pending';
  const hasDate = b.date && b.time && b.time !== 'TBD';
  return (
    <div className="card" style={{ opacity: muted ? 0.72 : 1 }}>
      <div className="row-between" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tiny" style={{ color: 'var(--rose-deep)' }}>{b.serviceName || 'Appointment'}</div>
          <div className="h-card" style={{ marginTop: 4, fontSize: 17 }}>
            {hasDate ? fmtDateLong(parseYmd(b.date)) : 'Submitted ' + new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="body-mute" style={{ marginTop: 2, fontSize: 13 }}>
            {hasDate ? b.time : ''}{b.servicePrice ? (hasDate ? ' · ' : '') + '$' + b.servicePrice : ''}
          </div>
          {b.note && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(20,16,12,.04)', borderRadius: 8, fontSize: 12, color: 'var(--ink-mute)' }}>
              {b.note}
            </div>
          )}
        </div>
        <span className={badgeCls}>{statusLabel}</span>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, GalleryPage, ServicesPage, ContactPage, MyAppointmentsPage });
