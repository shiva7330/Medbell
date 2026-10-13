import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import { Button, EmptyState, Field, Screen, Segments, TopBar } from '../components/ui';
import { MedCard } from '../components/cards';
import { PERIOD_DEFAULT_TIME, dateKey, fmt12, periodOf, statusOf, weekDays } from '../utils';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
};

export function Home() {
  const { user, meds, markTaken, showToast } = useApp();
  const navigate = useNavigate();
  const today = dateKey();

  const sorted = useMemo(() => [...meds].sort((a, b) => a.time.localeCompare(b.time)), [meds]);
  // Next dose: first upcoming one; if none, the earliest overdue one so it can still be logged
  const next = sorted.find((m) => statusOf(m, today) === 'Upcoming') || sorted.find((m) => !m.taken[today]);
  const overdue = next ? statusOf(next, today) === 'Missed' : false;
  const takenCount = sorted.filter((m) => m.taken[today]).length;
  const pct = sorted.length ? Math.round((takenCount / sorted.length) * 100) : 0;

  return (
    <Screen nav>
      <div className="screen__body" style={{ paddingTop: 20 }}>
        <div className="row row--between">
          <div>
            <p className="body-2" style={{ fontWeight: 500 }}>
              {greeting()}
            </p>
            <h1 className="title" style={{ fontSize: 26 }}>
              {user.name.split(' ')[0]}
            </h1>
          </div>
          <button className="avatar" style={{ width: 48, height: 48, background: 'var(--primary-soft)', color: 'var(--primary)' }} onClick={() => navigate('/profile')} aria-label="Open profile">
            {user.name[0]}
          </button>
        </div>

        {next ? (
          <section className="hero" aria-label="Next dose">
            <Icon name="pill" size={150} stroke={1.4} className="hero__deco" />
            <div className="row row--between">
              <span className="hero__tag" style={overdue ? { background: 'var(--accent)', color: 'var(--ink)' } : undefined}>
                {overdue ? 'OVERDUE' : 'NEXT DOSE'}
              </span>
              <span style={{ color: 'var(--primary-soft)', fontWeight: 600, fontSize: 14 }}>{fmt12(next.time)}</span>
            </div>
            <h2 className="title" style={{ fontSize: 26 }}>
              {next.name}
            </h2>
            <p style={{ color: 'var(--primary-soft)' }}>
              {next.dose} · {next.instructions}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                markTaken(next.id);
                showToast(`${next.name} marked as taken`);
              }}
            >
              Mark as taken
            </Button>
          </section>
        ) : (
          <section className="hero">
            <h2 className="title" style={{ fontSize: 22 }}>
              {sorted.length ? 'All done for today' : 'No medicines yet'}
            </h2>
            <p style={{ color: 'var(--primary-soft)' }}>
              {sorted.length ? 'Great job staying on track.' : 'Add your first medicine to start reminders.'}
            </p>
            {!sorted.length && <Button variant="secondary" onClick={() => navigate('/reminders/new')}>Add medicine</Button>}
          </section>
        )}

        <div className="card card--pad row row--between">
          <div className="col">
            <strong>Today’s progress</strong>
            <span className="caption">
              {takenCount} of {sorted.length} doses taken
            </span>
          </div>
          <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress__bar" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="row row--between">
          <h2 className="h2">Today’s medicines</h2>
          <button className="link" onClick={() => navigate('/reminders')}>
            See all
          </button>
        </div>
        {sorted.map((m) => (
          <MedCard key={m.id} med={m} status={statusOf(m, today)} onClick={() => navigate(`/medicine/${m.id}`)} />
        ))}
      </div>
    </Screen>
  );
}

