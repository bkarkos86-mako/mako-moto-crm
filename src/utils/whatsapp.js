// Contact is free text, usually "phone / email / fb" (phone always first —
// see MobileEventMode/NewLeadModal). Pulls the phone-shaped segment and
// normalizes it to a wa.me link, assuming PH numbers (0917... -> 63917...).
export function getWhatsAppLink(contact) {
  if (!contact) return null;
  // The Sheet auto-coerces number-looking contact values to an actual
  // number type, not a string.
  const firstSegment = String(contact).split('/')[0].trim();
  const digits = firstSegment.replace(/\D/g, '');
  if (digits.length < 9) return null; // too short to plausibly be a phone number

  let normalized = digits;
  if (normalized.startsWith('0')) {
    normalized = '63' + normalized.slice(1);
  } else if (!normalized.startsWith('63')) {
    normalized = '63' + normalized;
  }
  return `https://wa.me/${normalized}`;
}
