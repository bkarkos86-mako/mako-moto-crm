import React from 'react';

// value: true | false | undefined (undefined = not asked yet — neither
// button shows active, which is the honest state for leads captured before
// this field existed or before the question came up).
export default function FinancingToggle({ value, onChange, compact }) {
  return (
    <div
      className={`yn-toggle ${compact ? 'compact' : ''}`}
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Interested in financing?"
    >
      <button type="button" className={value === true ? 'active yes' : ''} onClick={() => onChange(true)}>
        Yes
      </button>
      <button type="button" className={value === false ? 'active no' : ''} onClick={() => onChange(false)}>
        No
      </button>
    </div>
  );
}
