import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        {actionText && onAction && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onAction}>
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onSecondaryAction}>
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};
