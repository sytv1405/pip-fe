import { useCallback } from 'react';
import { Modal, Typography, Space, Button } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { Payload, Task } from '@/types';
import { bulkUpdateTask, getTaskDetail } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import message from '@/utils/message';

import styles from './styles.module.scss';

interface ModalActivateTaskProps extends PropsFromRedux {
  visible: boolean;
  onOk?: () => void;
  onCancel: () => void;
  task?: Task;
}

const ModalActivateTask = ({
  task,
  dispatchUpdateTask,
  onCancel,
  dispatchGetTaskDetail,
  isSubmitting,
  ...rest
}: ModalActivateTaskProps) => {
  const [t] = useTranslation('task');

  const handleSubmit = useCallback(() => {
    dispatchUpdateTask({
      params: {
        status: true,
        ids: [task?.id],
      },
      callback: () => {
        message.success(t('active_task_successfully'));
        dispatchGetTaskDetail({ params: { taskCode: task?.taskCode } });
        onCancel();
      },
    });
  }, [dispatchUpdateTask, onCancel, dispatchGetTaskDetail, task, t]);

  return (
    <Modal className={styles['transaction-modal']} title={t('modal_activate_task_title')} {...rest} onCancel={onCancel} footer={false}>
      <Typography.Paragraph className={classNames(styles.description, 'text-pre-line')}>
        {t('modal_activate_task_note')}
      </Typography.Paragraph>
      <Space align="center" direction="vertical" className="w-100">
        <Button
          className="mn-w180p font-weight-bold"
          size="large"
          type="primary"
          htmlType="submit"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          {t('modal_activate_task_submit')}
        </Button>
      </Space>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchUpdateTask: (payload: Payload) => dispatch(bulkUpdateTask(payload)),
  dispatchGetTaskDetail: (payload: Payload) => dispatch(getTaskDetail(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { isSubmitting } = state.taskReducer;
  return { isSubmitting };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ModalActivateTask);
