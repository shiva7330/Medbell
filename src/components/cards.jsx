import Icon from './Icon';
import { StatusChip } from './ui';
import { fmt12, rupees } from '../utils';

export function MedCard({ med, status, onClick }) {
  return (
    <button className="card card--pad row" style={{ width: '100%', textAlign: 'left' }} onClick={onClick}>
      <span className="icon-tile">
        <Icon name="pill" size={26} />
      </span>
      <span className="col grow" style={{ gap: 2 }}>
        <strong style={{ fontSize: 16 }}>{med.name}</strong>
        <span className="body-2" style={{ fontSize: 14 }}>
          {med.dose} · {med.instructions}
        </span>
        <span className="row" style={{ gap: 6, fontSize: 14, color: 'var(--ink-2)' }}>
          <Icon name="clock" size={16} /> {fmt12(med.time)}
        </span>
      </span>
      <StatusChip status={status} />
    </button>
  );
}

export function ProductCard({ product, onOpen, onAdd }) {
  return (
    <div className="card product">
      <button onClick={onOpen} className="col" style={{ gap: 8, textAlign: 'left' }} aria-label={`Open ${product.name}`}>
        <span className="product__img">
          <Icon name="pill" size={44} stroke={1.6} />
        </span>
        <span className="product__name">{product.name}</span>
        <span className="product__meta">{product.meta}</span>
      </button>
      <div className="row row--between">
        <span className="price">{rupees(product.price)}</span>
        <button className="add-btn" onClick={onAdd} aria-label={`Add ${product.name} to cart`}>
          <Icon name="plus" size={20} stroke={2.6} />
        </button>
      </div>
    </div>
  );
}
