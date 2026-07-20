import React, { useState } from 'react';
import { getCallLink, getEmailAddress, getViberLink, getWhatsAppLink } from '../../utils/contactLinks.js';
import SendEmailModal from '../Leads/SendEmailModal.jsx';

export default function QuickActions({ lead }) {
  const [showEmail, setShowEmail] = useState(false);

  const linkActions = [
    { href: getCallLink(lead.contact), label: 'Call', cls: 'call' },
    { href: getWhatsAppLink(lead.contact), label: 'WhatsApp', cls: 'whatsapp' },
    { href: getViberLink(lead.contact), label: 'Viber', cls: 'viber' },
  ].filter((a) => a.href);
  const hasEmail = !!getEmailAddress(lead.contact);

  if (!linkActions.length && !hasEmail) return null;

  return (
    <>
      <div className="quick-actions">
        {linkActions.map((a) => (
          <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={`quick-action ${a.cls}`}>
            {a.label}
          </a>
        ))}
        {hasEmail && (
          <button type="button" className="quick-action email" onClick={() => setShowEmail(true)}>
            Email
          </button>
        )}
      </div>
      {showEmail && <SendEmailModal lead={lead} onClose={() => setShowEmail(false)} />}
    </>
  );
}
