import type { ReactNode } from 'react';
import { InboxOutlined, ErrorOutline } from '@mui/icons-material';

export const EmptyState = ({ title, text, action }: { title: string; text?: string; action?: ReactNode }) => (
  <div className="state" role="status">
    <span className="state__icon"><InboxOutlined fontSize="inherit" /></span>
    <h3>{title}</h3>
    {text && <p>{text}</p>}
    {action}
  </div>
);

export const ErrorState = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="state" role="alert">
    <span className="state__icon"><ErrorOutline fontSize="inherit" /></span>
    <h3>We couldn’t load this</h3>
    <p>{message ?? 'Something went wrong. Please try again.'}</p>
    {onRetry && (
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid-products" aria-busy="true" aria-label="Loading products">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton" style={{ aspectRatio: '4 / 5.2', borderRadius: 'var(--r-lg)' }} />
    ))}
  </div>
);

export const BlockSkeleton = ({ height = 360 }: { height?: number }) => (
  <div className="skeleton" style={{ height, borderRadius: 'var(--r-lg)' }} aria-busy="true" />
);

export const PageLoader = () => (
  <div className="page-loader" role="status" aria-label="Loading">
    <span className="spinner" />
  </div>
);
