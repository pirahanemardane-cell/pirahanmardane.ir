export function cn(...inputs) {
  return inputs
    .flat(Infinity)
    .filter(Boolean)
    .map((x) => (typeof x === 'string' ? x : ''))
    .join(' ')
    .trim();
}
