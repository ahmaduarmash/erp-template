import { useTemplate } from '../../theme/ThemeProvider';

export function Brand() {
  const { config } = useTemplate();
  return (
    <div className="brand">
      {config.brand.logoUrl ? (
        <img src={config.brand.logoUrl} alt="" className="brand-mark" />
      ) : (
        <span className="brand-mark" aria-hidden="true">
          {config.brand.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="brand-text">
        {config.brand.name}
        <span className="brand-edition">workspace</span>
      </span>
    </div>
  );
}
