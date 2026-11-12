import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './IconButton.module.css';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName;
  /** Obligatorio: el botón no tiene texto visible. */
  'aria-label': string;
};

export function IconButton({ icon, className, type = 'button', ...rest }: Props) {
  return (
    <button {...rest} type={type} className={`${styles.button} ${className ?? ''}`}>
      <Icon name={icon} size={18} />
    </button>
  );
}
