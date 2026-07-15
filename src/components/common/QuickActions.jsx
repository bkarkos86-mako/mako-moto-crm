import React from 'react';
import { getCallLink, getMailtoLink, getViberLink, getWhatsAppLink } from '../../utils/contactLinks.js';

export default function QuickActions({ lead }) {
  const actions = [
    { href: getCallLink(lead.contact), label: 'Call', cls: 'call' },
    { href: getWhatsAppLink(lead.contact), label: 'WhatsApp', cls: 'whatsapp' },
    { href: getViberLink(lead.contact), label: 'Viber', cls: 'viber' },
    { href: getMailtoLink(lead.contact, `Mako Moto — following up${lead.name ? ` with ${lead.name}` : ''}`), label: 'Email', cls: 'email' },
  ].filter((a) => a.href);

  if (!actions.length) return null;

  return (
    <div className="quick-actions">
      {actions.map((a) => (
        <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={`quick-action ${a.cls}`}>
          {a.label}
        </a>
      ))}
    </div>
  );
}
