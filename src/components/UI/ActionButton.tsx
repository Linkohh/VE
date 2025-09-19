import React from 'react';
import styles from './ActionButton.module.css';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, disabled }) => (
  <button type="button" className={styles.button} onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

export default ActionButton;
