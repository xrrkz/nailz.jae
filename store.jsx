// store.jsx — localStorage-backed state for nailz.jae
// Single source of truth. All pages read/write through useStore().

const STORAGE_KEY = 'nailzjae.v5';

// ─────────────────────────────────────────────────────────────
// Default seed data
// ─────────────────────────────────────────────────────────────
const seedServices = [
  { id: 's-fullset',  category: 'Full Set',  length: '—', name: 'Full Set',  price: 0, durationMin: 120, desc: 'New acrylic full set — choose your length, shape, and design.', photo: '' },
  { id: 's-fillin',   category: 'Fill In',   length: '—', name: 'Fill In',   price: 0, durationMin: 75,  desc: 'Acrylic fill-in — my work or foreign work.', photo: '' },
  { id: 's-soakoff',  category: 'Soak Off',  length: '—', name: 'Soak Off',  price: 0, durationMin: 45,  desc: 'Full soak-off removal.', photo: '' },
];

const SERVICE_BUILDER = {
  types: [
    { id: 'full-set',  label: 'Full Set',  hasOrigin: false, hasDesign: true },
    { id: 'fill-in',   label: 'Fill In',   hasOrigin: true,  hasDesign: true },
    { id: 'soak-off',  label: 'Soak Off',  hasOrigin: true,  hasDesign: false },
  ],
  origins: [
    { id: 'my-work',      label: 'My Work' },
    { id: 'foreign-work', label: 'Foreign Work' },
  ],
  designs: [
    { id: 'french-tip',     label: 'French Tip' },
    { id: 'full-paint',     label: 'Full Paint' },
    { id: 'custom-design',  label: 'Custom Design' },
    { id: 'jems-charms',    label: 'Jems / Charms' },
  ],
};

function buildServiceName(type, origin, design) {
  const t = SERVICE_BUILDER.types.find(x => x.id === type);
  const o = SERVICE_BUILDER.origins.find(x => x.id === origin);
  const d = SERVICE_BUILDER.designs.find(x => x.id === design);
  let name = t?.label || '';
  if (o) name += ' (' + o.label + ')';
  if (d) name += ' — ' + d.label;
  return name;
}

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
    { id: 'set-6',  caption: '', src: 'assets/gallery/set-06.jpeg' },
    { id: 'set-7',  caption: '', src: 'assets/gallery/set-07.jpeg' },
    { id: 'set-8',  caption: '', src: 'assets/gallery/set-08.jpeg' },
    { id: 'set-9',  caption: '', src: 'assets/gallery/set-09.jpeg' },
    { id: 'set-10', caption: '', src: 'assets/gallery/set-10.jpeg' },
    { id: 'set-11', caption: '', src: 'assets/gallery/set-11.jpeg' },
    { id: 'set-12', caption: '', src: 'assets/gallery/set-12.jpeg' },
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
      // gallery migration — fill any empty seed slots from the bundled seed
      parsed.gallery = parsed.gallery || { sets: [], retention: [] };
      parsed.gallery.sets = parsed.gallery.sets || [];
      for (const seed of seedGallery.sets) {
        const existing = parsed.gallery.sets.find(g => g.id === seed.id);
        if (!existing) parsed.gallery.sets.push({ ...seed });
        else if (!existing.src && seed.src) existing.src = seed.src;
      }
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

// ─────────────────────────────────────────────────────────────
// Supabase sync
// Bookings + availability are the data that needs to cross devices.
// Services / settings / gallery stay client-side for now.
//
// Strategy: keep the synchronous in-memory __state as the read source
// so React code is unchanged. On load + on Realtime events we
// reconcile from Supabase. On mutate we apply optimistically and
// fire-and-forget the write.
// ─────────────────────────────────────────────────────────────
const __remote = {
  ready: false,
  enabled: typeof window !== 'undefined' && !!window.sb,
};

