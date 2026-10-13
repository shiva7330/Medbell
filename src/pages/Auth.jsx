import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import { Button, Field, Logo, Screen, TopBar } from '../components/ui';

export function Splash() {
  const navigate = useNavigate();
  const { auth } = useApp();

  useEffect(() => {
    const t = setTimeout(() => navigate(auth ? '/home' : '/onboarding', { replace: true }), 1800);
    return () => clearTimeout(t);
  }, [auth, navigate]);

  return (
    <div className="splash">
      <span className="splash__logo">
        <Logo size={72} light />
      </span>
      <h1 className="splash__fade" style={{ animationDelay: '0.45s' }}>Medbell</h1>
      <p className="splash__fade" style={{ animationDelay: '0.65s' }}>
        Your smart medicine delivery
        <br />& pill reminder
      </p>
    </div>
  );
}

const SLIDES = [
  { icon: 'bell', title: 'Never miss a dose again', text: 'Smart reminders tell you exactly what to take and when, so you stay on track every day.' },
  { icon: 'truck', title: 'Medicines at your door', text: 'Order from nearby pharmacies and get your medicines delivered fast, without leaving home.' },
  { icon: 'shield', title: 'Track your health, easily', text: 'See your daily progress and refill alerts in one simple place. Made to be easy for everyone.' },
];

export function Onboarding() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState('next');
  const navigate = useNavigate();
  const s = SLIDES[i];
  const go = (n) => {
    setDir(n > i ? 'next' : 'prev');
    setI(n);
  };
  const last = i === SLIDES.length - 1;

  return (
    <Screen
      footer={<Button onClick={() => (last ? navigate('/login') : go(i + 1))}>{last ? 'Get started' : 'Next'}</Button>}
    >
      <div className="screen__body">
        <div className="row row--between" style={{ minHeight: 48 }}>
          <span />
          {!last && (
            <button className="link" onClick={() => navigate('/login')}>
              Skip
            </button>
          )}
        </div>
        <div className="onb-art" aria-hidden="true">
          <span className="onb-art__ring onb-art__ring--a" style={{ width: 300, height: 300 }} />
          <span className="onb-art__ring onb-art__ring--b" style={{ width: 210, height: 210 }} />
          <span key={i} className={`onb-art__tile onb-slide-${dir}`}>
            <Icon name={s.icon} size={64} stroke={1.8} />
          </span>
        </div>
        <div key={i} className={`col onb-slide-${dir}`} style={{ gap: 16, marginTop: 8 }}>
          <h1 className="title">{s.title}</h1>
          <p className="body-2" style={{ fontSize: 16 }}>
            {s.text}
          </p>
        </div>
        <div className="spacer" />
        <div className="dots" aria-label={`Step ${i + 1} of ${SLIDES.length}`}>
          {SLIDES.map((_, n) => (
            <span key={n} className={`dot ${n === i ? 'dot--on' : ''}`} />
          ))}
        </div>
      </div>
    </Screen>
  );
}

export function Login() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    navigate('/otp', { state: { phone } });
  };

  return (
    <form onSubmit={submit} className="screen" noValidate>
      <div className="screen__body" style={{ paddingTop: 40 }}>
        <div className="row">
          <Logo size={32} />
          <strong style={{ color: 'var(--primary)', fontSize: 20 }}>Medbell</strong>
        </div>
        <h1 className="title" style={{ marginTop: 24 }}>
          Welcome back
        </h1>
        <p className="body-2">Enter your mobile number and we will send you a one-time code.</p>
        <Field
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          placeholder="98765 43210"
          value={phone}
          error={error}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, ''));
            setError('');
          }}
        />
        <p className="row caption" style={{ gap: 6 }}>
          <Icon name="shield" size={16} /> We never share your number.
        </p>
        <div className="spacer" />
      </div>
      <div className="screen__footer">
        <Button type="submit">Send OTP</Button>
        <p className="caption" style={{ textAlign: 'center' }}>
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </form>
  );
}

const DEMO_OTP = '1234';

export function Otp() {
  const { state } = useLocation();
  const phone = state?.phone || '';
  const { login } = useApp();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const refs = useRef([]);

  useEffect(() => {
    if (!phone) navigate('/login', { replace: true });
  }, [phone, navigate]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setDigit = (idx, val) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    setError(false);
    if (v && idx < 3) refs.current[idx + 1]?.focus();
  };

  const onKey = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const verify = () => {
    if (digits.join('') === DEMO_OTP) {
      login(phone);
      navigate('/home', { replace: true });
    } else {
      setError(true);
    }
  };

  const masked = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : '';

  return (
    <Screen footer={<Button onClick={verify} disabled={digits.some((d) => !d)}>Verify</Button>}>
      <TopBar title="Verify number" />
      <div className="screen__body" style={{ paddingTop: 12 }}>
        <h1 className="title">Enter the code</h1>
        <p className="body-2">We sent a 4-digit code to {masked}.</p>
        <p className="caption">Demo app: use code {DEMO_OTP}.</p>
        <div className={`otp ${error ? 'otp--error' : ''}`}>
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => (refs.current[idx] = el)}
              value={d}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${idx + 1}`}
              onChange={(e) => setDigit(idx, e.target.value)}
              onKeyDown={(e) => onKey(idx, e)}
              autoFocus={idx === 0}
            />
          ))}
        </div>
        {error && (
          <p className="field__error" role="alert" style={{ justifyContent: 'center' }}>
            <Icon name="alert" size={16} /> Incorrect code. Please try again.
          </p>
        )}
        <p style={{ textAlign: 'center' }}>
          {seconds > 0 ? (
            <span className="caption">Resend code in 00:{String(seconds).padStart(2, '0')}</span>
          ) : (
            <button
              className="link"
              onClick={() => {
                setSeconds(30);
                setDigits(['', '', '', '']);
                setError(false);
              }}
            >
              Resend code
            </button>
          )}
        </p>
      </div>
    </Screen>
  );
}
