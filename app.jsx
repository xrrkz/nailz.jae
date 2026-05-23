// app.jsx — main router + iOS frame mount

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#c98e8e",
  "bg": "#f3eadb",
  "serif": "Cormorant Garamond"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(() => parseHash());
  const [bookingInitial, setBookingInitial] = React.useState(null);

  // hash routing — keeps /#/admin hidden but reachable
  React.useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function go(target, data) {
    if (target === 'book') {
      setBookingInitial(data || null);
      window.location.hash = '#/book';
    } else if (target === 'admin') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/' + target;
    }
  }

  function exitBooking() {
    window.location.hash = '#/home';
  }

  // apply tweak vars to app root
  const cssVars = {
    '--rose': t.accent,
    '--bg':   t.bg,
    '--serif': `"${t.serif}", "Cormorant Garamond", serif`,
  };

  // determine if we're on a tabbed page or a full-screen flow
  const tabActive = ['home','gallery','services','contact'].includes(route);

  return (
    <>
      <IOSDevice statusBar={{ dark: false, time: '9:41' }}>
        <div className="app" style={cssVars}>
          <div key={route} className="route-pane" style={{ position: 'absolute', inset: 0 }}>
            {route === 'home'     && <HomePage     go={go}/>}
            {route === 'gallery'  && <GalleryPage  go={go}/>}
            {route === 'services' && <ServicesPage go={go}/>}
            {route === 'contact'  && <ContactPage  go={go}/>}
            {route === 'book'     && <BookingFlow initial={bookingInitial} onExit={exitBooking}/>}
            {route === 'admin'    && <AdminPanel onExit={() => go('home')}/>}
          </div>

          {tabActive && (
            <TabBar
              active={route}
              onChange={(id) => {
                if (id === 'home') go('home');
                else go(id);
              }}
            />
          )}
        </div>
      </IOSDevice>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand"/>
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#c98e8e', '#a86b6b', '#d4a0a0', '#b8836b', '#8a7355', '#c9a47c']}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakColor
          label="Background"
          value={t.bg}
          options={['#f3eadb', '#f0e6d3', '#f7f0e1', '#ede2ce', '#f5ede0']}
          onChange={(v) => setTweak('bg', v)}
        />
        <TweakSelect
          label="Serif font"
          value={t.serif}
          options={['Cormorant Garamond', 'Playfair Display', 'DM Serif Display', 'Italiana', 'EB Garamond']}
          onChange={(v) => setTweak('serif', v)}
        />
        <TweakSection label="Demo data"/>
        <TweakButton onClick={seedSampleBookings}>Seed sample bookings</TweakButton>
        <TweakButton onClick={() => { ['nailzjae.v1','nailzjae.v2','nailzjae.v3','nailzjae.v4','nailzjae.v5'].forEach(k => localStorage.removeItem(k)); sessionStorage.removeItem('nailzjae.auth'); location.reload(); }}>Reset all data</TweakButton>
      </TweaksPanel>
    </>
  );
}

function parseHash() {
  const h = (window.location.hash || '').replace(/^#\/?/, '');
  if (!h) return 'home';
  if (h.startsWith('book')) return 'book';
  if (h.startsWith('admin')) return 'admin';
  if (h.startsWith('gallery')) return 'gallery';
  if (h.startsWith('services')) return 'services';
  if (h.startsWith('contact')) return 'contact';
  return 'home';
}

// for the Tweaks "seed sample bookings" button
function seedSampleBookings() {
  const state = window.useStore ? null : null;
  // pick first open day + a slot
  const av = JSON.parse(localStorage.getItem('nailzjae.v1') || '{}').availability || {};
  const keys = Object.keys(av).filter(k => av[k].open && av[k].slots.length > 0).slice(0, 3);
  const samples = [
    { name: 'Alex Rivera', phone: '(555) 0148-2102', email: 'alex@gmail.com', social: '@alex.r',  payment: 'venmo',  status: 'pending'   },
    { name: 'Mia Chen',    phone: '(555) 0192-4480', email: 'mia@gmail.com',  social: '@miii.c',  payment: 'zelle',  status: 'confirmed' },
    { name: 'Jordan Park', phone: '(555) 0177-1029', email: 'jordan@me.com',  social: '@jdnprk',  payment: 'paypal', status: 'pending'   },
  ];
  keys.forEach((k, i) => {
    const sample = samples[i];
    if (!sample) return;
    const slot = av[k].slots[1] || av[k].slots[0];
    const b = window.addBooking({
      serviceId: 's-med-acr',
      date: k,
      time: slot,
      ...sample,
    });
    if (sample.status === 'confirmed') {
      window.updateBooking(b.id, { status: 'confirmed' });
    }
  });
}

// mount
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