export function Reminders() {
  const { meds } = useApp();
  const navigate = useNavigate();
  const days = useMemo(() => weekDays(), []);
  const [day, setDay] = useState(dateKey());

  const groups = ['Morning', 'Afternoon', 'Night'].map((p) => ({
    period: p,
    items: meds.filter((m) => periodOf(m.time) === p).sort((a, b) => a.time.localeCompare(b.time)),
  }));

  if (!meds.length) {
    return (
      <Screen nav>
        <EmptyState
          icon="bell"
          title="No reminders yet"
          text="Add your first medicine and we will remind you on time, every time."
          action="Add medicine"
          onAction={() => navigate('/reminders/new')}
        />
      </Screen>
    );
  }

  return (
    <Screen nav>
      <div className="screen__body" style={{ paddingTop: 20 }}>
        <div className="row row--between">
          <div>
            <h1 className="title">Reminders</h1>
            <p className="body-2">
              {new Date(day + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button className="round-btn round-btn--primary" onClick={() => navigate('/reminders/new')} aria-label="Add medicine">
            <Icon name="plus" size={24} stroke={2.4} />
          </button>
        </div>

        <div className="days" role="tablist" aria-label="Days of this week">
          {days.map((d) => (
            <button key={d.key} role="tab" aria-selected={d.key === day} className={`day ${d.key === day ? 'day--active' : ''}`} onClick={() => setDay(d.key)}>
              {d.label}
              <strong>{d.num}</strong>
            </button>
          ))}
        </div>

        {groups.map(
          (g) =>
            g.items.length > 0 && (
              <div key={g.period} className="col" style={{ gap: 12 }}>
                <div className="group-label">
                  <Icon name={g.period === 'Night' ? 'moon' : 'sun'} size={18} /> {g.period}
                </div>
                {g.items.map((m) => (
                  <MedCard key={m.id} med={m} status={statusOf(m, day)} onClick={() => navigate(`/medicine/${m.id}`)} />
                ))}
              </div>
            ),
        )}
      </div>
    </Screen>
  );
}

// Add and edit share one form (edit when :id is present)
export function MedicineForm() {
  const { id } = useParams();
  const { meds, addMed, updateMed, showToast } = useApp();
  const navigate = useNavigate();
  const editing = meds.find((m) => m.id === id);

  const [form, setForm] = useState({
    name: editing?.name || '',
    dose: editing?.dose || '',
    instructions: editing?.instructions || '',
    time: editing?.time || '08:00',
    stock: editing?.stock ?? 30,
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Enter the medicine name';
    if (!form.dose.trim()) err.dose = 'Enter the dosage';
    if (!form.time) err.time = 'Choose a time';
    setErrors(err);
    if (Object.keys(err).length) return;

    const data = { ...form, name: form.name.trim(), dose: form.dose.trim(), instructions: form.instructions.trim() || 'As directed', stock: Number(form.stock) || 0 };
    if (editing) updateMed(editing.id, data);
    else addMed(data);
    showToast(editing ? 'Reminder updated' : 'Reminder saved');
    navigate(editing ? `/medicine/${editing.id}` : '/reminders', { replace: true });
  };

  return (
    <form onSubmit={submit} className="screen" noValidate>
      <TopBar title={editing ? 'Edit reminder' : 'Add medicine'} />
      <div className="screen__body" style={{ paddingTop: 12 }}>
        <Field label="Medicine name" value={form.name} onChange={set('name')} placeholder="e.g. Vitamin D3" error={errors.name} />
        <Field label="Dosage" value={form.dose} onChange={set('dose')} placeholder="e.g. 1000 IU · 1 capsule" error={errors.dose} />
        <Field label="Instructions" value={form.instructions} onChange={set('instructions')} placeholder="e.g. After meals with water" />
        <div className="field">
          <span className="field__label">Reminder time</span>
          <Segments
            value={periodOf(form.time)}
            onChange={(p) => setForm({ ...form, time: PERIOD_DEFAULT_TIME[p] })}
            options={[
              { value: 'Morning', label: 'Morning', icon: 'sun' },
              { value: 'Afternoon', label: 'Afternoon', icon: 'sun' },
              { value: 'Night', label: 'Night', icon: 'moon' },
            ]}
          />
        </div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="grow">
            <Field label="Specific time" type="time" value={form.time} onChange={set('time')} error={errors.time} />
          </div>
          <div className="grow">
            <Field label="Pills in stock" type="number" min="0" value={form.stock} onChange={set('stock')} />
          </div>
        </div>
        <div className="spacer" />
      </div>
      <div className="screen__footer">
        <Button type="submit">{editing ? 'Save changes' : 'Save reminder'}</Button>
      </div>
    </form>
  );
}

export function MedicineDetail() {
  const { id } = useParams();
  const { meds, deleteMed, markTaken, showToast } = useApp();
  const navigate = useNavigate();
  const med = meds.find((m) => m.id === id);
  const today = dateKey();

  if (!med) {
    return (
      <Screen>
        <TopBar title="Medicine" />
        <EmptyState icon="pill" title="Medicine not found" text="It may have been removed." action="Back to reminders" onAction={() => navigate('/reminders')} />
      </Screen>
    );
  }

  const low = med.stock <= 7;
  const status = statusOf(med, today);

  return (
    <Screen
      footer={
        <>
          <Button onClick={() => navigate(`/shop?q=${encodeURIComponent(med.name)}`)}>Refill now</Button>
          <Button variant="secondary" onClick={() => navigate(`/reminders/${med.id}/edit`)}>
            Edit reminder
          </Button>
        </>
      }
    >
      <TopBar title="Medicine" />
      <div className="screen__body">
        <section className="hero" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <span className="icon-tile" style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--primary)', color: '#fff' }}>
            <Icon name="pill" size={36} stroke={1.8} />
          </span>
          <div className="col">
            <h2 className="title" style={{ fontSize: 24 }}>
              {med.name}
            </h2>
            <span style={{ color: 'var(--primary-soft)', fontSize: 14 }}>{med.dose}</span>
            <span style={{ color: 'var(--primary-soft)', fontSize: 14 }}>{med.instructions}</span>
          </div>
        </section>

        <div className={`stock ${low ? '' : 'stock--ok'}`}>
          <div className="stock__title">
            <Icon name={low ? 'alert' : 'check'} size={20} /> {low ? 'Running low' : 'Well stocked'}
          </div>
          <p style={{ fontSize: 14 }}>
            {med.stock} {med.stock === 1 ? 'dose' : 'doses'} left, about {med.stock} {med.stock === 1 ? 'day' : 'days'} at one a day.
          </p>
          <div className="progress">
            <div className="progress__bar" style={{ width: `${Math.min(100, (med.stock / 30) * 100)}%` }} />
          </div>
        </div>

        <div className="card list">
          {[
            ['Time', fmt12(med.time)],
            ['Repeat', 'Every day'],
            ["Today's status", status === 'Upcoming' ? 'Up next' : status],
          ].map(([k, v]) => (
            <div key={k} className="list__item row--between" style={{ fontWeight: 500 }}>
              <span style={{ color: 'var(--ink-2)' }}>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>

        {status !== 'Taken' && (
          <Button
            variant="soft"
            onClick={() => {
              markTaken(med.id);
              showToast(`${med.name} marked as taken`);
            }}
          >
            Mark as taken
          </Button>
        )}
        <Button
          variant="danger"
          icon="trash"
          onClick={() => {
            if (window.confirm(`Delete reminder for ${med.name}?`)) {
              deleteMed(med.id);
              navigate('/reminders', { replace: true });
            }
          }}
        >
          Delete reminder
        </Button>
      </div>
    </Screen>
  );
}
