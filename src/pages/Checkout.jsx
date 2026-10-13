import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import { Button, EmptyState, Field, Screen, Segments, TopBar } from '../components/ui';
import { findProduct } from '../data/products';
import { rupees } from '../utils';

const cartTotal = (cart) => cart.reduce((s, c) => s + (findProduct(c.id)?.price || 0) * c.qty, 0);

export function Address() {
  const { addresses, selectedAddressId, selectAddress, cart } = useApp();
  const navigate = useNavigate();
  if (!cart.length) return <Navigate to="/cart" replace />;

  return (
    <Screen
      footer={
        <>
          <Button onClick={() => navigate('/payment')} disabled={!selectedAddressId}>
            Deliver here
          </Button>
          <Button variant="secondary" onClick={() => navigate('/addresses/new')}>
            + Add new address
          </Button>
        </>
      }
    >
      <TopBar title="Delivery address" />
      <div className="screen__body">
        {addresses.length === 0 && <p className="body-2">You have no saved addresses yet. Add one to continue.</p>}
        {addresses.map((a) => {
          const on = a.id === selectedAddressId;
          return (
            <button key={a.id} className={`card card--pad row ${on ? 'card--selected' : ''}`} style={{ textAlign: 'left', width: '100%' }} onClick={() => selectAddress(a.id)} aria-pressed={on}>
              <span className="icon-tile" style={{ background: on ? 'var(--surface)' : undefined }}>
                <Icon name="pin" size={22} />
              </span>
              <span className="col grow" style={{ gap: 2 }}>
                <strong>{a.label}</strong>
                <span className="body-2" style={{ fontSize: 14 }}>
                  {a.line}
                </span>
              </span>
              {on && <Icon name="check" size={22} stroke={2.6} style={{ color: 'var(--primary)' }} />}
            </button>
          );
        })}
      </div>
    </Screen>
  );
}

export function AddAddress() {
  const { addAddress, showToast } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ house: '', street: '', city: 'Hyderabad', pincode: '', label: 'Home' });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.house.trim()) err.house = 'Enter house or flat number';
    if (!f.street.trim()) err.street = 'Enter street or area';
    if (!f.city.trim()) err.city = 'Enter city';
    if (!/^\d{6}$/.test(f.pincode)) err.pincode = 'Enter a 6-digit pincode';
    setErrors(err);
    if (Object.keys(err).length) return;
    addAddress({ label: f.label, line: `${f.house.trim()}, ${f.street.trim()}, ${f.city.trim()} ${f.pincode}` });
    showToast('Address saved');
    navigate(-1);
  };

  return (
    <form onSubmit={submit} className="screen" noValidate>
      <TopBar title="Add address" />
      <div className="screen__body" style={{ paddingTop: 12 }}>
        <Field label="House / flat no." value={f.house} onChange={set('house')} error={errors.house} />
        <Field label="Street / area" value={f.street} onChange={set('street')} error={errors.street} />
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="grow">
            <Field label="City" value={f.city} onChange={set('city')} error={errors.city} />
          </div>
          <div className="grow">
            <Field label="Pincode" inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value.replace(/\D/g, '') })} error={errors.pincode} />
          </div>
        </div>
        <div className="field">
          <span className="field__label">Save as</span>
          <Segments
            value={f.label}
            onChange={(label) => setF({ ...f, label })}
            options={[
              { value: 'Home', label: 'Home', icon: 'home' },
              { value: 'Work', label: 'Work', icon: 'briefcase' },
              { value: 'Other', label: 'Other', icon: 'pin' },
            ]}
          />
        </div>
        <div className="spacer" />
      </div>
      <div className="screen__footer">
        <Button type="submit">Save address</Button>
      </div>
    </form>
  );
}

const METHODS = [
  { id: 'upi', icon: 'phone', title: 'UPI', sub: 'Pay with any UPI app' },
  { id: 'card', icon: 'card', title: 'Debit / credit card', sub: 'Visa, Mastercard, RuPay' },
  { id: 'cod', icon: 'wallet', title: 'Cash on delivery', sub: 'Pay when it arrives' },
];

export function Payment() {
  const { cart, placeOrder } = useApp();
  const navigate = useNavigate();
  const [method, setMethod] = useState('upi');
  const [busy, setBusy] = useState(false);
  const total = cartTotal(cart);

  if (!cart.length && !busy) return <Navigate to="/cart" replace />;

  const pay = () => {
    setBusy(true);
    // Demo payment: succeeds when online, fails when the browser is offline
    setTimeout(() => {
      if (!navigator.onLine) {
        navigate('/payment-failed', { replace: true });
        return;
      }
      const order = placeOrder(method);
      navigate(`/order-success/${order.id}`, { replace: true });
    }, 900);
  };

  return (
    <Screen footer={<Button onClick={pay} disabled={busy}>{busy ? 'Processing…' : `Pay ${rupees(total)}`}</Button>}>
      <TopBar title="Payment" />
      <div className="screen__body">
        <h2 className="h2">Choose a method</h2>
        {METHODS.map((m) => {
          const on = m.id === method;
          return (
            <button key={m.id} className={`card card--pad row ${on ? 'card--selected' : ''}`} style={{ textAlign: 'left', width: '100%' }} onClick={() => setMethod(m.id)} aria-pressed={on}>
              <span className="icon-tile" style={{ background: on ? 'var(--surface)' : 'var(--bg)' }}>
                <Icon name={m.icon} size={22} />
              </span>
              <span className="col grow" style={{ gap: 2 }}>
                <strong>{m.title}</strong>
                <span className="caption">{m.sub}</span>
              </span>
              <span className={`radio ${on ? 'radio--on' : ''}`} />
            </button>
          );
        })}
        <div className="card card--pad row row--between">
          <span className="body-2" style={{ fontWeight: 500 }}>
            Amount to pay
          </span>
          <span className="price price--big" style={{ fontSize: 22 }}>
            {rupees(total)}
          </span>
        </div>
      </div>
    </Screen>
  );
}

