// booking.jsx — multi-step booking flow

const STEPS = ['Service', 'Date & Time', 'Notes', 'Your Info', 'Deposit', 'Done'];

function BookingFlow({ initial, onExit }) {
  const [state] = useStore();
  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState('fwd');
  const scrollRef = React.useRef(null);
  const [draft, setDraft] = React.useState({
    serviceId: initial?.serviceId || null,
    date: null,
    time: null,
    name: '',
    phone: '',
    email: '',
    social: '',
    paymentMethod: 'venmo',
    bookingId: null,
    inspirationSrc: initial?.inspirationSrc || null,
    inspirationId:  initial?.inspirationId  || null,
    note: '',
  });

  // scroll to top when step changes (gentle, since the pane animation already shifts)
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const service = state.services.find(s => s.id === draft.serviceId);

  function setField(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  function next() { setDirection('fwd'); setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() {
    if (step === 0) onExit();
    else { setDirection('back'); setStep(s => s - 1); }
  }

  // step validation
  const canProceed = (() => {
    if (step === 0) return !!draft.serviceId;
    if (step === 1) return !!draft.date && !!draft.time;
    if (step === 2) return true;  // notes step always optional
    if (step === 3) return draft.name.trim() && draft.phone.trim() && draft.email.trim();
    if (step === 4) return !!draft.paymentMethod;
    return false;
  })();

  function submit() {
    const b = addBooking({
      serviceId: draft.serviceId,
      date: draft.date,
      time: draft.time,
      name: draft.name,
      phone: draft.phone,
      email: draft.email,
      social: draft.social,
      payment: draft.paymentMethod,
      inspirationSrc: draft.inspirationSrc,
      inspirationId: draft.inspirationId,
      note: draft.note,
    });
    setField('bookingId', b.id);
    setStep(5);
  }

  return (
    <>
    <div className="scroll page-enter" ref={scrollRef}>
      <div className="safe-top"></div>
      <AppBar
        onBack={back}
        title="Book Appointment"
      />

      {/* stepper */}
      <div style={{ padding: '0 24px 6px' }}>
        <div className="stepper">
          {STEPS.map((_, i) => (
            <div key={i} className={'dot' + (i < step ? ' is-done' : '') + (i === step ? ' is-active' : '')}/>
          ))}
        </div>
        <div className="tiny" style={{ marginTop: 8, color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>
          STEP {step + 1} / {STEPS.length} · {STEPS[step]}
        </div>
      </div>

      <div key={step} className={'step-pane step-' + direction} style={{ padding: '14px 24px 24px' }}>
        {step === 0 && <StepService draft={draft} setField={setField} services={state.services}/>}
        {step === 1 && <StepDateTime draft={draft} setField={setField} availability={state.availability}/>}
        {step === 2 && <StepNotes draft={draft} setField={setField}/>}
        {step === 3 && <StepDetails draft={draft} setField={setField}/>}
        {step === 4 && <StepDeposit draft={draft} setField={setField} service={service} state={state}/>}
        {step === 5 && <StepDone draft={draft} service={service} onExit={onExit}/>}
      </div>

      <div style={{ height: 160 }}/>
    </div>

    {step < 5 && (
      <div className="cta-footer">
        <button
          className={'btn btn-block ' + (step === 4 ? 'btn-rose' : 'btn-primary')}
          disabled={!canProceed}
          onClick={() => step === 4 ? submit() : next()}
        >
          {step === 4 ? "I've sent my deposit" : 'Continue'} <Icon.arrow/>
        </button>
      </div>
    )}
    </>
  );
}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 1: Service
// ─────────────────────────────────────────────────────────────
function StepService({ draft, setField, services }) {
  return (
    <div className="stack stagger">
      <div>
        <div className="h-section">Pick your service</div>
        <p className="body-mute" style={{ marginTop: 6 }}>You can change this later if you message me.</p>
      </div>

      {draft.inspirationSrc && (
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, background: 'rgba(201, 142, 142, 0.10)', borderColor: 'rgba(201, 142, 142, 0.32)' }}>
          <img src={draft.inspirationSrc} alt="" style={{ width: 64, height: 80, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em' }}>INSPIRATION</div>
            <div className="h-card" style={{ fontSize: 16, marginTop: 4 }}>I want a set like this</div>
            <div className="body-mute" style={{ fontSize: 12, marginTop: 2 }}>Jae will see this photo with your booking.</div>
          </div>
          <button
            onClick={() => { setField('inspirationSrc', null); setField('inspirationId', null); }}
            aria-label="Remove inspiration"
            className="copy-btn"
            style={{ padding: '6px 8px' }}
          >
            <Icon.close size={14}/>
          </button>
        </div>
      )}

      {services.map(sv => (
        <button
          key={sv.id}
          onClick={() => setField('serviceId', sv.id)}
          className="card"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
            width: '100%', cursor: 'pointer',
            borderColor: draft.serviceId === sv.id ? 'var(--rose)' : 'var(--line)',
            background: draft.serviceId === sv.id ? 'rgba(201, 142, 142, 0.10)' : 'var(--bg-soft)',
            textAlign: 'left',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="tiny" style={{ color: 'var(--rose-deep)' }}>{sv.category} · {sv.length}</div>
            <div className="h-card" style={{ marginTop: 4, fontSize: 17 }}>{sv.name}</div>
            <div className="body-mute" style={{ marginTop: 2, fontSize: 12 }}>{sv.durationMin} minutes</div>
          </div>
          <PriceTag amount={sv.price} size={20}/>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 2: Date + Time
// ─────────────────────────────────────────────────────────────
function StepDateTime({ draft, setField, availability }) {
  // build next 21 days
  const today = new Date();
  const todayKey = ymd(today);
  const days = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < 21; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      out.push({ key: ymd(d), date: d });
    }
    return out;
  }, []);

  const selectedDay = draft.date ? availability[draft.date] : null;
  const bookedSet = draft.date ? bookedTimesFor(draft.date) : new Set();

  // auto-scroll picked day into view
  const stripRef = React.useRef(null);
  React.useEffect(() => {
    if (!draft.date || !stripRef.current) return;
    const el = stripRef.current.querySelector(`[data-day="${draft.date}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      try {
        const strip = stripRef.current;
        const left = el.offsetLeft - 20;
        strip.scrollTo({ left, behavior: 'smooth' });
      } catch (e) {}
    }
  }, [draft.date]);

  return (
    <div className="stack-loose stagger">
      <div>
        <div className="h-section">Choose a date</div>
        <p className="body-mute" style={{ marginTop: 6 }}>Swipe to see more days. Greyed days are closed.</p>
      </div>

      <div className="day-strip" ref={stripRef}>
        {days.map(d => {
          const av = availability[d.key];
          const closed = !av || !av.open || av.slots.length === 0;
          const allBooked = av && av.slots.every(t => bookedTimesFor(d.key).has(t));
          const dis = closed || allBooked;
          const active = draft.date === d.key;
          const isToday = d.key === todayKey;
          return (
            <button
              key={d.key}
              data-day={d.key}
              className={'day-cell' + (active ? ' is-active' : '') + (dis ? ' is-closed' : '') + (isToday ? ' is-today' : '')}
              onClick={() => !dis && (setField('date', d.key), setField('time', null))}
              disabled={dis}
            >
              <div className="dow">{isToday ? 'TODAY' : d.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="dom">{d.date.getDate()}</div>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div key={'day-' + draft.date}>
          <div className="h-card" style={{ fontSize: 18, marginBottom: 12 }}>
            {fmtDateLong(parseYmd(draft.date))}
          </div>
          {selectedDay.slots.length === 0 ? (
            <p className="body-mute">No times released for this day yet.</p>
          ) : (
            <div className="time-grid">
              {selectedDay.slots.map(t => {
                const booked = bookedSet.has(t);
                return (
                  <button
                    key={t}
                    className={'time-cell' + (draft.time === t ? ' is-active' : '') + (booked ? ' is-booked' : '')}
                    onClick={() => !booked && setField('time', t)}
                    disabled={booked}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!draft.date && (
        <div className="card" style={{ background: 'transparent', borderStyle: 'dashed', textAlign: 'center' }}>
          <Icon.calendar size={28}/>
          <p className="body-mute" style={{ marginTop: 8 }}>Pick a day above to see available times.</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 3: Notes & Inspo
// ─────────────────────────────────────────────────────────────
function StepNotes({ draft, setField }) {
  const fileRef = React.useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please pick a photo (JPG, PNG, etc).');
      return;
    }
    // soft cap: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('That photo is too big — please pick one under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setField('inspirationSrc', reader.result);
      setField('inspirationId', null); // user-uploaded, no gallery id
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function clearInspo() {
    setField('inspirationSrc', null);
    setField('inspirationId', null);
  }

  return (
    <div className="stack stagger">
      <div>
        <div className="h-section">Inspo & notes</div>
        <p className="body-mute" style={{ marginTop: 6 }}>
          Optional — drop a photo of a set you love and add anything Jae should know.
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      <div className="field">
        <label>Inspo photo</label>
        {draft.inspirationSrc ? (
          <div className="card-tight" style={{ padding: 10, display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-soft-2)', border: '1px solid var(--rose)', borderRadius: 'var(--r-md)' }}>
            <img src={draft.inspirationSrc} alt="" style={{ width: 64, height: 80, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="h-card" style={{ fontSize: 15 }}>Inspiration attached</div>
              <div className="body-mute" style={{ fontSize: 12, marginTop: 2 }}>Jae will see this with your request.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="copy-btn" onClick={() => fileRef.current?.click()} style={{ textTransform: 'none', letterSpacing: '0.04em' }}>Swap</button>
              <button className="copy-btn" onClick={clearInspo} style={{ textTransform: 'none', letterSpacing: '0.04em' }}>Remove</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="card-tight upload-target"
          >
            <Icon.plus size={24}/>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--espresso)' }}>Add a photo</div>
              <div className="body-mute" style={{ fontSize: 12, marginTop: 2 }}>From your camera roll · optional</div>
            </div>
          </button>
        )}
      </div>

      <div className="field">
        <label>Short message <span style={{ color: 'var(--ink-faint)', textTransform: 'none', letterSpacing: 0 }}>· optional</span></label>
        <textarea
          className="textarea"
          value={draft.note}
          onChange={(e) => setField('note', e.target.value)}
          placeholder="Anything Jae should know? Color preferences, occasion, shape you like, allergies, etc."
          maxLength={400}
        />
        <div className="tiny" style={{ textAlign: 'right', color: 'var(--ink-faint)', marginTop: 2 }}>
          {(draft.note || '').length} / 400
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 4: Details
// ─────────────────────────────────────────────────────────────
function StepDetails({ draft, setField }) {
  return (
    <div className="stack stagger">
      <div>
        <div className="h-section">Your info</div>
        <p className="body-mute" style={{ marginTop: 6 }}>So I can reach you if anything comes up.</p>
      </div>

      <div className="field">
        <label>Full name</label>
        <input className="input" value={draft.name} onChange={e => setField('name', e.target.value)} placeholder="Jane Doe"/>
      </div>
      <div className="field">
        <label>Phone</label>
        <input className="input" type="tel" value={draft.phone} onChange={e => setField('phone', e.target.value)} placeholder="(555) 123-4567"/>
      </div>
      <div className="field">
        <label>Email</label>
        <input className="input" type="email" value={draft.email} onChange={e => setField('email', e.target.value)} placeholder="you@example.com"/>
      </div>
      <div className="field">
        <label>Instagram or Snapchat <span style={{ color: 'var(--ink-faint)', textTransform: 'none', letterSpacing: 0 }}>· optional</span></label>
        <input className="input" value={draft.social} onChange={e => setField('social', e.target.value)} placeholder="@yourhandle"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 4: Deposit
// ─────────────────────────────────────────────────────────────
function StepDeposit({ draft, setField, service, state }) {
  const methods = [
    { id: 'venmo',  label: 'Venmo'  },
    { id: 'zelle',  label: 'Zelle'  },
    { id: 'paypal', label: 'PayPal' },
    { id: 'chime',  label: 'Chime'  },
  ];

  const handle = draft.paymentMethod ? state.handles[draft.paymentMethod] : null;
  const dep = state.settings.depositAmount;
  const noteText = `${draft.name || 'Your name'} · ${draft.time || ''} ${draft.date ? fmtDateShort(parseYmd(draft.date)) : ''}`;
  const [showPolicy, setShowPolicy] = React.useState(false);

  return (
    <div className="stack stagger">
      <div>
        <div className="h-section">Checkout</div>
        <p className="body-mute" style={{ marginTop: 6 }}>
          Send a <b style={{ color: 'var(--espresso)' }}>${dep} deposit</b> to lock in your slot — goes toward your total.
        </p>
      </div>

      {/* Compact summary */}
      <div className="card" style={{ padding: 14 }}>
        <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>YOUR APPOINTMENT</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 8 }}>
          {draft.inspirationSrc && (
            <img src={draft.inspirationSrc} alt="" style={{ width: 52, height: 66, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}/>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h-card" style={{ fontSize: 17 }}>{service?.name}</div>
            <div className="body-mute" style={{ marginTop: 2, fontSize: 13 }}>
              {draft.date && fmtDateLong(parseYmd(draft.date))}
            </div>
            <div className="body-mute" style={{ fontSize: 13 }}>
              {draft.time} · {service?.durationMin}m
            </div>
          </div>
          <PriceTag amount={service?.price} size={22}/>
        </div>
        {draft.note && (
          <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(20,16,12,.04)', borderRadius: 8 }}>
            <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>YOUR NOTE</div>
            <div className="body-mute" style={{ fontSize: 12, marginTop: 4, color: 'var(--ink)' }}>{draft.note}</div>
          </div>
        )}
        <div style={{ height: 1, background: 'var(--line)', margin: '12px 0 10px' }}/>
        <div className="row-between">
          <span className="body-mute" style={{ fontSize: 13 }}>Deposit now</span>
          <span className="body" style={{ color: 'var(--rose-deep)', fontWeight: 600 }}>${dep}</span>
        </div>
        <div className="row-between" style={{ marginTop: 2 }}>
          <span className="body-mute" style={{ fontSize: 13 }}>Due at appointment</span>
          <span className="body" style={{ color: 'var(--espresso)', fontWeight: 600 }}>${(service?.price || 0) - dep}</span>
        </div>
      </div>

      {/* Segmented payment method picker */}
      <div>
        <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em', marginBottom: 8 }}>PAY WITH</div>
        <div className="pay-tabs" data-active={methods.findIndex(m => m.id === draft.paymentMethod)}>
          <div className="pay-tabs-thumb"/>
          {methods.map(m => (
            <button
              key={m.id}
              onClick={() => setField('paymentMethod', m.id)}
              className={'pay-tab ' + (draft.paymentMethod === m.id ? 'is-active' : '')}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Send-to card — content crossfades when method changes */}
      {handle && (
        <div className="card send-to-card" style={{ background: 'var(--bg-soft-2)', borderColor: 'var(--rose)' }}>
          <div className="row-between">
            <div className="tiny" style={{ color: 'var(--rose-deep)', letterSpacing: '0.14em' }}>SEND ${dep} TO</div>
            <CopyButton value={handle.handle} key={'h-' + draft.paymentMethod}/>
          </div>
          <div key={'d-' + draft.paymentMethod} className="handle-display h-card" style={{ fontSize: 19, marginTop: 6, fontFamily: 'var(--mono)', fontStyle: 'normal', wordBreak: 'break-all' }}>{handle.display}</div>

          <div style={{ height: 1, background: 'var(--line)', margin: '14px 0 12px' }}/>

          <div className="row-between">
            <div className="tiny" style={{ color: 'var(--ink-mute)', letterSpacing: '0.14em' }}>INCLUDE NOTE</div>
            <CopyButton value={noteText}/>
          </div>
          <div className="body" style={{ fontFamily: 'var(--mono)', fontSize: 13, marginTop: 6, padding: '8px 10px', background: 'rgba(20,16,12,.04)', borderRadius: 8 }}>{noteText}</div>
        </div>
      )}

      {/* Collapsible policy */}
      <button
        onClick={() => setShowPolicy(v => !v)}
        style={{
          background: 'transparent', border: 0,
          color: 'var(--ink-mute)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
          textAlign: 'left', cursor: 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        Deposit policy <span style={{ transform: showPolicy ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform var(--t-med) var(--ease)', display: 'inline-flex' }}><Icon.arrow size={12}/></span>
      </button>
      <div className={'policy-collapse ' + (showPolicy ? 'is-open' : '')}>
        <div className="policy-inner">
          <p className="tiny" style={{ margin: 0, lineHeight: 1.6, color: 'var(--ink-mute)', letterSpacing: 0, fontSize: 11, textTransform: 'none' }}>
            A ${dep} deposit is required to secure your appointment. This deposit goes toward the total cost of your service, and the remaining balance is due at your appointment. Deposits are non-refundable — no-shows forfeit the deposit. No refunds.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 5: Done
// ─────────────────────────────────────────────────────────────
function StepDone({ draft, service, onExit }) {
  return (
    <div className="stack-loose" style={{ textAlign: 'center', paddingTop: 18 }}>
      <div className="bloom" style={{
        width: 80, height: 80, borderRadius: '50%',
        margin: '0 auto', background: 'var(--rose)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 0 0 rgba(201, 142, 142, 0.4)',
        animation: 'bloom 700ms var(--ease-spring) both, glow-pulse 2.2s ease-in-out 700ms infinite',
      }}>
        <Icon.check size={36}/>
      </div>
      <div>
        <div className="h-eyebrow" style={{ color: 'var(--rose-deep)' }}>booking submitted</div>
        <div className="h-display" style={{ fontSize: 40, marginTop: 8 }}>Pending<br/>confirmation</div>
        <p className="body-mute" style={{ marginTop: 16, maxWidth: 300, margin: '16px auto 0' }}>
          I'll confirm your deposit and lock in your slot, usually within a few hours. Watch your email + IG.
        </p>
      </div>

      <div className="card" style={{ textAlign: 'left' }}>
        <div className="tiny" style={{ color: 'var(--ink-mute)' }}>YOUR APPOINTMENT</div>
        <div className="h-card" style={{ marginTop: 6, fontSize: 17 }}>{service?.name}</div>
        <div className="body-mute" style={{ marginTop: 2 }}>
          {draft.date && fmtDateLong(parseYmd(draft.date))} · {draft.time}
        </div>
        <div className="badge badge-pending" style={{ marginTop: 12 }}>Pending</div>
      </div>

      <button className="btn btn-primary btn-block" onClick={onExit}>
        Back to home
      </button>
    </div>
  );
}

Object.assign(window, { BookingFlow });
