import { Typography } from 'antd';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import styles from './styles.module.scss';

type SectionTitleProps = {
  level?: 1 | 2 | 3 | 4 | 5;
  icon?: ReactNode;
  className?: string;
};

export const SectionTitle: FC<SectionTitleProps> = ({ level = 2, children, icon, className }) => (
  <Typography.Title level={level} className={classNames(styles.title, className)}>
    {!!icon && <span className={styles.icon}>{icon}</span>}
    <span>{children}</span>
  </Typography.Title>
);
