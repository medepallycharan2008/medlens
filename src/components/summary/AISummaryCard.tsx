import { useState } from 'react';
import type { PatientSummary } from '../../types/patient';
import { SourceBadge, LabStatusBadge } from '../common/Badge';
import {
  Sparkles,
  Bot,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface AISummaryCardProps {
  summary: PatientSummary | undefined;
  onGenerateSummary: () => Promise<any>;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({
  summary,
  onGenerateSummary
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateSummary();
    } finally {
      setIsGenerating(false);
    }
  };

  const generatedDate = summary
    ? new Date(summary.generatedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className="card" style={{ borderColor: '#a7f3d0', backgroundColor: '#fafffd' }}>
      {/* Header with AI Provenance */}
      <div className="card-header" style={{ backgroundColor: '#ecfdf5', borderBottomColor: '#a7f3d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#d1fae5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <h2 className="card-title" style={{ color: '#065f46', fontSize: '1.0625rem' }}>
              Patient-Friendly Clinical Summary
            </h2>
            <p className="card-subtitle" style={{ color: '#047857' }}>
              Objective plain-language digest synthesized from structured medical records
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SourceBadge sourceType="AI_GENERATED" />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            id="btn-generate-ai-summary"
          >
            <RotateCcw size={13} className={isGenerating ? 'spin-slow' : ''} />
            <span>{isGenerating ? 'Synthesizing...' : summary ? 'Regenerate Summary' : 'Generate Summary'}</span>
          </button>
        </div>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Mandatory Safety Notice per Section 10 */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            color: '#1e40af',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Safety Notice:</strong> AI-generated summary — verify important information against the original medical report. This summary does not provide medical diagnoses or treatment recommendations.
          </span>
        </div>

        {!summary ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '12px' }}>
              No AI summary generated for this patient yet. Click <strong>Generate Summary</strong> to synthesize an objective digest of the current clinical notes, symptoms, and extracted laboratory reports.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Sparkles size={14} />
              <span>Generate Patient-Friendly Summary</span>
            </button>
          </div>
        ) : (
          <>
            {/* Generated Timestamp */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} />
              <span>Generated on {generatedDate} based on {summary.reportCount} report(s)</span>
            </div>

            {/* Narrative text */}
            <div style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line', padding: '12px 16px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              {summary.summaryText}
            </div>

            {/* Notable Observations Cards (Rule #10: low/high only when source report provides range) */}
            {summary.notableFindings.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  Notable Laboratory Findings (Source Range Documented):
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {summary.notableFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{finding.testName}</span>
                        <LabStatusBadge status={finding.status} />
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                        Observed: <strong>{finding.value} {finding.unit}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        Source Range: {finding.referenceRange || 'None provided'} &bull; {finding.sourceReportName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Information Checklist */}
            {summary.missingInformation.length > 0 && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <AlertTriangle size={14} />
                  <span>Missing or Incomplete Documentation Noted by System:</span>
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.75rem', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {summary.missingInformation.map((info, i) => (
                    <li key={i}>{info}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
