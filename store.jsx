// store.jsx — localStorage-backed state for nailz.jae
// Single source of truth. All pages read/write through useStore().

const STORAGE_KEY = 'nailzjae.v5';

// ─────────────────────────────────────────────────────────────
// Default seed data
// ─────────────────────────────────────────────────────────────
const seedServices = [
  { id: 's-short-acr',  category: 'Acrylic Full Set', length: 'Short',  name: 'Short Acrylic Set',   price: 40, durationMin: 90,  desc: 'Any shape included — almond, coffin, square, stiletto. Classic finish.', photo: '' },
  { id: 's-med-acr',    category: 'Acrylic Full Set', length: 'Medium', name: 'Medium Acrylic Set',  price: 55, durationMin: 105, desc: 'A little extra length. Most designs included.', photo: '' },
  { id: 's-long-acr',   category: 'Acrylic Full Set', length: 'Long',   name: 'Long Acrylic Set',    price: 65, durationMin: 120, desc: 'Statement length. Any shape, most designs.', photo: '' },
  { id: 's-xlong-acr',  category: 'Acrylic Full Set', length: 'X-Long', name: 'X-Long Acrylic Set',  price: 75, durationMin: 135, desc: 'Drama. Maximum length, full glam.', photo: '' },
  { id: 's-overlay',    category: 'Gel Overlay',      length: 'Natural',name: 'Gel Overlay',         price: 35, durationMin: 75,  desc: 'On natural nails. Strengthens + shines.', photo: '' },
  { id: 's-mani',       category: 'Manicure',         length: 'Natural',name: 'Manicure',            price: 25, durationMin: 45,  desc: 'Shape, cuticle care, and polish.', photo: '' },
  { id: 's-fill',       category: 'Refill',           length: '—',      name: 'Acrylic Refill',      price: 45, durationMin: 75,  desc: 'Within 3 weeks of original set.', photo: '' },
  { id: 's-soak',       category: 'Add-on',           length: '—',      name: 'Soak Off',            price: 15, durationMin: 30,  desc: 'Add-on to any new set.', photo: '' },
  { id: 's-bling',      category: 'Add-on',           length: '—',      name: 'Bling-Out / 3D / Charms', price: 15, durationMin: 30, desc: 'Premium add-on. Final price varies with detail.', photo: '' },
  { id: 's-designs',    category: 'Add-on',           length: '—',      name: 'Custom Nail Designs', price: 10, durationMin: 20,  desc: 'Most designs included with a set — this is for extra-intricate work, per 5 nails.', photo: '' },
];

// payment handles (editable)
const seedHandles = {
  venmo:   { handle: '@jaelyn-ervin', display: '@jaelyn-ervin' },
  zelle:   { handle: 'jaelynervin@email.com', display: 'jaelynervin@email.com' },
  paypal:  { handle: '@jaelynervin', display: '@jaelynervin' },
  chime:   { handle: '$jaelynervin', display: '$jaelynervin' },
};

// gallery slots — keys map to image-slot ids
const seedGallery = {
  sets: [
    { id: 'set-1', caption: '', src: 'assets/gallery/set-01.jpeg' },
    { id: 'set-2', caption: '', src: 'assets/gallery/set-02.jpeg' },
    { id: 'set-3', caption: '', src: 'assets/gallery/set-03.jpeg' },
    { id: 'set-4', caption: '', src: 'assets/gallery/set-04.jpeg' },
    { id: 'set-5', caption: '', src: 'assets/gallery/set-05.jpeg' },
    { id: 'set-6', caption: '', src: 'assets/gallery/set-06.jpeg' },
    { id: 'set-7', caption: '', src: '' },
    { id: 'set-8', caption: '', src: '' },
    { id: 'set-9', caption: '', src: '' },
  ],
  retention: Array.from({ length: 4 }, (_, i) => ({ id: `ret-${i+1}`, caption: '', src: '' })),
};

// availability — { 'YYYY-MM-DD': { open: bool, slots: ['10:00','11:30',...] } }
// pre-seed next 21 days as open with default slots
function defaultAvailability() {
  const result = {};
  const defaultSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM'];
  const today = new Date();
  for (let i = 0; i < 28; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = ymd(d);
    const dow = d.getDay();
    // Mon–Sat open by default, Sunday closed
    const open = dow !== 0;
    result[key] = { open, slots: open ? [...defaultSlots] : [] };
  }
  return result;
}

const seedBookings = []; // [{id, serviceId, date, time, name, phone, email, social, status, createdAt, payment}]

