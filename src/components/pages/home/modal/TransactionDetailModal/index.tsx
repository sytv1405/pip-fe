import React, { useMemo } from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import Link from 'next/link';
import { isEmpty } from 'lodash';

import { japanDateFormat } from '@/shared/constants';
import { useTranslation } from 'i18next-config';
import { Objectliteral, User } from '@/types';
import { paths } from '@/shared/paths';
import { transactionStatuses } from '@/components/pages/tasks/constants';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';

import styles from './styles.module.scss';

type TransactionDetailModalProps = {
  calendarInfor: Objectliteral;
  isVisible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk?: (calendarInfor: Objectliteral) => void;
  currentUser: User;
};

const TransactionDetailModal = ({ calendarInfor, isVisible, onCancel, currentUser, onOk }: TransactionDetailModalProps) => {
  const [t] = useTranslation('home');
  const isOrganizationDeleted = useIsOrganizationDeleted();

  const ownerInfor = useMemo(() => {
    const { transaction: { status = '', owner: { id: performerId, name: ownerName } = {} as any } = {} } = calendarInfor;
    const { id: currentUserId } = currentUser;
    let isOwner;
    if (isEmpty(calendarInfor) || isEmpty(currentUser)) {
      isOwner = false;
    } else {
      isOwner = performerId === currentUserId;
    }

    if (isOwner) {
      return status === transactionStatuses.completed ? t('task_owner_completed') : t('task_owner_doing');
    }

    return status === transactionStatuses.completed
      ? t('task_other_completed', { name: ownerName })
      : t('task_other_doing', { name: ownerName });
  }, [calendarInfor, currentUser, t]);

  const canUpdate = useMemo(() => {
    const { practitioner } = calendarInfor?.transaction || {};

    return !isOrganizationDeleted && practitioner === currentUser?.id;
  }, [isOrganizationDeleted, currentUser, calendarInfor]);

  return (
    <Modal
      className={classNames(styles['information-modal'], 'modal-footer-center')}
      onCancel={onCancel}
      centered
      visible={isVisible}
      title={
        <span className={classNames(styles['status-label'], styles[`status-label--${calendarInfor.status?.toLowerCase()}`])}>
          {t(`common:transaction_status_${calendarInfor.status?.toLowerCase()}`)}
        </span>
      }
      footer={null}
      width="600px"
    >
      <Typography.Title className={styles['task-title']}>{calendarInfor?.transaction?.title}</Typography.Title>
      <Typography.Paragraph className={styles['owner-infor']}>{ownerInfor}</Typography.Paragraph>
      <div className={styles.description}>
        <p className="mb-0">
          <span className={styles.description__label}>{t('task_dealine')}</span>
          <span className={styles.description__text}>
            {calendarInfor?.end ? moment(calendarInfor.end).format(japanDateFormat) : moment(calendarInfor.start).format(japanDateFormat)}
          </span>
        </p>
        <p className="mb-0">
          <span className={styles.description__label}>{t('process')}</span>
          <span className={styles.description__text}>
            {t('task__transaction_progress', {
              numberOfCompleted: calendarInfor?.numberOfCompleted,
              total: calendarInfor?.totalTransactions,
            })}
          </span>
        </p>
      </div>
      <Space align="center" className="w-100 justify-content-center">
        <Link
          href={{
            pathname: paths.tasks.detail,
            query: { taskCode: calendarInfor?.task?.taskCode, backUrl: paths.home, transactionId: calendarInfor?.transaction?.id },
          }}
          passHref
        >
          <Button size="large" className="mn-w180p font-weight-bold">
            {t('task_calendar_detail')}
          </Button>
        </Link>
        {canUpdate && (
          <Button size="large" type="primary" className="mn-w180p font-weight-bold" onClick={onOk}>
            {calendarInfor?.transaction?.status === transactionStatuses.completed ? t('uncomplete_transaction') : t('complete_transaction')}
          </Button>
        )}
      </Space>
    </Modal>
  );
};

export default TransactionDetailModal;
