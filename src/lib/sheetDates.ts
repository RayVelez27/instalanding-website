/** Date helpers for the item sheet's pills */
/** Added in the last fortnight: earns the accent "New" pill */
export const isRecent = (added: string) => {
  const t = Date.parse(added);
  return Number.isFinite(t) && Date.now() - t < 14 * 864e5;
};

/** "Nov 25, 2026" → "Nov 25" this year, "Nov 2025" otherwise: a pill that never wraps */
export const shortDate = (added: string) => {
  const d = new Date(added);
  if (!Number.isFinite(d.getTime())) return added;
  const mon = d.toLocaleString("en-US", { month: "short" });
  return d.getFullYear() === new Date().getFullYear() ? `${mon} ${d.getDate()}` : `${mon} ${d.getFullYear()}`;
};
