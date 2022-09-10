import React, { useState } from 'react';
import { Select } from 'antd';
import { snakeCase } from 'lodash';
import classNames from 'classnames';

import { Trans, useTranslation } from 'i18next-config';
import { convertObjectToOptions } from '@/utils/convertUtils';
import { ModalInfo } from '@/components/modal';
import { Label } from '@/components/form';
import { DownIcon } from '@/assets/images';

import { inActivateTaskReasons } from '../constants';

import styles from './styles.module.scss';

type ModalInactivateTaskProps = {
  visible: boolean;
  confirmLoading: boolean;
  onOk: (reason: string) => void;
  onCancel: () => void;
};

const ModalInactivateTask = ({ visible, onOk, onCancel, confirmLoading }: ModalInactivateTaskProps) => {
  const [t] = useTranslation('task');
  const [reason, setReason] = useState(null);

  const handleSubmit = () => {
    if (reason) {
      onOk(reason);
    }
  };

  return (
    <ModalInfo
      visible={visible}
      title={t('modal_inactivate_task_title')}
      okText={t('modal_inactivate_task_submit')}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={confirmLoading}
    >
      <Trans
        i18nKey="modal_inactivate_task_note"
        t={t}
        components={{
          title: <h4 className={styles['inactivate-task-subtitle']} />,
          description: <div className={styles['inactivate-task-description']} />,
          notes: <div className={classNames(styles['inactivate-task-notes'], 'text-pre-line', 'my-3')} />,
        }}
      />
      <Label strong isRequired>
        {t('inactivate_task_reason')}
      </Label>
      <Select
        className="w-100"
        size="large"
        value={reason}
        options={convertObjectToOptions(inActivateTaskReasons, {
          transformKey: key => t(snakeCase(key)),
        })}
        onChange={setReason}
        suffixIcon={<DownIcon />}
      />
    </ModalInfo>
  );
};

export default ModalInactivateTask;
