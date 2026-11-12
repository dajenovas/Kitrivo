import { Add, Remove } from '@mui/icons-material';

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

const QuantitySelector = ({ value, onChange, min = 1, max = 999, label = 'Quantity' }: Props) => (
  <div className="qty" role="group" aria-label={label}>
    <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)}>
      <Remove fontSize="small" />
    </button>
    <output aria-live="polite">{value}</output>
    <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>
      <Add fontSize="small" />
    </button>
  </div>
);

export default QuantitySelector;
