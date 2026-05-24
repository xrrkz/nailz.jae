// admin.jsx — owner control panel

const ADMIN_TABS = ['Appointments', 'Calendar', 'Services', 'Payments', 'Site'];

function AdminPanel({ onExit }) {
  const [state] = useStore();
  const [session, setSession] = React.useState(undefined); // undefined = loading
  const [tab, setTab] = React.useState('Appointments');

  React.useEffect(() => {
    if (!window.sb) { setSession(null); return; }
    window.sb.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = window.sb.auth.onAuthStateChange((_evt, s) => setSession(s || null));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="scroll page-enter" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="body-mute">Loading…</div></div>;
  }
  if (!session) {
    return <AdminLogin onExit={onExit} onAuthed={(s) => setSession(s)}/>;
  }

  async function signOut() {
    await window.sb?.auth.signOut();
    setSession(null);
  }

  return (
    <div className="scroll page-enter" style={{ background: 'var(--bg)' }}>
      <div className="safe-top"></div>

      {/* header */}
      <div style={{ padding: '12px 20px 18px' }}>
        <div className="row-between">
          <button className="appbar-back" onClick={onExit} aria-label="Exit"><Icon.close/></button>
          <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.18em' }}>OWNER · JAE</div>
          <button
            onClick={signOut}
            className="copy-btn"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
            aria-label="Log out"
          >
            Sign out
          </button>
        </div>
        <div style={{ marginTop: 14 }}>
          <Wordmark size={32}/>
          <div className="h-eyebrow" style={{ marginTop: 6, color: 'var(--ink-mute)' }}>studio dashboard</div>
        </div>
      </div>

      {/* tab pills */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 6, overflowX: 'auto', margin: '0 -4px', scrollbarWidth: 'none' }}>
        {ADMIN_TABS.map(t => (
          <button key={t} className={'chip' + (tab === t ? ' is-active' : '')} onClick={() => setTab(t)} style={{ flex: '0 0 auto' }}>
            {t}
          </button>
        ))}
      </div>

      <div key={tab} className="route-pane" style={{ padding: '4px 20px 100px' }}>
        {tab === 'Appointments' && <AdminAppointments state={state}/>}
        {tab === 'Calendar'     && <AdminCalendar state={state}/>}
        {tab === 'Services'     && <AdminServices state={state}/>}
        {tab === 'Payments'     && <AdminPayments state={state}/>}
        {tab === 'Site'         && <AdminSite state={state}/>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Login gate
// ─────────────────────────────────────────────────────────────
function AdminLogin({ onExit, onAuthed }) {
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  async function submit(e) {
    e?.preventDefault();
    if (!window.sb) { setErr('Auth is not configured.'); return; }
    setBusy(true);
    setErr('');
    const { data, error } = await window.sb.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    setBusy(false);
    if (error || !data?.session) {
      setErr(error?.message || 'Sign-in failed.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onAuthed(data.session);
  }

  return (
    <div className="scroll page-enter" style={{ background: 'var(--bg)' }}>
      <div className="safe-top"></div>
      <div style={{ padding: '12px 20px' }}>
        <button className="appbar-back" onClick={onExit} aria-label="Exit"><Icon.close/></button>
      </div>

      <div style={{ padding: '24px 28px 0', minHeight: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="hero-mark" style={{ textAlign: 'center', marginBottom: 22 }}>
          <Wordmark size={44}/>
        </div>
        <div className="h-eyebrow hero-eyebrow" style={{ color: 'var(--rose-deep)', textAlign: 'center' }}>owner sign in</div>
        <div className="h-section hero-body" style={{ marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
          Welcome back, Jae
        </div>

        <form
          onSubmit={submit}
          className={'stack hero-ctas ' + (shake ? 'shake' : '')}
          style={{ marginTop: 28 }}
        >
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" autoFocus/>
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••"/>
          </div>
          {err && <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.04em', textTransform: 'none', fontSize: 12 }}>{err}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy} style={{ marginTop: 6 }}>
            {busy ? 'Signing in…' : <>Sign in <Icon.arrow/></>}
          </button>
        </form>

        <div className="tiny" style={{ textAlign: 'center', marginTop: 24, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
          Create an admin user in Supabase → Authentication → Users
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Appointments
// ─────────────────────────────────────────────────────────────
function AdminAppointments({ state }) {
  const [filter, setFilter] = React.useState('pending');
  const filtered = state.bookings
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .filter(b => filter === 'all' ? true : b.status === filter);

  const counts = {
    all:       state.bookings.length,
    pending:   state.bookings.filter(b => b.status === 'pending').length,
    confirmed: state.bookings.filter(b => b.status === 'confirmed').length,
    denied:    state.bookings.filter(b => b.status === 'denied').length,
  };

  return (
    <div className="stack">
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '0 -4px', padding: '0 4px', scrollbarWidth: 'none' }}>
        <button className={'chip' + (filter === 'pending' ? ' is-active' : '')} onClick={() => setFilter('pending')} style={{ flex: '0 0 auto' }}>Needs review · {counts.pending}</button>
        <button className={'chip' + (filter === 'confirmed' ? ' is-active' : '')} onClick={() => setFilter('confirmed')} style={{ flex: '0 0 auto' }}>Confirmed · {counts.confirmed}</button>
        <button className={'chip' + (filter === 'denied' ? ' is-active' : '')} onClick={() => setFilter('denied')} style={{ flex: '0 0 auto' }}>Denied · {counts.denied}</button>
        <button className={'chip' + (filter === 'all' ? ' is-active' : '')} onClick={() => setFilter('all')} style={{ flex: '0 0 auto' }}>All · {counts.all}</button>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ background: 'transparent', borderStyle: 'dashed', textAlign: 'center', padding: 28 }}>
          <Icon.calendar size={28}/>
          <div className="body-mute" style={{ marginTop: 10 }}>
            {filter === 'pending' ? 'No requests waiting on review.' :
             filter === 'confirmed' ? 'No confirmed bookings yet.' :
             filter === 'denied' ? 'No denied bookings.' :
             'No bookings yet.'}
          </div>
        </div>
      ) : (
        filtered.map(b => <AppointmentCard key={b.id} booking={b} state={state}/>)
      )}
    </div>
  );
}

function AppointmentCard({ booking, state }) {
  const sv = state.services.find(s => s.id === booking.serviceId);
  const handle = state.handles[booking.payment];
  const [igCopied, setIgCopied] = React.useState(false);
  const [setPrice, setSetPrice] = React.useState('');
  const [showPriceInput, setShowPriceInput] = React.useState(false);
  const statusLabel = booking.status === 'confirmed' ? 'confirmed' : booking.status === 'denied' ? 'denied' : 'needs review';
  const badgeClass =
    booking.status === 'confirmed' ? 'badge-confirmed' :
    booking.status === 'denied'    ? 'badge-closed'    :
                                     'badge-pending';

  const phoneDigits = (booking.phone || '').replace(/[^0-9+]/g, '');
  const igHandle = (booking.social || '').replace(/^@/, '').trim();

  const firstName = (booking.name?.split(' ')[0]) || 'there';
  const svcName   = booking.serviceName || sv?.name || 'your appointment';
  const dep       = state.settings?.depositAmount ?? 15;
  const hasDate   = booking.date && booking.time && booking.time !== 'TBD';
  const dateLong  = hasDate ? fmtDateLong(parseYmd(booking.date)) : '';
  const dateShort = hasDate ? fmtDateShort(parseYmd(booking.date)) : '';
  const priceDisplay = booking.servicePrice != null ? '$' + booking.servicePrice : null;

  const smsBody = (() => {
    if (booking.status === 'confirmed') {
      return `Hi ${firstName}! It's Jae — just confirming your ${svcName}. ` +
             (priceDisplay ? `Total is ${priceDisplay}. ` : '') +
             `Can't wait to see you! Reply here if you have any questions.`;
    }
    if (booking.status === 'denied') {
      return `Hi ${firstName}, it's Jae — unfortunately I can't take on your ${svcName} request right now. ` +
             `Let me know if you'd like to try a different service or time!`;
    }
    return `Hi ${firstName}! It's Jae — I got your request for a ${svcName}. ` +
           `Just confirming I received your $${dep} deposit — I'll review and get back to you shortly!`;
  })();

  const emailSubject = booking.status === 'confirmed'
    ? `Your nailz.jae appointment — ${svcName}`
    : booking.status === 'denied'
      ? `About your nailz.jae request`
      : `Got your nailz.jae request — ${svcName}`;

  const emailBody = (() => {
    const lines = [`Hi ${firstName},`, ''];
    if (booking.status === 'confirmed') {
      lines.push(`Just confirming your appointment with me:`);
    } else if (booking.status === 'denied') {
      lines.push(`Unfortunately I'm not able to take on this request right now:`);
    } else {
      lines.push(`Thanks for booking with me! Here are your details:`);
    }
    lines.push('');
    lines.push(`Service:  ${svcName}`);
    if (priceDisplay) lines.push(`Total:    ${priceDisplay}`);
    if (booking.payment) lines.push(`Deposit:  $${dep} via ${booking.payment}`);
    if (booking.note)    { lines.push(''); lines.push(`Your note: "${booking.note}"`); }
    lines.push('');
    if (booking.status === 'confirmed') {
      lines.push(`You're all set — can't wait to see you! If anything changes, just reply to this email or DM me on IG (@nailz.jae).`);
    } else if (booking.status === 'denied') {
      lines.push(`Let me know if you'd like to try something else and I'll get you taken care of.`);
    } else {
      lines.push(`I'll review your request and get back to you shortly. Reply here or DM @nailz.jae if you have any questions.`);
    }
    lines.push('');
    lines.push(`— Jaelyn`);
    lines.push(`nailz.jae`);
    return lines.join('\n');
  })();

  const igBody = booking.status === 'confirmed'
    ? `hey ${firstName}! confirming your ${svcName} — can't wait!${priceDisplay ? ' total is ' + priceDisplay : ''}`
    : booking.status === 'denied'
      ? `hi ${firstName}, sadly can't take on your ${svcName} request rn — wanna try something else?`
      : `hey ${firstName}! got your request for ${svcName} — reviewing now`;

  function confirmWithPrice() {
    const price = setPrice ? +setPrice : null;
    const patch = { status: 'confirmed' };
    if (price != null && price > 0) patch.servicePrice = price;
    updateBooking(booking.id, patch);
    setShowPriceInput(false);
  }

  return (
    <div className="admin-card">
      <div className="row-between">
        <div>
          <div className="tiny" style={{ color: 'var(--ink-mute)' }}>
            {hasDate ? fmtDateLong(parseYmd(booking.date)) : 'Submitted ' + new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="h-card" style={{ marginTop: 4, fontSize: 17 }}>{svcName}</div>
        </div>
        <span className={'badge ' + badgeClass}>{statusLabel}</span>
      </div>

      {priceDisplay && (
        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(201, 142, 142, 0.08)', borderRadius: 8, display: 'inline-block' }}>
          <span className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em' }}>PRICE SET: </span>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--espresso)', fontWeight: 600 }}>{priceDisplay}</span>
        </div>
      )}

      <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }}/>

      <div className="stack-tight" style={{ fontSize: 13 }}>
        <div className="row-between"><span className="body-mute">Client</span><span>{booking.name}</span></div>
        <div className="row-between">
          <span className="body-mute">Phone</span>
          {phoneDigits ? (
            <a href={`tel:${phoneDigits}`} style={{ fontFamily: 'var(--mono)', color: 'var(--espresso)', textDecoration: 'none' }}>{booking.phone}</a>
          ) : <span className="body-mute">—</span>}
        </div>
        <div className="row-between">
          <span className="body-mute">Email</span>
          {booking.email ? (
            <a href={`mailto:${booking.email}`} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--espresso)', textDecoration: 'none' }}>{booking.email}</a>
          ) : <span className="body-mute">—</span>}
        </div>
        {booking.social && <div className="row-between"><span className="body-mute">Social</span><span>{booking.social}</span></div>}
        <div className="row-between"><span className="body-mute">Deposit via</span><span>{handle?.display || booking.payment}</span></div>
      </div>

      {(phoneDigits || booking.email || igHandle) && (
        <div className="contact-row">
          {phoneDigits && (
            <a
              href={`sms:${phoneDigits}${/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(smsBody)}`}
              className="contact-btn"
              aria-label="Text client"
            >
              <Icon.message size={14}/> Text
            </a>
          )}
          {phoneDigits && (
            <a href={`tel:${phoneDigits}`} className="contact-btn" aria-label="Call client">
              <Icon.phone size={14}/> Call
            </a>
          )}
          {booking.email && (
            <a
              href={`mailto:${booking.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
              className="contact-btn"
              aria-label="Email client"
            >
              <Icon.mail size={14}/> Email
            </a>
          )}
          {igHandle && (
            <button
              type="button"
              className="contact-btn"
              aria-label="Open Instagram DM (copies pre-written message)"
              title="Copies a pre-written message to your clipboard, then opens Instagram DM"
              onClick={() => {
                try { navigator.clipboard?.writeText(igBody); } catch (e) {}
                setIgCopied(true);
                setTimeout(() => setIgCopied(false), 2000);
                window.open(`https://ig.me/m/${igHandle}`, '_blank', 'noopener');
              }}
            >
              <Icon.instagram size={14}/> {igCopied ? 'Copied — paste in DM' : 'DM'}
            </button>
          )}
        </div>
      )}

      {(booking.inspirationSrc || booking.note) && (
        <div style={{ marginTop: 12, padding: 10, background: 'rgba(201, 142, 142, 0.08)', borderRadius: 10, border: '1px solid rgba(201, 142, 142, 0.18)' }}>
          {booking.inspirationSrc && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <a href={booking.inspirationSrc} target="_blank" rel="noreferrer">
                <img src={booking.inspirationSrc} alt="" style={{ width: 64, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0, cursor: 'zoom-in' }}/>
              </a>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em' }}>INSPIRATION</div>
                {booking.note ? (
                  <div className="body" style={{ fontSize: 13, marginTop: 4, color: 'var(--ink)' }}>"{booking.note}"</div>
                ) : (
                  <div className="body-mute" style={{ fontSize: 12, marginTop: 4 }}>Client wants a set like this</div>
                )}
              </div>
            </div>
          )}
          {!booking.inspirationSrc && booking.note && (
            <>
              <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em' }}>CLIENT NOTE</div>
              <div className="body" style={{ fontSize: 13, marginTop: 4, color: 'var(--ink)' }}>"{booking.note}"</div>
            </>
          )}
        </div>
      )}

      {/* Price input for confirm */}
      {showPriceInput && (
        <div style={{ marginTop: 12, padding: 12, background: 'rgba(201, 142, 142, 0.08)', borderRadius: 10, border: '1px solid rgba(201, 142, 142, 0.22)' }}>
          <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em', marginBottom: 8 }}>SET PRICE FOR THIS APPOINTMENT</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--espresso)' }}>$</span>
            <input
              className="input"
              type="number"
              value={setPrice}
              onChange={e => setSetPrice(e.target.value)}
              placeholder="0"
              style={{ flex: 1, fontSize: 18, padding: '10px 12px' }}
              autoFocus
            />
          </div>
          <div className="body-mute" style={{ fontSize: 11, marginTop: 6 }}>Leave blank to confirm without a set price.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btn-rose btn-sm" style={{ flex: 1 }} onClick={confirmWithPrice}>
              <Icon.check size={16}/> Confirm
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPriceInput(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showPriceInput && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {booking.status === 'pending' && (
            <>
              <button className="btn btn-rose btn-sm" style={{ flex: 1, minWidth: 0 }} onClick={() => setShowPriceInput(true)}>
                <Icon.check size={16}/> Confirm
              </button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, minWidth: 0 }} onClick={() => {
                if (confirm('Deny this request?')) updateBooking(booking.id, { status: 'denied' });
              }}>
                <Icon.close size={14}/> Deny
              </button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, minWidth: 0 }} onClick={() => updateBooking(booking.id, { status: 'pending' })}>
                Move back to pending
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPriceInput(true)}>
                Set price
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                if (confirm('Delete this booking?')) removeBooking(booking.id);
              }} aria-label="Delete">
                <Icon.trash size={14}/>
              </button>
            </>
          )}
          {booking.status === 'denied' && (
            <>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, minWidth: 0 }} onClick={() => updateBooking(booking.id, { status: 'pending' })}>
                Restore to pending
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                if (confirm('Delete this booking permanently?')) removeBooking(booking.id);
              }} aria-label="Delete">
                <Icon.trash size={14}/>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Calendar (open/close days, edit slots)
