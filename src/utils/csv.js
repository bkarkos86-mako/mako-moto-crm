import { parseContactLog } from './followUp.js';

function csvEscape(value) {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function leadsToCsv(leads) {
  const headers = [
    'id',
    'name',
    'contact',
    'model',
    'source',
    'salesperson',
    'stage',
    'lostReason',
    'notes',
    'lastContactLog',
    'createdAt',
    'updatedAt',
  ];
  const rows = leads.map((lead) => {
    const log = parseContactLog(lead);
    const last = log.length ? `${log[log.length - 1].ts}: ${log[log.length - 1].text}` : '';
    return [
      lead.id,
      lead.name,
      lead.contact,
      lead.model,
      lead.source,
      lead.salesperson,
      lead.stage,
      lead.lostReason || '',
      lead.notes || '',
      last,
      lead.createdAt,
      lead.updatedAt,
    ]
      .map(csvEscape)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\r\n');
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