export function PaymentFailed() {
  const navigate = useNavigate();
  return (
    <Screen>
      <EmptyState
        icon="alert"
        tone="danger"
        title="Payment failed"
        text="Your money is safe. Nothing was charged. Try again or pick another method."
        action="Try again"
        onAction={() => navigate('/payment', { replace: true })}
      />
    </Screen>
  );
}

export function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <Screen
      footer={
        <>
          <Button onClick={() => navigate(`/orders/${id}`, { replace: true })}>Track order</Button>
          <Button variant="secondary" onClick={() => navigate('/home', { replace: true })}>
            Back to home
          </Button>
        </>
      }
    >
      <div className="empty">
        <div className="empty__halo" style={{ background: 'var(--success-soft)' }}>
          <span className="avatar" style={{ width: 96, height: 96, background: 'var(--success)' }}>
            <Icon name="check" size={52} stroke={3} />
          </span>
        </div>
        <h1 className="title">Order placed!</h1>
        <p>Your medicines will reach you in about an hour.</p>
        <span className="chip chip--plain" style={{ background: 'var(--bg)', color: 'var(--ink-2)', fontSize: 14 }}>
          Order #{id}
        </span>
      </div>
    </Screen>
  );
}

const STEPS = [
  { icon: 'check', title: 'Order placed', offset: 0 },
  { icon: 'box', title: 'Packed', offset: 1 },
  { icon: 'truck', title: 'Out for delivery', offset: 2 },
  { icon: 'pin', title: 'Delivered', offset: 3 },
];

// Demo tracker: the order advances one step every 20 seconds
const STEP_MS = 20000;
const stepFor = (order, now) => Math.min(STEPS.length - 1, Math.floor((now - order.createdAt) / STEP_MS));

export function OrderTracking() {
  const { id } = useParams();
  const { orders } = useApp();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === id);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(t);
  }, []);

  if (!order) {
    return (
      <Screen>
        <TopBar title="Track order" />
        <EmptyState icon="box" title="Order not found" text="We could not find that order." action="My orders" onAction={() => navigate('/orders')} />
      </Screen>
    );
  }

  const step = stepFor(order, now);
  const time = (offset) =>
    new Date(order.createdAt + offset * 20 * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <Screen footer={<Button variant="secondary" onClick={() => navigate('/profile')}>Contact support</Button>}>
      <TopBar title="Track order" />
      <div className="screen__body">
        <section className="hero" style={{ gap: 4 }}>
          <span style={{ color: 'var(--primary-soft)', fontSize: 14, fontWeight: 500 }}>Order #{order.id}</span>
          <h2 className="title" style={{ fontSize: 24, color: '#fff' }}>
            {step === 3 ? 'Delivered' : `Arriving by ${time(3)}`}
          </h2>
          <span style={{ color: 'var(--primary-soft)', fontSize: 14 }}>
            {order.items.reduce((n, i) => n + i.qty, 0)} items · {rupees(order.total)}
          </span>
        </section>

        <div className="card timeline">
          {STEPS.map((s, i) => {
            const state = i < step || (i === step && step === 3) ? 'done' : i === step ? 'now' : 'todo';
            return (
              <div key={s.title} className={`tl-step tl-step--${state}`}>
                <div className="tl-step__rail">
                  <span className={`tl-dot ${state === 'done' ? 'tl-dot--done' : state === 'now' ? 'tl-dot--now' : ''}`}>
                    <Icon name={s.icon} size={18} stroke={2.4} />
                  </span>
                  {i < STEPS.length - 1 && <span className={`tl-line ${i < step ? 'tl-line--done' : ''}`} />}
                </div>
                <div className="tl-step__text col">
                  <strong>{s.title}</strong>
                  <span className="caption">{i <= step ? time(s.offset) : `Expected ${time(s.offset)}`}</span>
                </div>
              </div>
            );
          })}
        </div>
        {order.address && (
          <div className="card card--pad row">
            <span className="icon-tile">
              <Icon name="pin" size={22} />
            </span>
            <div className="col">
              <strong>{order.address.label}</strong>
              <span className="caption">{order.address.line}</span>
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}
