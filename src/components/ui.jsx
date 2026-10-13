import { NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon';

export function Button({ variant = 'primary', icon, children, ...props }) {
  return (
    <button className={`btn btn--${variant}`} {...props}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}

export function Field({ label, error, id, ...props }) {
  const fieldId = id || `f-${label.toLowerCase().replace(/\W+/g, '-')}`;
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input id={fieldId} className="field__input" aria-invalid={!!error} {...props} />
      {error && (
        <span className="field__error" role="alert">
          <Icon name="alert" size={16} /> {error}
        </span>
      )}
    </div>
  );
}

// status: Taken | Upcoming | Missed
export function StatusChip({ status }) {
  const label = status === 'Upcoming' ? 'Up next' : status;
  return <span className={`chip chip--${status.toLowerCase()}`}>{label}</span>;
}

export function Segments({ options, value, onChange }) {
  return (
    <div className="segments" role="group">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`segment ${value === o.value ? 'segment--active' : ''}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={18} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TopBar({ title, back = true, right }) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      {back ? (
        <button className="round-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <Icon name="chevL" size={22} />
        </button>
      ) : (
        <span />
      )}
      <h1 className="topbar__title">{title}</h1>
      {right || <span />}
    </header>
  );
}

const TABS = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/reminders', label: 'Reminders', icon: 'bell' },
  { to: '/shop', label: 'Shop', icon: 'pill' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

export function BottomNav() {
  return (
    <nav className="bottomnav" aria-label="Main">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) => `bottomnav__item ${isActive ? 'bottomnav__item--active' : ''}`}
        >
          <span className="bottomnav__icon">
            <Icon name={t.icon} size={22} />
          </span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function EmptyState({ icon, tone = 'primary', title, text, action, onAction }) {
  const tones = {
    primary: ['var(--primary-soft)', 'var(--primary)'],
    warn: ['var(--warn-soft)', 'var(--warn)'],
    danger: ['var(--danger-soft)', 'var(--danger)'],
  };
  const [bg, fg] = tones[tone];
  return (
    <div className="empty">
      <div className="empty__halo" style={{ background: bg, color: fg }}>
        <Icon name={icon} size={64} stroke={1.5} />
      </div>
      <h2 className="title" style={{ fontSize: 24 }}>
        {title}
      </h2>
      <p>{text}</p>
      {action && (
        <div style={{ width: '100%', paddingTop: 12 }}>
          <Button onClick={onAction}>{action}</Button>
        </div>
      )}
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`toggle ${on ? 'toggle--on' : ''}`}
      onClick={onChange}
    />
  );
}

export function Logo({ size = 64, light = false }) {
  const main = light ? '#fff' : '#0B6E63';
  const cut = light ? '#084F47' : '#fff';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Medbell">
      <g transform="rotate(45 32 32)">
        <rect x="18" y="0" width="28" height="64" rx="14" fill={main} />
      </g>
      <path d="M32 18v28M18 32h28" stroke={cut} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Screen({ children, footer, nav = false }) {
  return (
    <div className="screen">
      {children}
      {footer && <div className="screen__footer">{footer}</div>}
      {nav && <BottomNav />}
    </div>
  );
}
