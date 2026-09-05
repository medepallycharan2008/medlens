import { useState } from 'react';
import { X, MessageSquare, Check } from 'lucide-react';

interface AddNoteModalProps {
  patientName: string;
  onClose: () => void;
  onSaveNote: (title: string, description: string) => Promise<any>;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  patientName,
  onClose,
  onSaveNote
}) => {
  const [title, setTitle] = useState('Consultation Follow-Up Note');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please enter clinical note details.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSaveNote(title.trim(), description.trim());
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save note.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <MessageSquare size={18} color="var(--primary)" />
              Add Clinical Timeline Note
            </h2>
            <p className="card-subtitle">Recording for {patientName}</p>
          </div>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="noteTitle">Note Title</label>
              <input
                id="noteTitle"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. OPD Follow-up, Nursing Note, Medication Review"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="noteDesc">
                Note Content <span className="form-required">*</span>
              </label>
              <textarea
                id="noteDesc"
                className="form-textarea"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter objective clinical findings, patient verbal feedback, or follow-up observations..."
                required
              />
            </div>
          </div>

          <div className="card-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Check size={16} />
              <span>{isSubmitting ? 'Logging...' : 'Log Timeline Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
