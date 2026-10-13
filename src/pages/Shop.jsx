import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icon';
import { Button, EmptyState, Screen, TopBar } from '../components/ui';
import { ProductCard } from '../components/cards';
import { CATEGORIES, PRODUCTS, findProduct } from '../data/products';
import { rupees } from '../utils';

export function Shop() {
  const { cart, addToCart, showToast } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [category, setCategory] = useState('All');
  const count = cart.reduce((n, c) => n + c.qty, 0);

  const items = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (category === 'All' || p.category === category) &&
          `${p.name} ${p.meta}`.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [q, category],
  );

  return (
    <Screen nav>
      <div className="screen__body" style={{ paddingTop: 20 }}>
        <div className="row row--between">
          <h1 className="title">Shop</h1>
          <button className="round-btn" style={{ position: 'relative' }} onClick={() => navigate('/cart')} aria-label={`Cart, ${count} items`}>
            <Icon name="cart" size={22} />
            {count > 0 && (
              <span className="avatar" style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, fontSize: 11, background: 'var(--accent)', color: 'var(--ink)' }}>
                {count}
              </span>
            )}
          </button>
        </div>

        <label className="search">
          <Icon name="search" size={20} />
          <input
            type="search"
            placeholder="Search medicines"
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            aria-label="Search medicines"
          />
        </label>

        <div className="pill-row" role="tablist" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <button key={c} role="tab" aria-selected={c === category} className={`pill ${c === category ? 'pill--active' : ''}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {items.length ? (
          <div className="grid-2">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={() => navigate(`/shop/${p.id}`)}
                onAdd={() => {
                  addToCart(p.id);
                  showToast(`${p.name} added to cart`);
                }}
              />
            ))}
          </div>
        ) : (
          <p className="body-2" style={{ textAlign: 'center', padding: '32px 0' }}>
            No medicines match “{q}”. Try another name.
          </p>
        )}
      </div>
    </Screen>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const { addToCart, showToast } = useApp();
  const navigate = useNavigate();
  const p = findProduct(id);

  if (!p) {
    return (
      <Screen>
        <TopBar title="Details" />
        <EmptyState icon="pill" title="Product not found" text="This item is no longer available." action="Back to shop" onAction={() => navigate('/shop')} />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button
          onClick={() => {
            addToCart(p.id);
            showToast(`${p.name} added to cart`);
          }}
        >
          Add to cart
        </Button>
      }
    >
      <TopBar title="Details" />
      <div className="screen__body">
        <div className="product__img" style={{ height: 220, borderRadius: 28 }}>
          <Icon name="pill" size={96} stroke={1.5} />
        </div>
        <div className="row row--between" style={{ alignItems: 'flex-start' }}>
          <div className="col">
            <h2 className="title" style={{ fontSize: 24 }}>
              {p.name}
            </h2>
            <span className="body-2" style={{ fontSize: 14 }}>
              {p.meta}
            </span>
          </div>
          <span className="price price--big">{rupees(p.price)}</span>
        </div>
        <p className="body-2">{p.description}</p>
        <div className="row" style={{ alignItems: 'stretch' }}>
          {[
            ['truck', 'Delivery', p.delivery],
            ['shield', 'Quality', 'Verified seller'],
          ].map(([ic, k, v]) => (
            <div key={k} className="card card--pad col grow" style={{ gap: 4, borderRadius: 20 }}>
              <span style={{ color: 'var(--primary)' }}>
                <Icon name={ic} size={22} />
              </span>
              <span className="caption">{k}</span>
              <strong style={{ fontSize: 14 }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

export function Cart() {
  const { cart, setQty } = useApp();
  const navigate = useNavigate();
  const lines = cart.map((c) => ({ ...c, product: findProduct(c.id) })).filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  if (!lines.length) {
    return (
      <Screen>
        <TopBar title="Cart" />
        <EmptyState icon="cart" title="Your cart is empty" text="Add medicines from the shop and they will show up here." action="Browse shop" onAction={() => navigate('/shop')} />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button onClick={() => navigate('/address')}>Checkout</Button>}>
      <TopBar title="Cart" />
      <div className="screen__body">
        {lines.map(({ product: p, qty }) => (
          <div key={p.id} className="card card--pad row">
            <span className="icon-tile" style={{ width: 60, height: 60, borderRadius: 16 }}>
              <Icon name="pill" size={28} />
            </span>
            <div className="col grow" style={{ gap: 2 }}>
              <strong>{p.name}</strong>
              <span className="caption">{p.meta}</span>
              <span className="price" style={{ fontSize: 15, color: 'var(--primary)' }}>
                {rupees(p.price * qty)}
              </span>
            </div>
            <div className="qty">
              <button onClick={() => setQty(p.id, qty - 1)} aria-label={`Decrease ${p.name}`}>
                <Icon name={qty === 1 ? 'trash' : 'minus'} size={16} stroke={2.4} />
              </button>
              <span aria-live="polite">{qty}</span>
              <button onClick={() => setQty(p.id, qty + 1)} aria-label={`Increase ${p.name}`}>
                <Icon name="plus" size={16} stroke={2.4} />
              </button>
            </div>
          </div>
        ))}
        <div className="card card--pad col" style={{ gap: 10 }}>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{rupees(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong>Free</strong>
          </div>
          <hr className="divider" />
          <div className="row row--between">
            <strong style={{ fontSize: 17 }}>Total</strong>
            <span className="price price--big" style={{ fontSize: 20 }}>
              {rupees(subtotal)}
            </span>
          </div>
        </div>
      </div>
    </Screen>
  );
}
