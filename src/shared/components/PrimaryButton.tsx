import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './PrimaryButton.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: IconName;
  loading?: boolean;
  destructive?: boolean;
  /** `lg`: píldora de 54 px (móvil). `md`: 44 px y radio 10, para formularios web. */
  size?: 'lg' | 'md';
};

/** Píldora blanca de 54 px. Una por pantalla (DESIGN.md §6). */
export function PrimaryButton({
  children,
  icon,
  loading = false,
  destructive = false,
  size = 'lg',
  disabled,
  className,
  type = 'button',
  ...rest
}: Props) {
  const classes = ['tap-scale', styles.button, size === 'md' && styles.md, destructive && styles.destructive, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...rest} type={type} className={classes} disabled={disabled || loading} aria-busy={loading}>
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span className={styles.srOnly}>{children}</span>
        </>
      ) : (
        <>
          {icon && <Icon name={icon} size={18} />}
          {children}
        </>
      )}
    </button>
  );
}
