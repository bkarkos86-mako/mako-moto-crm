function normalizeName(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function phoneDigits(contact) {
  // The Sheet auto-coerces number-looking contact values (e.g. a plain PH
  // mobile number with no letters) to an actual number type, not a string.
  const firstSegment = String(contact ?? '').split('/')[0] || '';
  return firstSegment.replace(/\D/g, '');
}

// Soft duplicate check — a same-name or same-phone match against existing
// leads. Returns the matching lead or null. Intentionally not fuzzy: exact
// (normalized) matches only, so it doesn't nag over "Ana" vs "Anna."
export function findPossibleDuplicate(leads, { name, contact, excludeId }) {
  const targetName = normalizeName(name);
  const targetPhone = phoneDigits(contact);
  return (
    leads.find((lead) => {
      if (excludeId && lead.id === excludeId) return false;
      const nameMatch = targetName && normalizeName(lead.name) === targetName;
      const phoneMatch = targetPhone && targetPhone.length >= 7 && phoneDigits(lead.contact) === targetPhone;
      return nameMatch || phoneMatch;
    }) || null
  );
}
