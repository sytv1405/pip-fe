import classNames from 'classnames';
import React, { ReactNode } from 'react';

import { useTranslation } from 'i18next-config';

import styles from './styles.module.scss';

type LabelProps = {
  children: ReactNode;
  isRequired?: boolean;
  className?: string;
  htmlFor?: string;
  strong?: boolean;
  size?: 'small' | undefined;
};

const Label = ({ children, isRequired, className, htmlFor, strong, size }: LabelProps) => {
  const [t] = useTranslation();

  const ContentWrapper = strong ? props => <strong {...props} /> : React.Fragment;

  return (
    <label className={classNames(className, styles.label, styles[`label--${size}`])} htmlFor={htmlFor}>
      <ContentWrapper>
        {children}
        {isRequired && <span className={styles['required-label']}>{t('required')}</span>}
      </ContentWrapper>
    </label>
  );
};

export default Label;
