import React from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import Link from 'next/link';

import { japanDateFormat } from '@/shared/constants';
import { useTranslation } from 'i18next-config';
import { Objectliteral } from '@/types';
import { paths } from '@/shared/paths';

import styles from './styles.module.scss';

type TaskDetailModalProps = {
  calendarInfor: Objectliteral;
  isVisible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
};

const TaskDetailModal = ({ calendarInfor, isVisible, onCancel }: TaskDetailModalProps) => {
  const [t] = useTranslation('home');

  return (
    <Modal
      className={classNames(styles['information-modal'], 'modal-footer-center')}
      onCancel={onCancel}
      centered
      visible={isVisible}
      title={<span className={classNames(styles['status-label'], styles[`status-label--todo`])}>{t('task_status_open')}</span>}
      footer={null}
      width="600px"
    >
      <Typography.Title className={styles['task-title']}>{calendarInfor?.title}</Typography.Title>
      <div className={styles.description}>
        <span className={styles.description__label}>{t('task_dealine')}</span>
        <span className={styles.description__text}>
          {calendarInfor?.end ? moment(calendarInfor.end).format(japanDateFormat) : moment(calendarInfor.start).format(japanDateFormat)}
        </span>
      </div>
      <Space align="center" direction="vertical" className="w-100">
        <Link href={{ pathname: paths.tasks.detail, query: { taskCode: calendarInfor?.taskCode, backUrl: paths.home } }} passHref>
          <Button size="large" className="mn-w180p font-weight-bold">
            {t('task_calendar_detail')}
          </Button>
        </Link>
      </Space>
    </Modal>
  );
};

export default TaskDetailModal;