function rowToBooking(r) {
  return {
    id:              r.id,
    serviceId:       r.service_id,
    serviceName:     r.service_name,
    servicePrice:    r.service_price,
    date:            r.date,
    time:            r.time,
    name:            r.name,
    phone:           r.phone || '',
    email:           r.email || '',
    social:          r.social || '',
    payment:         r.payment || '',
    note:            r.note || '',
    inspirationSrc:  r.inspiration_src || '',
    status:          r.status,
    createdAt:       r.created_at ? Date.parse(r.created_at) : Date.now(),
  };
}
function bookingToRow(b, state) {
  const sv = (state || __state).services.find(s => s.id === b.serviceId);
  return {
    id:              b.id,
    service_id:      b.serviceId || null,
    service_name:    b.serviceName || sv?.name || null,
    service_price:   b.servicePrice ?? sv?.price ?? null,
    date:            b.date || ymd(new Date()),
    time:            b.time || 'TBD',
    name:            b.name,
    phone:           b.phone || null,
    email:           b.email || null,
    social:          b.social || null,
    payment:         b.payment || null,
    note:            b.note || null,
    inspiration_src: b.inspirationSrc || null,
    status:          b.status || 'pending',
  };
}

async function hydrateFromRemote() {
  if (!__remote.enabled) return;
  const sb = window.sb;

  const [{ data: bookings, error: be },
         { data: avail,    error: ae },
         { data: booked,   error: pe }] =
    await Promise.all([
      sb.from('bookings').select('*').order('created_at', { ascending: false }),
      sb.from('availability').select('*'),
      sb.rpc('public_booked_slots'),
    ]);

  if (be) console.warn('[store] bookings load failed', be);
  if (ae) console.warn('[store] availability load failed', ae);
  if (pe) console.warn('[store] booked_slots load failed', pe);

  mutate(s => {
    const next = { ...s };
    if (!be && bookings && bookings.length) {
      next.bookings = bookings.map(rowToBooking);
    } else if (!be) {
      // anon: keep empty
      next.bookings = [];
    }
    if (!ae && avail) {
      const map = {};
      avail.forEach(row => { map[row.date] = { open: row.open, slots: row.slots || [] }; });
      next.availability = { ...s.availability, ...map };
    }
    if (!pe && booked) {
      const bt = {};
      booked.forEach(({ date, time }) => {
        (bt[date] ||= new Set()).add(time);
      });
      next.bookedTimes = bt;
    }
    return next;
  });

  __remote.ready = true;
}

function subscribeRemote() {
  if (!__remote.enabled) return;
  const sb = window.sb;

  sb.channel('bookings-stream')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
      mutate(s => {
        const list = s.bookings.slice();
        if (payload.eventType === 'INSERT') {
          const b = rowToBooking(payload.new);
          if (!list.find(x => x.id === b.id)) list.unshift(b);
        } else if (payload.eventType === 'UPDATE') {
          const b = rowToBooking(payload.new);
          const i = list.findIndex(x => x.id === b.id);
          if (i >= 0) list[i] = b; else list.unshift(b);
        } else if (payload.eventType === 'DELETE') {
          const id = payload.old?.id;
          return { ...s, bookings: list.filter(x => x.id !== id) };
        }
        return { ...s, bookings: list };
      });
    })
    .subscribe();

  sb.channel('availability-stream')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'availability' }, (payload) => {
      mutate(s => {
        const av = { ...s.availability };
        if (payload.eventType === 'DELETE') {
          delete av[payload.old?.date];
        } else if (payload.new) {
          av[payload.new.date] = { open: payload.new.open, slots: payload.new.slots || [] };
        }
        return { ...s, availability: av };
      });
    })
    .subscribe();
}

// kick it off
if (__remote.enabled) {
  hydrateFromRemote().then(subscribeRemote);
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

function _persistDay(dateKey, day) {
  if (!__remote.enabled) return;
  window.sb.from('availability')
    .upsert({ date: dateKey, open: day.open, slots: day.slots })
    .then(({ error }) => { if (error) console.warn('[store] availability upsert failed', error); });
}

function toggleDayOpen(dateKey) {
  let nextDay;
  mutate(s => {
    const day = s.availability[dateKey] || { open: false, slots: [] };
    const open = !day.open;
    nextDay = { ...day, open, slots: open && day.slots.length === 0 ? ['9:00 AM','10:30 AM','12:00 PM','1:30 PM','3:00 PM','4:30 PM'] : day.slots };
    return { ...s, availability: { ...s.availability, [dateKey]: nextDay } };
  });
  _persistDay(dateKey, nextDay);
}
function setDaySlots(dateKey, slots) {
  let nextDay;
  mutate(s => {
    const day = s.availability[dateKey] || { open: true, slots: [] };
    nextDay = { ...day, slots };
    return { ...s, availability: { ...s.availability, [dateKey]: nextDay } };
  });
  _persistDay(dateKey, nextDay);
}

function _uuid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return 'b-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function _sendBookingEmail(kind, booking) {
  if (!__remote.enabled || !booking?.email) return;
  const sv = __state.services.find(s => s.id === booking.serviceId);
  const payload = {
    kind,
    booking: {
      name:          booking.name,
      email:         booking.email,
      service_name:  booking.serviceName || sv?.name || 'Your appointment',
      service_price: booking.servicePrice ?? sv?.price ?? null,
      date:          booking.date,
      time:          booking.time,
      payment:       booking.payment || '',
      note:          booking.note || '',
      deposit_amount: __state.settings?.depositAmount ?? 15,
    },
  };
  window.sb.functions.invoke('send-booking-email', { body: payload })
    .then(({ error }) => { if (error) console.warn('[store] email send failed', error); })
    .catch(err => console.warn('[store] email send threw', err));
}