// ─────────────────────────────────────────────────────────────
function AdminCalendar({ state }) {
  const today = new Date();
  const days = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < 21; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      out.push({ key: ymd(d), date: d });
    }
    return out;
  }, []);
  const [selected, setSelected] = React.useState(days[0].key);

  return (
    <div className="stack">
      <p className="body-mute">Tap a day to open/close it or edit time slots. Slots already booked stay reserved.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map(d => {
          const av = state.availability[d.key];
          const open = av?.open;
          const active = selected === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setSelected(d.key)}
              style={{
                padding: '8px 0',
                background: active ? 'var(--cream)' : (open ? 'var(--bg-soft)' : 'transparent'),
                color: active ? '#2a1f1c' : (open ? 'var(--ink)' : 'var(--ink-faint)'),
                border: '1px solid ' + (active ? 'var(--cream)' : 'var(--line)'),
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              <div style={{ fontSize: 9, letterSpacing: '0.1em', opacity: 0.6, textTransform: 'uppercase' }}>
                {d.date.toLocaleDateString('en-US', { weekday: 'narrow' })}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, marginTop: 2 }}>{d.date.getDate()}</div>
            </button>
          );
        })}
      </div>

      <DayEditor dateKey={selected} state={state}/>
    </div>
  );
}

function DayEditor({ dateKey, state }) {
  const day = state.availability[dateKey] || { open: false, slots: [] };
  const [newSlot, setNewSlot] = React.useState('');
  const bookedSet = bookedTimesFor(dateKey);

  return (
    <div className="admin-card">
      <div className="row-between">
        <div>
          <div className="h-card" style={{ fontSize: 17 }}>{fmtDateLong(parseYmd(dateKey))}</div>
          <div className="tiny" style={{ color: 'var(--ink-mute)', marginTop: 2 }}>
            {day.open ? `${day.slots.length} slots released` : 'Closed for booking'}
          </div>
        </div>
        <Switch checked={day.open} onChange={() => toggleDayOpen(dateKey)}/>
      </div>

      {day.open && (
        <>
          <div style={{ height: 1, background: 'var(--line)', margin: '14px 0' }}/>
          <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em', marginBottom: 8 }}>TIME SLOTS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {day.slots.map(t => {
              const booked = bookedSet.has(t);
              return (
                <span key={t} className="chip" style={{
                  background: booked ? 'rgba(232,196,196,.16)' : 'rgba(240,229,219,.06)',
                  color: booked ? 'var(--rose)' : 'var(--ink)',
                  cursor: 'default',
                }}>
                  {t}
                  {booked ? <span style={{ fontSize: 9, marginLeft: 4, letterSpacing: '0.1em' }}>BOOKED</span> : (
                    <button onClick={() => setDaySlots(dateKey, day.slots.filter(s => s !== t))}
                      style={{ background: 'transparent', border: 0, color: 'currentColor', cursor: 'pointer', padding: 0, marginLeft: 2, lineHeight: 1 }}>
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <input className="input" placeholder="e.g. 5:30 PM" value={newSlot} onChange={e => setNewSlot(e.target.value)} style={{ flex: 1, padding: '10px 12px', fontSize: 14 }}/>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              const t = newSlot.trim();
              if (t && !day.slots.includes(t)) {
                setDaySlots(dateKey, [...day.slots, t]);
                setNewSlot('');
              }
            }}><Icon.plus/></button>
          </div>
        </>
      )}
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 44, height: 26, borderRadius: 13,
      background: checked ? 'var(--rose)' : 'rgba(240,229,219,.12)',
      border: 0, position: 'relative', cursor: 'pointer',
      transition: 'background .2s ease',
    }}>
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        transition: 'left .2s ease',
      }}/>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Services editor
