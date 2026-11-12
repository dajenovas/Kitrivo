import type { VariantGroup } from '@/types';

interface Props {
  groups: VariantGroup[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

const VariantPicker = ({ groups, value, onChange }: Props) => (
  <div className="variants">
    {groups.map((g) => (
      <fieldset key={g.name} className="variants__group">
        <legend className="field__label">
          {g.name}: <strong style={{ color: 'var(--text)' }}>{value[g.name]}</strong>
        </legend>
        <div className="chips">
          {g.options.map((o) => (
            <button
              key={o}
              type="button"
              className="chip"
              aria-pressed={value[g.name] === o}
              onClick={() => onChange({ ...value, [g.name]: o })}
            >
              {o}
            </button>
          ))}
        </div>
      </fieldset>
    ))}
  </div>
);

export default VariantPicker;
