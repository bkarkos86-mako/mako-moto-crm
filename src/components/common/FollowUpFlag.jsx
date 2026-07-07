import React from 'react';
import { followUpStatus } from '../../utils/followUp.js';

export default function FollowUpFlag({ lead }) {
  const status = followUpStatus(lead);
  if (status === 'none') return null;
  return <span className={`lc-flag ${status}`}>{status}</span>;
}
