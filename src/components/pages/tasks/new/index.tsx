import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useRouter } from 'next/router';

import { FormTypes, Payload } from '@/types';
import {
  initializeCreateTaskForm,
  clearTaskForm,
  createTask,
  getTaskLargeBusinessUnits,
  getTaskMediumBusinessUnits,
  getTaskSmallBusinessUnits,
} from '@/redux/actions/taskActions';
import { useTranslation } from 'i18next-config';
import { paths } from '@/shared/paths';
import message from '@/utils/message';
import { isDefined } from '@/utils/commonUtil';

import CreateUpdateTaskForm from '../CreateUpdateTaskForm';

const defaultValues = {
  taskProcesses: [
    {
      content: '',
      outcome: '',
    },
  ],
};

const NewTaskPage = ({
  form,
  dispatchInitializeCreateTaskForm,
  dispatchClearTaskForm,
  dispatchCreateTask,
  dispatchGetTaskLargeBusinessUnits,
  dispatchGetTaskMediumBusinessUnits,
  dispatchGetTaskSmallBusinessUnits,
}: PropsFromRedux) => {
  const [t] = useTranslation('task');
  const router = useRouter();

  const handleSubmit = ({ data, errorCallback }) => {
    dispatchCreateTask({
      params: {
        data: { ...data, leadTimeDay: isDefined(data.leadTimeDay) ? data.leadTimeDay : null },
      },
      callback: response => {
        message.success(t('create_task_success_message'));
        router.push({ pathname: paths.tasks.detail, query: { taskCode: response.data.taskCode } });
      },
      errorCallback,
    });
  };

  useEffect(() => {
    dispatchInitializeCreateTaskForm();

    return () => dispatchClearTaskForm();
  }, [dispatchInitializeCreateTaskForm, dispatchClearTaskForm]);

  useEffect(() => {
    const { departmentId, majorCategoryId, middleCategoryId } = form.defaultValues || {};

    if (departmentId) {
      dispatchGetTaskLargeBusinessUnits({
        params: {
          departmentIds: [departmentId],
        },
      });
    }

    if (majorCategoryId) {
      dispatchGetTaskMediumBusinessUnits({
        params: {
          majorCategoryIds: [majorCategoryId],
        },
      });
    }

    if (middleCategoryId) {
      dispatchGetTaskSmallBusinessUnits({
        params: {
          middleCategoryIds: [middleCategoryId],
        },
      });
    }
  }, [dispatchGetTaskLargeBusinessUnits, dispatchGetTaskMediumBusinessUnits, dispatchGetTaskSmallBusinessUnits, form]);

  return <CreateUpdateTaskForm type={FormTypes.Create} defaultValues={form.defaultValues || defaultValues} onSubmit={handleSubmit} />;
};

const mapStateToProps = state => {
  const { form } = state.taskReducer;

  return {
    form,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchInitializeCreateTaskForm: () => dispatch(initializeCreateTaskForm()),
  dispatchClearTaskForm: () => dispatch(clearTaskForm()),
  dispatchCreateTask: (payload: Payload) => dispatch(createTask(payload)),
  dispatchGetTaskLargeBusinessUnits: (payload: Payload) => dispatch(getTaskLargeBusinessUnits(payload)),
  dispatchGetTaskMediumBusinessUnits: (payload: Payload) => dispatch(getTaskMediumBusinessUnits(payload)),
  dispatchGetTaskSmallBusinessUnits: (payload: Payload) => dispatch(getTaskSmallBusinessUnits(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(NewTaskPage);
