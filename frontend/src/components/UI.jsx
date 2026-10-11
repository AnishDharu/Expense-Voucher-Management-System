import { getStatusClass } from '../utils/constants';

export function StatusBadge({ status }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';
  return <span className={`badge ${getStatusClass(status)}`}>{label}</span>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="page-loading">
      <div className="loading-spinner" style={{ width: 40, height: 40, borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3b82f6' }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="table-empty">
      {Icon && <Icon />}
      <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4, color: 'var(--text-secondary)' }}>{title}</p>
      {description && <p style={{ fontSize: '0.875rem' }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function WorkflowStatus({ status }) {
  const steps = ['draft', 'submitted', 'approved'];
  const isRejected = status === 'rejected';
  const activeIdx = steps.indexOf(status);

  return (
    <div className="workflow-steps">
      {steps.map((step, i) => {
        let circleClass = '';
        if (isRejected && step === 'submitted') {
          circleClass = 'rejected';
        } else if (i < activeIdx || (!isRejected && i === activeIdx && step === 'approved')) {
          circleClass = 'completed';
        } else if (i === activeIdx) {
          circleClass = 'active';
        }

        const labels = { draft: 'Draft', submitted: 'Submitted', approved: isRejected && step === 'submitted' ? 'Rejected' : 'Approved' };

        return (
          <div key={step} className="workflow-step">
            <div className="step-node">
              <div className={`step-circle ${circleClass}`}>
                {i + 1}
              </div>
              <span className="step-label">{labels[step]}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`step-connector ${i < activeIdx ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Topbar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div>
        <span className="topbar-title">{title}</span>
        {subtitle && <span className="topbar-subtitle">— {subtitle}</span>}
      </div>
    </div>
  );
}
