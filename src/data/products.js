export const CATEGORIES = ['All', 'Pain relief', 'Vitamins', 'Cold & flu', 'Skin care'];

export const PRODUCTS = [
  {
    id: 'p1',
    name: 'Paracetamol',
    meta: '500 mg · 15 tablets',
    category: 'Pain relief',
    price: 32,
    description:
      'Relieves mild to moderate pain and reduces fever. Take as directed by your doctor and do not exceed the daily limit.',
    delivery: 'Within 1 hour',
  },
  {
    id: 'p2',
    name: 'Vitamin D3',
    meta: '1000 IU · 30 capsules',
    category: 'Vitamins',
    price: 185,
    description:
      'Supports bone health and immunity. Take one capsule daily after a meal, or as directed by your doctor.',
    delivery: 'Within 1 hour',
  },
  {
    id: 'p3',
    name: 'Cetirizine',
    meta: '10 mg · 10 tablets',
    category: 'Cold & flu',
    price: 28,
    description: 'Eases allergy symptoms such as sneezing, runny nose and itchy eyes.',
    delivery: 'Tomorrow morning',
  },
  {
    id: 'p4',
    name: 'ORS Powder',
    meta: 'Orange · 5 sachets',
    category: 'Cold & flu',
    price: 60,
    description: 'Oral rehydration salts that replace fluids and electrolytes lost to fever or diarrhoea.',
    delivery: 'Within 1 hour',
  },
  {
    id: 'p5',
    name: 'Lisinopril',
    meta: '10 mg · 30 tablets',
    category: 'Pain relief',
    price: 96,
    description: 'Prescription medicine for blood pressure. Requires a valid prescription at delivery.',
    delivery: 'Tomorrow morning',
  },
  {
    id: 'p6',
    name: 'Moisturising Lotion',
    meta: '125 ml',
    category: 'Skin care',
    price: 325,
    description: 'Gentle daily lotion for dry and sensitive skin.',
    delivery: 'Tomorrow morning',
  },
];

export const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