// ─────────────────────────────────────────────────────────────
function AdminServices({ state }) {
  return (
    <div className="stack">
      <button className="btn btn-ghost btn-block" onClick={() => addService()}>
        <Icon.plus/> Add service
      </button>
      {state.services.map(sv => <ServiceRow key={sv.id} sv={sv}/>)}
    </div>
  );
}

function ServiceRow({ sv }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="admin-card">
      <div className="row-between" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tiny" style={{ color: 'var(--rose-deep)' }}>{sv.category} · {sv.length}</div>
          <div className="h-card" style={{ fontSize: 16, marginTop: 2 }}>{sv.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PriceTag amount={sv.price} size={18}/>
          <span style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform var(--t-med) var(--ease)', color: 'var(--ink-mute)', display: 'inline-flex' }}>
            <Icon.arrow size={14}/>
          </span>
        </div>
      </div>
      <div className={'policy-collapse ' + (open ? 'is-open' : '')}>
        <div className="policy-inner">
          <div className="stack" style={{ paddingTop: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="field"><label>Name</label><input className="input" value={sv.name} onChange={e => updateService(sv.id, { name: e.target.value })}/></div>
              <div className="field"><label>Price ($)</label><input className="input" type="number" value={sv.price} onChange={e => updateService(sv.id, { price: +e.target.value })}/></div>
              <div className="field"><label>Category</label><input className="input" value={sv.category} onChange={e => updateService(sv.id, { category: e.target.value })}/></div>
              <div className="field"><label>Length</label><input className="input" value={sv.length} onChange={e => updateService(sv.id, { length: e.target.value })}/></div>
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Duration (min)</label><input className="input" type="number" value={sv.durationMin} onChange={e => updateService(sv.id, { durationMin: +e.target.value })}/></div>
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea className="textarea" value={sv.desc} onChange={e => updateService(sv.id, { desc: e.target.value })}/></div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              if (confirm('Delete this service?')) removeService(sv.id);
            }} style={{ alignSelf: 'flex-start' }}>
              <Icon.trash size={14}/> Delete service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Payments editor
// ─────────────────────────────────────────────────────────────
function AdminPayments({ state }) {
  const methods = [
    { id: 'venmo',  label: 'Venmo'  },
    { id: 'zelle',  label: 'Zelle'  },
    { id: 'paypal', label: 'PayPal' },
    { id: 'chime',  label: 'Chime'  },
  ];
  return (
    <div className="stack">
      <div className="field">
        <label>Deposit amount ($)</label>
        <input className="input" type="number" value={state.settings.depositAmount} onChange={e => updateSettings({ depositAmount: +e.target.value })}/>
      </div>
      <div className="divider"/>
      <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>PAYMENT HANDLES</div>
      {methods.map(m => {
        const h = state.handles[m.id] || { handle: '', display: '' };
        return (
          <div key={m.id} className="admin-card">
            <div className="h-card" style={{ fontSize: 16, marginBottom: 10 }}>{m.label}</div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Handle / Cashtag</label>
              <input className="input" value={h.handle} onChange={e => updateHandle(m.id, { handle: e.target.value, display: e.target.value })}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Site (welcome text, etc)
// ─────────────────────────────────────────────────────────────
function AdminSite({ state }) {
  return (
    <div className="stack">
      <div className="field">
        <label>PSA banner</label>
        <input className="input" value={state.settings.psaShort} onChange={e => updateSettings({ psaShort: e.target.value })}/>
      </div>
      <div className="field">
        <label>Welcome message</label>
        <textarea className="textarea" value={state.settings.welcome} onChange={e => updateSettings({ welcome: e.target.value })}/>
      </div>

      <div className="divider"/>
      <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>OWNER LOGIN</div>
      <p className="body-mute" style={{ fontSize: 12 }}>
        Sign-in is handled by Supabase. Manage your email + password in the
        Supabase dashboard under <b>Authentication → Users</b>.
      </p>

      <div className="divider"/>
      <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>GALLERY PHOTOS</div>
      <p className="body-mute" style={{ fontSize: 12 }}>
        Drag photos onto the slots below — they'll appear on the public gallery. Same for service photos (in the Services tab) and your retention shots.
      </p>
      <div>
        <div className="tiny" style={{ color: 'var(--ink-mute)', margin: '6px 0' }}>Sets</div>
        <div className="gallery-grid">
          {state.gallery.sets.map(g => (
            <image-slot key={g.id} id={g.id} shape="rounded" radius="10" placeholder="drop photo" src={g.src || undefined} style={{ aspectRatio: '3/4', width: '100%' }}></image-slot>
          ))}
        </div>
      </div>
      <div>
        <div className="tiny" style={{ color: 'var(--ink-mute)', margin: '14px 0 6px' }}>Retention</div>
        <div className="gallery-grid">
          {state.gallery.retention.map(g => (
            <image-slot key={g.id} id={g.id} shape="rounded" radius="10" placeholder="drop photo" src={g.src || undefined} style={{ aspectRatio: '3/4', width: '100%' }}></image-slot>
          ))}
        </div>
      </div>

      <div className="divider"/>
      <button className="btn btn-ghost btn-block" onClick={() => {
        if (confirm('Reset all data to defaults? This wipes services, bookings, and availability.')) {
          localStorage.removeItem('nailzjae.v1');
          location.reload();
        }
      }}>
        <Icon.trash size={14}/> Reset all data
      </button>
    </div>
  );
}

Object.assign(window, { AdminPanel });
