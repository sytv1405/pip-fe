import React from 'react';
import { get } from 'lodash';
import { Typography } from 'antd';
import classNames from 'classnames';

import styles from './styles.module.scss';

interface InterfaceError {
  name: string;
  errors: any;
}

const FormError = (props: InterfaceError) => {
  const { name, errors } = props;
  const error = get(errors, name, '');

  return error ? <Typography.Text className={classNames(styles.error, 'color-red')}>{error.message}</Typography.Text> : <></>;
};

export { FormError };
