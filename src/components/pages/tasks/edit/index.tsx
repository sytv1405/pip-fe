import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useRouter } from 'next/router';
import { pick } from 'lodash';

import { FormTypes, Payload } from '@/types';
import { bulkUpdateTask, clearTaskForm, initializeUpdateTaskForm, setFormState, updateTask } from '@/redux/actions';
import LoadingScreen from '@/components/LoadingScreen';
import { numberSorter } from '@/utils/sortUtils';
import { useTranslation } from 'i18next-config';
import { paths } from '@/shared/paths';
import message from '@/utils/message';
import { isDefined } from '@/utils/commonUtil';

import CreateUpdateTaskForm from '../CreateUpdateTaskForm';

const TaskEditPage = ({
  isLoading,
  task,
  dispatchInitializeUpdateTaskForm,
  dispatchSetFormState,
  dispatchClearTaskForm,
  dispatchUpdateTask,
  dispatchBulkUpdateTask,
}: PropsFromRedux) => {
  const [t] = useTranslation('task');
  const router = useRouter();

  const defaultValues = {
    ...pick(task, [
      'title',
      'purpose',
      'overview',
      'departmentId',
      'majorCategoryId',
      'middleCategoryId',
      'minorCategoryId',
      'basisType',
      'periodType',
      'taskWeeklyPeriods',
      'taskMonthlyPeriods',
      'taskAnnuallyPeriods',
      'taskSpecifiedPeriods',
      'leadTimeDay',
      'leadTimeType',
      'explanation',
      'taskAttachments',
      'taskNotifications',
    ]),
    taskProcesses: task.taskProcesses?.sort((record1, record2) => numberSorter(record1.orderNo, record2.orderNo)) || [],
    taskRegulations: task.taskRegulations?.map(record => ({
      ...record,
      type: record.regulation?.regulationType?.id,
      regulationId: record.regulation?.id,
    })),
  };

  const handleSubmit = ({ data, errorCallback }) => {
    dispatchUpdateTask({
      params: {
        id: task?.id,
        data: { ...data, leadTimeDay: isDefined(data.leadTimeDay) ? data.leadTimeDay : null },
      },
      callback: () => {
        message.success(t('message_update_task_success'));
        router.push({ pathname: paths.tasks.detail, query: { taskCode: router.query.taskCode } });
      },
      errorCallback,
    });
  };

  const handleInactivateTask = ({ reason, callback }) => {
    dispatchBulkUpdateTask({
      params: {
        ids: [task?.id],
        status: false,
        reason,
      },
      callback: () => {
        callback();
        message.success(t('message_inactivate_task_success'));
        router.push({ pathname: paths.tasks.detail, query: { taskCode: router.query.taskCode } });
      },
    });
  };

  const handleCloneTask = () => {
    dispatchSetFormState({
      params: {
        form: {
          defaultValues: {
            ...pick(task, [
              'title',
              'purpose',
              'overview',
              'departmentId',
              'majorCategoryId',
              'middleCategoryId',
              'minorCategoryId',
              'basisType',
              'periodType',
              'leadTimeDay',
              'leadTimeType',
              'explanation',
            ]),
            taskWeeklyPeriods: task.taskWeeklyPeriods?.map(record => pick(record, ['weekCode'])) || [],
            taskMonthlyPeriods: task.taskMonthlyPeriods?.map(record => pick(record, ['specifiedDay', 'specifiedNo', 'weekCode'])) || [],
            taskAnnuallyPeriods:
              task.taskAnnuallyPeriods?.map(record => pick(record, ['specifiedMonth', 'specifiedDay', 'specifiedNo', 'weekCode'])) || [],
            taskSpecifiedPeriods: task.taskSpecifiedPeriods?.map(record => pick(record, ['specifiedOn'])) || [],
            taskAttachments: task.taskAttachments?.map(record => pick(record, ['name', 'url'])) || [],
            taskProcesses:
              task.taskProcesses
                ?.sort((record1, record2) => numberSorter(record1.orderNo, record2.orderNo))
                .map(record => pick(record, ['content', 'outcome'])) || [],
            taskRegulations: task.taskRegulations?.map(record => ({
              memo: record.memo,
              regulationId: record.regulation?.id,
              type: record.regulation?.regulationType?.id,
            })),
            taskNotifications: task.taskNotifications?.map(record => pick(record, ['name', 'documentNo', 'fileName', 'url'])) || [],
          },
        },
      },
    });
    router.push({ pathname: paths.tasks.new });
  };

  useEffect(() => {
    dispatchInitializeUpdateTaskForm({
      params: {
        taskCode: router.query.taskCode,
      },
    });
    return () => dispatchClearTaskForm();
  }, [dispatchClearTaskForm, dispatchInitializeUpdateTaskForm, router.query.taskCode]);

  if (isLoading) return <LoadingScreen />;

  return (
    <CreateUpdateTaskForm
      type={FormTypes.Update}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onInactivateTask={handleInactivateTask}
      onCloneTask={handleCloneTask}
    />
  );
};

const mapStateToProps = state => {
  const { isLoading, task } = state.taskReducer;
  return { isLoading, task };
};

const mapDispatchToProps = dispatch => ({
  dispatchInitializeUpdateTaskForm: (payload: Payload) => dispatch(initializeUpdateTaskForm(payload)),
  dispatchUpdateTask: (payload: Payload) => dispatch(updateTask(payload)),
  dispatchBulkUpdateTask: (payload: Payload) => dispatch(bulkUpdateTask(payload)),
  dispatchSetFormState: (payload: Payload) => dispatch(setFormState(payload)),
  dispatchClearTaskForm: () => dispatch(clearTaskForm()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(TaskEditPage);
