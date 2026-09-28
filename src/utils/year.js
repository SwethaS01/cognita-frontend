// Display helpers for the student year (stored as "1".."4", or "Alumni")
export const YEAR_OPTIONS = [
  ['1', '1st Year'],
  ['2', '2nd Year'],
  ['3', '3rd Year'],
  ['4', '4th Year']
];
export const yearLabel = (y) => {
  const hit = YEAR_OPTIONS.find(([v]) => v === String(y));
  return hit ? hit[1] : y || '';
};
export const roleLabel = (r) => (r ? r.charAt(0).toUpperCase() + r.slice(1) : '');
