import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <aside className="safety-banner" role="note" aria-label="Clinical disclaimer">
      <ShieldAlert size={16} className="safety-banner-icon" />
      <span>
        <strong>Notice:</strong> This application organizes and summarizes medical information. It does not replace professional medical diagnosis or treatment.
      </span>
    </aside>
  );
};
