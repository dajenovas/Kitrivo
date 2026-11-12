import type { Availability } from '@/types';
import { availabilityLabel } from './helpers';

const AvailabilityBadge = ({ value }: { value: Availability }) => (
  <span className={`badge badge--${value}`}>{availabilityLabel[value]}</span>
);

export default AvailabilityBadge;
