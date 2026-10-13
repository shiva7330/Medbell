import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import { Button, EmptyState, Field, Screen, Toggle, TopBar } from '../components/ui';
import { rupees } from '../utils';

export function Profile() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const items = [
    ['pin', 'Saved addresses', '/addresses'],
    ['box', 'My orders', '/orders'],
    ['bell', 'Notifications', '/notifications'],
    ['file', 'Edit profile', '/profile/edit'],
  ];

  return (
    <Screen nav>
      <div className="screen__body" style={{ paddingTop: 20 }}>
        <h1 className="title">Profile</h1>
        <div className="card card--pad row" style={{ gap: 14 }}>
          <span className="avatar" style={{ width: 64, height: 64, fontSize: 26 }}>
            {user.name[0]}
          </span>
          <div className="col">
            <strong style={{ fontSize: 18 }}>{user.name}</strong>
            <span className="caption">{user.email}</span>
          </div>
        </div>
        <div className="card list">
          {items.map(([icon, label, to]) => (
            <button key={label} className="list__item" onClick={() => navigate(to)}>
              <Icon name={icon} size={22} />
              <span className="grow">{label}</span>
              <Icon name="chevR" size={20} style={{ color: 'var(--muted)' }} />
            </button>
          ))}
        </div>
        <Button
          variant="danger"
          icon="logout"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          Log out
        </Button>
      </div>
    </Screen>
  );
}

export function EditProfile() {
  const { user, updateUser, showToast } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone, dob: user.dob });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.name.trim()) err.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = 'Enter a valid email';
    setErrors(err);
    if (Object.keys(err).length) return;
    updateUser({ ...f, name: f.name.trim() });
    showToast('Profile updated');
    navigate(-1);
  };

  return (
    <form onSubmit={submit} className="screen" noValidate>
      <TopBar title="Edit profile" />
      <div className="screen__body">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
          <span className="avatar" style={{ width: 96, height: 96, fontSize: 40, position: 'relative' }}>
            {f.name[0] || 'A'}
            <span className="avatar" style={{ position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, background: 'var(--accent)', color: 'var(--ink)', border: '3px solid var(--bg)' }}>
              <Icon name="camera" size={16} />
            </span>
          </span>
        </div>
        <Field label="Full name" value={f.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" type="email" value={f.email} onChange={set('email')} error={errors.email} />
        <Field label="Mobile number" value={f.phone ? `+91 ${f.phone}` : ''} readOnly />
        <Field label="Date of birth" type="date" value={f.dob} onChange={set('dob')} />
        <div className="spacer" />
      </div>
      <div className="screen__footer">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}

export function MyOrders() {
  const { orders } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const age = (o) => Date.now() - o.createdAt;
  const delivered = (o) => age(o) > 60000;
  const list = orders.filter((o) => (tab === 'All' ? true : tab === 'Delivered' ? delivered(o) : !delivered(o)));

  return (
    <Screen nav>
      <TopBar title="My orders" />
      <div className="screen__body">
        <div className="pill-row" role="tablist">
          {['All', 'Active', 'Delivered'].map((t) => (
            <button key={t} role="tab" aria-selected={t === tab} className={`pill ${t === tab ? 'pill--active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        {orders.length === 0 ? (
          <EmptyState icon="box" title="No orders yet" text="Your orders will show up here after you place one." action="Browse shop" onAction={() => navigate('/shop')} />
        ) : (
          list.map((o) => (
            <button key={o.id} className="card card--pad col" style={{ gap: 10, textAlign: 'left', width: '100%' }} onClick={() => navigate(`/orders/${o.id}`)}>
              <div className="row row--between">
                <strong style={{ fontSize: 16 }}>Order #{o.id}</strong>
                <span className={`chip ${delivered(o) ? 'chip--taken' : 'chip--upcoming'}`}>{delivered(o) ? 'Delivered' : 'On the way'}</span>
              </div>
              <div className="row">
                <span className="icon-tile" style={{ width: 48, height: 48 }}>
                  <Icon name="box" size={22} />
                </span>
                <div className="col grow">
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{o.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ')}</span>
                  <span className="caption">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {o.items.reduce((n, i) => n + i.qty, 0)} items
                  </span>
                </div>
                <span className="price" style={{ color: 'var(--primary)' }}>
                  {rupees(o.total)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </Screen>
  );
}

export function SavedAddresses() {
  const { addresses, selectedAddressId, removeAddress } = useApp();
  const navigate = useNavigate();

  return (
    <Screen footer={<Button variant="secondary" onClick={() => navigate('/addresses/new')}>+ Add new address</Button>}>
      <TopBar title="Saved addresses" />
      <div className="screen__body">
        {addresses.length === 0 && <p className="body-2">No saved addresses yet.</p>}
        {addresses.map((a) => (
          <div key={a.id} className={`card card--pad row ${a.id === selectedAddressId ? 'card--selected' : ''}`} style={{ background: a.id === selectedAddressId ? 'var(--surface)' : undefined }}>
            <span className="icon-tile">
              <Icon name="pin" size={22} />
            </span>
            <div className="col grow" style={{ gap: 2 }}>
              <span className="row" style={{ gap: 8 }}>
                <strong>{a.label}</strong>
                {a.id === selectedAddressId && <span className="chip chip--plain">Default</span>}
              </span>
              <span className="caption">{a.line}</span>
            </div>
            <button onClick={() => window.confirm(`Delete ${a.label} address?`) && removeAddress(a.id)} aria-label={`Delete ${a.label} address`} style={{ color: 'var(--muted)' }}>
              <Icon name="trash" size={20} />
            </button>
          </div>
        ))}
      </div>
    </Screen>
  );
}

const SETTINGS = [
  ['dose', 'Dose reminders', 'Alerts at your set times'],
  ['missed', 'Missed dose alerts', 'Nudge after 15 minutes'],
  ['refill', 'Refill reminders', 'When stock is running low'],
  ['orders', 'Order updates', 'Packed, shipped, delivered'],
  ['offers', 'Offers and tips', 'Occasional health offers'],
];

export function Notifications() {
  const { settings, toggleSetting } = useApp();
  return (
    <Screen>
      <TopBar title="Notifications" />
      <div className="screen__body">
        <div className="card list">
          {SETTINGS.map(([key, title, sub]) => (
            <div key={key} className="list__item">
              <div className="col grow" style={{ gap: 2 }}>
                <span>{title}</span>
                <span className="caption" style={{ fontWeight: 500 }}>
                  {sub}
                </span>
              </div>
              <Toggle on={settings[key]} onChange={() => toggleSetting(key)} label={title} />
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
