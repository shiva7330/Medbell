import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { findProduct } from '../data/products';
import { dateKey } from '../utils';

const STORAGE_KEY = 'medbell-state-v1';

const seed = () => ({
  auth: false,
  user: { name: 'Alex Morgan', email: 'alex.morgan@example.com', phone: '', dob: '1992-06-14' },
  meds: [
    { id: 'm1', name: 'Amoxicillin', dose: '500 mg · 1 capsule', instructions: 'Before meal', time: '08:30', stock: 12, taken: {} },
    { id: 'm2', name: 'Lisinopril', dose: '10 mg · 1 capsule', instructions: 'After meal', time: '13:30', stock: 5, taken: {} },
    { id: 'm3', name: 'Vitamin D3', dose: '1000 IU · 1 capsule', instructions: 'After meal', time: '21:30', stock: 24, taken: {} },
  ],
  cart: [],
  addresses: [
    { id: 'a1', label: 'Home', line: 'Plot 12, Road No. 4, Madhapur, Hyderabad 500081' },
    { id: 'a2', label: 'Work', line: 'Floor 3, Hitech City Main Rd, Hyderabad 500081' },
  ],
  selectedAddressId: 'a1',
  orders: [],
  settings: { dose: true, missed: true, refill: true, orders: true, offers: false },
});

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...seed(), ...JSON.parse(raw) } : seed();
  } catch {
    return seed();
  }
};

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [state, setState] = useState(load);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable - app still works in memory */
    }
  }, [state]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const patch = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  const actions = useMemo(
    () => ({
      showToast: setToast,

      // ---- auth / profile ----
      login: (phone) => patch((s) => ({ auth: true, user: { ...s.user, phone } })),
      logout: () => patch(() => ({ auth: false })),
      updateUser: (u) => patch((s) => ({ user: { ...s.user, ...u } })),

      // ---- medicines ----
      addMed: (med) => patch((s) => ({ meds: [...s.meds, { ...med, id: `m${Date.now()}`, taken: {} }] })),
      updateMed: (id, data) => patch((s) => ({ meds: s.meds.map((m) => (m.id === id ? { ...m, ...data } : m)) })),
      deleteMed: (id) => patch((s) => ({ meds: s.meds.filter((m) => m.id !== id) })),
      markTaken: (id, key = dateKey()) =>
        patch((s) => ({
          meds: s.meds.map((m) =>
            m.id === id && !m.taken[key]
              ? { ...m, taken: { ...m.taken, [key]: true }, stock: Math.max(0, m.stock - 1) }
              : m,
          ),
        })),

      // ---- cart ----
      addToCart: (id) =>
        patch((s) => {
          const found = s.cart.find((c) => c.id === id);
          return {
            cart: found ? s.cart.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)) : [...s.cart, { id, qty: 1 }],
          };
        }),
      setQty: (id, qty) =>
        patch((s) => ({
          cart: qty <= 0 ? s.cart.filter((c) => c.id !== id) : s.cart.map((c) => (c.id === id ? { ...c, qty } : c)),
        })),

      // ---- addresses ----
      addAddress: (addr) =>
        patch((s) => {
          const id = `a${Date.now()}`;
          return { addresses: [...s.addresses, { ...addr, id }], selectedAddressId: id };
        }),
      removeAddress: (id) =>
        patch((s) => {
          const addresses = s.addresses.filter((a) => a.id !== id);
          return {
            addresses,
            selectedAddressId: s.selectedAddressId === id ? addresses[0]?.id ?? null : s.selectedAddressId,
          };
        }),
      selectAddress: (id) => patch(() => ({ selectedAddressId: id })),

      // ---- orders ----
      placeOrder: (payment) => {
        let order;
        setState((s) => {
          const items = s.cart.map((c) => {
            const p = findProduct(c.id);
            return { id: c.id, name: p.name, meta: p.meta, price: p.price, qty: c.qty };
          });
          order = {
            id: `MB${2000 + s.orders.length + 48}`,
            items,
            total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
            createdAt: Date.now(),
            address: s.addresses.find((a) => a.id === s.selectedAddressId) ?? null,
            payment,
          };
          return { ...s, orders: [order, ...s.orders], cart: [] };
        });
        return order;
      },

      toggleSetting: (key) => patch((s) => ({ settings: { ...s.settings, [key]: !s.settings[key] } })),
    }),
    [patch],
  );

  const value = useMemo(() => ({ ...state, ...actions, toast }), [state, actions, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
