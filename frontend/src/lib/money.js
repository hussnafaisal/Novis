export const money = (value) => {
  const numeric = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  const amount = Number.isFinite(numeric) ? numeric : 0;
  return `PKR ${Math.round(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};
