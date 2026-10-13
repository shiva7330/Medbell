// Local-date helpers (avoid UTC shifts from toISOString)
export const dateKey = (d = new Date()) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD

export const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const fmt12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const periodOf = (hhmm) => {
  const h = Number(hhmm.split(':')[0]);
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Night';
};

export const PERIOD_DEFAULT_TIME = { Morning: '08:00', Afternoon: '13:00', Night: '21:00' };

export const rupees = (n) => `₹${n.toLocaleString('en-IN')}`;

// Week strip starting Monday for the week containing `base`
export const weekDays = (base = new Date()) => {
  const d = new Date(base);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return {
      key: dateKey(x),
      label: x.toLocaleDateString('en-US', { weekday: 'short' }),
      num: x.getDate(),
    };
  });
};

// Status of a medicine on a given day
export const statusOf = (med, key) => {
  if (med.taken?.[key]) return 'Taken';
  const today = dateKey();
  if (key < today) return 'Missed';
  if (key === today && med.time < nowHHMM()) return 'Missed';
  return 'Upcoming';
};
