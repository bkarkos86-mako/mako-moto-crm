// Contact is free text, usually "phone / email / fb" (see MobileEventMode)
// but can also be anything typed manually via NewLeadModal/LeadDetail edit.
// Rather than assume position, scan every "/"-separated segment for
// whichever shape (phone-like / email-like) each link needs.

function segments(contact) {
  // The Sheet auto-coerces number-looking contact values to an actual
  // number type, not a string.
  return String(contact ?? '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
}

function digitsOf(segment) {
  return segment.replace(/\D/g, '');
}

function findPhoneSegment(contact) {
  return segments(contact).find((s) => digitsOf(s).length >= 7) || null;
}

function findEmailSegment(contact) {
  return segments(contact).find((s) => s.includes('@')) || null;
}

// 0917... -> 63917... ; already-63/+63 numbers pass through.
function toPhInternational(digits) {
  if (digits.startsWith('0')) return '63' + digits.slice(1);
  if (!digits.startsWith('63')) return '63' + digits;
  return digits;
}

export function getCallLink(contact) {
  const seg = findPhoneSegment(contact);
  if (!seg) return null;
  return `tel:+${toPhInternational(digitsOf(seg))}`;
}

export function getWhatsAppLink(contact) {
  const seg = findPhoneSegment(contact);
  if (!seg) return null;
  return `https://wa.me/${toPhInternational(digitsOf(seg))}`;
}

export function getViberLink(contact) {
  const seg = findPhoneSegment(contact);
  if (!seg) return null;
  return `viber://chat?number=%2B${toPhInternational(digitsOf(seg))}`;
}

export function getMailtoLink(contact, subject) {
  const seg = findEmailSegment(contact);
  if (!seg) return null;
  return `mailto:${seg}${subject ? '?subject=' + encodeURIComponent(subject) : ''}`;
}

export function getEmailAddress(contact) {
  return findEmailSegment(contact);
}