function addBooking(b) {
  const id = _uuid();
  const booking = { ...b, id, status: 'pending', createdAt: Date.now() };
  mutate(s => ({ ...s, bookings: [booking, ...s.bookings] }));
  if (__remote.enabled) {
    window.sb.from('bookings').insert(bookingToRow(booking)).then(({ error }) => {
      if (error) console.warn('[store] booking insert failed', error);
      else _sendBookingEmail('received', booking);
    });
  }
  return booking;
}
function updateBooking(id, patch) {
  let prev;
  mutate(s => {
    prev = s.bookings.find(b => b.id === id);
    return { ...s, bookings: s.bookings.map(b => b.id === id ? { ...b, ...patch } : b) };
  });
  if (__remote.enabled) {
    const row = {};
    if (patch.status         !== undefined) row.status          = patch.status;
    if (patch.note           !== undefined) row.note            = patch.note;
    if (patch.inspirationSrc !== undefined) row.inspiration_src = patch.inspirationSrc;
    if (patch.servicePrice   !== undefined) row.service_price   = patch.servicePrice;
    if (Object.keys(row).length === 0) return;
    window.sb.from('bookings').update(row).eq('id', id).then(({ error }) => {
      if (error) console.warn('[store] booking update failed', error);
      else if (patch.status === 'confirmed' && prev && prev.status !== 'confirmed') {
        _sendBookingEmail('confirmed', { ...prev, ...patch });
      }
    });
  }
}
function removeBooking(id) {
  mutate(s => ({ ...s, bookings: s.bookings.filter(b => b.id !== id) }));
  if (__remote.enabled) {
    window.sb.from('bookings').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('[store] booking delete failed', error);
    });
  }
}

function updateHandle(method, patch) {
  mutate(s => ({ ...s, handles: { ...s.handles, [method]: { ...s.handles[method], ...patch } } }));
}
function updateSettings(patch) {
  mutate(s => ({ ...s, settings: { ...s.settings, ...patch } }));
}

// queries
function bookedTimesFor(dateKey) {
  // returns Set of times that are pending or confirmed for that date.
  // Sources: in-memory bookings (admin can read full rows) + the
  // public_booked_slots() cache (so anon visitors also see taken slots).
  const set = new Set();
  __state.bookings.forEach(b => {
    if (b.date === dateKey && (b.status === 'pending' || b.status === 'confirmed')) {
      set.add(b.time);
    }
  });
  const pub = __state.bookedTimes?.[dateKey];
  if (pub) pub.forEach(t => set.add(t));
  return set;
}

async function lookupBookingsByContact(contact) {
  if (!__remote.enabled) return [];
  const clean = (contact || '').trim();
  if (!clean) return [];
  const { data, error } = await window.sb.rpc('bookings_by_contact', { p_contact: clean });
  if (error) {
    console.warn('[store] lookup failed', error);
    throw error;
  }
  return (data || []).map(rowToBooking);
}

// expose globals
Object.assign(window, {
  useStore, mutate,
  updateService, addService, removeService,
  toggleDayOpen, setDaySlots,
  addBooking, updateBooking, removeBooking,
  updateHandle, updateSettings,
  bookedTimesFor,
  lookupBookingsByContact,
  ymd, parseYmd, fmtDateLong, fmtDateShort,
  SERVICE_BUILDER, buildServiceName,
});
