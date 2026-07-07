import React from 'react';
import { STAGES } from '../../constants.js';

export default function StagePill({ stage }) {
  const label = STAGES.find((s) => s.key === stage)?.label || stage;
  return <span className={`stage-pill ${stage}`}>{label}</span>;
}