// ─────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtDateLong(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function fmtDateShort(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────
function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // light migration — make sure availability has a forward window
      if (!parsed.availability || Object.keys(parsed.availability).length === 0) {
        parsed.availability = defaultAvailability();
      } else {
        // top up missing future days
        const av = parsed.availability;
        const today = new Date();
        for (let i = 0; i < 28; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const key = ymd(d);
          if (!av[key]) {
            const dow = d.getDay();
            const open = dow !== 0;
            const defaultSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM'];
            av[key] = { open, slots: open ? [...defaultSlots] : [] };
          }
        }
      }
      // default admin creds if missing
      parsed.settings = parsed.settings || {};
      if (!parsed.settings.adminUser) parsed.settings.adminUser = 'jae';
      if (!parsed.settings.adminPass) parsed.settings.adminPass = 'nailz';
      return parsed;
    }
  } catch (e) { /* fall through */ }
  return {
    services: seedServices,
    handles: seedHandles,
    gallery: seedGallery,
    availability: defaultAvailability(),
    bookings: seedBookings,
    settings: {
      welcome: "I'm back — with stronger passion and a deeper love for what I do. My goal is for every client to feel comfortable, taken care of, and completely satisfied in my chair. Can't wait to have you in.",
      depositAmount: 15,
      psaShort: "Books are open ✶",
      adminUser: "jae",
      adminPass: "nailz",
    },
  };
}

function saveStore(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// React context-less hook: simple pub/sub
const __subs = new Set();
let __state = loadStore();

function useStore() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    __subs.add(force);
    return () => __subs.delete(force);
  }, []);
  return [__state, mutate];
}

function mutate(updater) {
  __state = typeof updater === 'function' ? updater(__state) : { ...__state, ...updater };
  saveStore(__state);
  __subs.forEach(f => f());
}

// helper mutations
function updateService(id, patch) {
  mutate(s => ({ ...s, services: s.services.map(sv => sv.id === id ? { ...sv, ...patch } : sv) }));
}
function addService() {
  const id = 's-' + Date.now();
  mutate(s => ({ ...s, services: [...s.services, { id, category: 'Custom', length: '—', name: 'New service', price: 0, durationMin: 60, desc: '', photo: '' }] }));
  return id;
}
function removeService(id) {
  mutate(s => ({ ...s, services: s.services.filter(sv => sv.id !== id) }));
}

function toggleDayOpen(dateKey) {
  mutate(s => {
    const day = s.availability[dateKey] || { open: false, slots: [] };
    const open = !day.open;
    return { ...s, availability: { ...s.availability, [dateKey]: { ...day, open, slots: open && day.slots.length === 0 ? ['9:00 AM','10:30 AM','12:00 PM','1:30 PM','3:00 PM','4:30 PM'] : day.slots } } };
  });
}
function setDaySlots(dateKey, slots) {
  mutate(s => {
    const day = s.availability[dateKey] || { open: true, slots: [] };
    return { ...s, availability: { ...s.availability, [dateKey]: { ...day, slots } } };
  });
}

function addBooking(b) {
  const id = 'b-' + Date.now();
  const booking = { ...b, id, status: 'pending', createdAt: Date.now() };
  mutate(s => ({ ...s, bookings: [...s.bookings, booking] }));
  return booking;
}
function updateBooking(id, patch) {
  mutate(s => ({ ...s, bookings: s.bookings.map(b => b.id === id ? { ...b, ...patch } : b) }));
}
function removeBooking(id) {
  mutate(s => ({ ...s, bookings: s.bookings.filter(b => b.id !== id) }));
}

function updateHandle(method, patch) {
  mutate(s => ({ ...s, handles: { ...s.handles, [method]: { ...s.handles[method], ...patch } } }));
}
function updateSettings(patch) {
  mutate(s => ({ ...s, settings: { ...s.settings, ...patch } }));
}

// queries
function bookedTimesFor(dateKey) {
  // returns Set of times that are pending or confirmed for that date
  const set = new Set();
  __state.bookings.forEach(b => {
    if (b.date === dateKey && (b.status === 'pending' || b.status === 'confirmed')) {
      set.add(b.time);
    }
  });
  return set;
}

// expose globals
Object.assign(window, {
  useStore, mutate,
  updateService, addService, removeService,
  toggleDayOpen, setDaySlots,
  addBooking, updateBooking, removeBooking,
  updateHandle, updateSettings,
  bookedTimesFor,
  ymd, parseYmd, fmtDateLong, fmtDateShort,
});
