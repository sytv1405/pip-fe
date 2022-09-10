import React, { useState } from 'react';
import { Button, Card, Col, Form as FormLayout, Modal, ModalProps, Row, Typography } from 'antd';
import { DefaultValues, SubmitHandler, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { isNil, isArray, snakeCase } from 'lodash';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { Trans, useTranslation } from 'i18next-config';
import { FormTypes, Payload } from '@/types';
import { convertObjectToOptions } from '@/utils/convertUtils';
import PageLeavingPrompt from '@/components/PageLeavingPrompt';
import { Field, Form, Label } from '@/components/form';
import { mapOptions } from '@/utils/selects';
import {
  clearTaskLargeBusinessUnits,
  clearTaskMediumBusinessUnits,
  clearTaskSmallBusinessUnits,
  getTaskLargeBusinessUnits,
  getTaskMediumBusinessUnits,
  getTaskSmallBusinessUnits,
} from '@/redux/actions/taskActions';
import LoadingScreen from '@/components/LoadingScreen';
import { paths } from '@/shared/paths';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { ArrowRightIcon, EllipseIcon } from '@/assets/images';
import message from '@/utils/message';
import { Spacer } from '@/components/Spacer';
import { ModalInfo } from '@/components/modal';

import { leadTimeTypes, taskBasisTypes, taskPeriodTypes } from '../constants';

import PeriodPickerFields from './PeriodPickerFields';
import ModalInactivateTask from './ModalInactivateTask';
import TaskProcessFields from './TaskProcessFields';
import RegulationFields from './RegulationFields';
import NotificationFields from './NotificationFields';
import { getValidationSchema } from './schema';
import AttachmentFields from './AttachmentFields';
import styles from './styles.module.scss';

type CreateUpdateTaskFormProps = {
  type: FormTypes;
  defaultValues: DefaultValues<any>;
  onSubmit: SubmitHandler<any>;
  onInactivateTask?: ({ reason, callback }: { reason: string; callback: () => void }) => void;
  onCloneTask?: () => void;
};

const CreateUpdateTaskForm = ({
  type,
  defaultValues,
  task,
  departments,
  largeBusinessUnits,
  mediumBusinessUnits,
  smallBusinessUnits,
  regulationTypes,
  regulations,
  isLargeBusinessUnitsLoading,
  isMediumBusinessUnitsLoading,
  isSmallBusinessUnitsLoading,
  isCreateUpdateLoading,
  isInactivateLoading,
  dispatchGetTaskLargeBusinessUnits,
  dispatchGetTaskMediumBusinessUnits,
  dispatchGetTaskSmallBusinessUnits,
  dispatchClearTaskLargeBusinessUnits,
  dispatchClearTaskMediumBusinessUnits,
  dispatchClearTaskSmallBusinessUnits,
  onSubmit,
  onInactivateTask,
  onCloneTask,
}: CreateUpdateTaskFormProps & PropsFromRedux) => {
  const [t] = useTranslation('task');
  const router = useRouter();
  const [isModalCancelVisible, setModalCancelVisible] = useState(false);
  const [isModalCloneVisible, setModalCloneVisible] = useState(false);

  const [isModalInactivateTaskVisible, setModalInactivateTaskVisible] = useState(false);
  const [modalWarningNoDepartment, setModalWarningNoDepartment] = useState<ModalProps>(null);
  const [modalWarningNoLeadTime, setModalWarningNoLeadTime] = useState<ModalProps>(null);

  const form = useForm({
    defaultValues,
    resolver: yupResolver(getValidationSchema(t)),
  });
  const { watch, setValue, getValues, setError, clearErrors } = form;

  const handleSubmit = ({
    taskProcesses,
    taskRegulations,
    taskNotifications,
    taskWeeklyPeriods,
    taskMonthlyPeriods,
    taskAnnuallyPeriods,
    taskSpecifiedPeriods,
    ...rest
  }) => {
    const submitHandler = () => {
      onSubmit({
        data: {
          taskProcesses: taskProcesses
            ?.filter(record => Object.values(record).some(Boolean))
            .map((record, index) => ({
              ...record,
              orderNo: index + 1,
            })),
          taskRegulations: taskRegulations?.filter(record => Object.values(record).some(Boolean)),
          taskNotifications: taskNotifications?.filter(record => Object.values(record).some(Boolean)),
          taskWeeklyPeriods: taskWeeklyPeriods?.filter(record => !isNil(record.weekCode)),
          taskMonthlyPeriods: taskMonthlyPeriods?.filter(
            record => !isNil(record.specifiedDay) || !isNil(record.specifiedNo) || !isNil(record.weekCode)
          ),
          taskAnnuallyPeriods: taskAnnuallyPeriods?.filter(
            record => !isNil(record.specifiedMonth) || !isNil(record.specifiedDay) || !isNil(record.specifiedNo) || !isNil(record.weekCode)
          ),
          taskSpecifiedPeriods: taskSpecifiedPeriods?.filter(record => !isNil(record.specifiedOn)),
          ...rest,
        },
        errorCallback: error => {
          if (error.errorCode === ErrorCodes.DUPLICATE_TASK) {
            setError('title', {
              type: 'manual',
              message: t(`server_error:${ErrorCodes.DUPLICATE_TASK}`),
            });
          } else if (error.status !== 403) {
            message.error(
              <div className="text-pre-line">
                {isArray(error?.data?.message) ? error?.data?.message?.map(msg => <div>{msg}</div>) : error?.data?.message}
              </div>
            );
          }
        },
      });
    };

    if (!rest.departmentId) {
      setModalWarningNoDepartment({
        visible: true,
        onOk: () => {
          submitHandler();
          setModalWarningNoDepartment(null);
        },
        onCancel: () => setModalWarningNoDepartment(null),
      });
      return;
    }

    if (!rest.leadTimeDay || !rest.leadTimeType) {
      setModalWarningNoLeadTime({
        visible: true,
        onOk: () => {
          submitHandler();
          setModalWarningNoLeadTime(null);
        },
        onCancel: () => setModalWarningNoLeadTime(null),
      });
      return;
    }

    submitHandler();
  };

  return (
    <WithAuth title={t(`${type}_task`)} isContentFullWidth>
      {isCreateUpdateLoading && <LoadingScreen />}
      <PageLeavingPrompt shouldWarn={!isCreateUpdateLoading && !isModalCancelVisible && !isInactivateLoading && !isModalCloneVisible} />
      <Form form={form} onSubmit={handleSubmit}>
        {type === FormTypes.Update && (
          <Row gutter={16} justify="end" className="mb-4">
            <Col flex="0 0 140px">
              <Button htmlType="button" onClick={() => setModalCloneVisible(true)} className={styles['button-small']} block>
                {t('button_clone_task')}
              </Button>
            </Col>
            <Col flex="0 0 140px">
              <Button htmlType="submit" type="primary" className={styles['button-small']} block>
                {t('common:button_update')}
              </Button>
            </Col>
          </Row>
        )}
        <Card bordered={false} className="mt-4">
          {type === FormTypes.Update && (
            <>
              <div className={styles['label-task-code']}>
                {t('task_no')}. {task.taskCode}
              </div>
              <Spacer height="10px" />
            </>
          )}
          <Label htmlFor="title" strong>
            {t('task_name')}
          </Label>
          <Field id="title" name="title" type="text" size="large" className="mb-4" />
          <Label htmlFor="purpose" strong>
            {t('purpose')}
          </Label>
          <Field id="purpose" name="purpose" type="text" size="large" className="mb-4" />
          <Label htmlFor="overview" strong>
            {t('overview')}
          </Label>
          <Field id="overview" name="overview" type="textArea" className={classNames(styles['textarea-field'], 'mb-4')} rows={5} />
          <Row gutter={22} className="mb-4">
            <Col span={6}>
              <Typography.Paragraph className="mb-1">
                <Label strong>{t('department')}</Label>
              </Typography.Paragraph>
              <Field
                allowClear
                name="departmentId"
                type="singleSelect"
                options={mapOptions(departments, { labelKey: 'name', valueKey: 'id' })}
                onChange={departmentId => {
                  setValue('majorCategoryId', null);
                  setValue('middleCategoryId', null);
                  setValue('minorCategoryId', null);
                  if (departmentId) {
                    dispatchGetTaskLargeBusinessUnits({
                      params: {
                        departmentIds: [departmentId],
                      },
                    });
                  } else {
                    setValue('departmentId', null);
                    dispatchClearTaskLargeBusinessUnits();
                    dispatchClearTaskMediumBusinessUnits();
                    dispatchClearTaskSmallBusinessUnits();
                  }
                }}
              />
            </Col>
            <Col span={6}>
              <Typography.Paragraph className="mb-1">
                <Label strong>
                  {t('common:business_unit')}（{t('common:large')}）
                </Label>
              </Typography.Paragraph>
              <Field
                allowClear
                name="majorCategoryId"
                type="singleSelect"
                options={mapOptions(largeBusinessUnits, { labelKey: 'name', valueKey: 'id' })}
                emptyText={watch('departmentId') && t('common:select_no_data')}
                loading={isLargeBusinessUnitsLoading}
                onChange={largeBusinessUnitId => {
                  setValue('middleCategoryId', null);
                  setValue('minorCategoryId', null);
                  if (largeBusinessUnitId) {
                    dispatchGetTaskMediumBusinessUnits({
                      params: {
                        majorCategoryIds: [largeBusinessUnitId],
                      },
                    });
                  } else {
                    setValue('majorCategoryId', null);
                    dispatchClearTaskMediumBusinessUnits();
                    dispatchClearTaskSmallBusinessUnits();
                  }
                }}
              />
            </Col>
            <Col span={6}>
              <Typography.Paragraph className="mb-1">
                <Label strong>
                  {t('common:business_unit')}（{t('common:medium')}）
                </Label>
              </Typography.Paragraph>
              <Field
                allowClear
                name="middleCategoryId"
                type="singleSelect"
                options={mapOptions(mediumBusinessUnits, { labelKey: 'name', valueKey: 'id' })}
                emptyText={watch('majorCategoryId') && t('common:select_no_data')}
                loading={isMediumBusinessUnitsLoading}
                onChange={mediumBusinessUnitId => {
                  setValue('minorCategoryId', null);
                  if (mediumBusinessUnitId) {
                    dispatchGetTaskSmallBusinessUnits({
                      params: {
                        middleCategoryIds: [mediumBusinessUnitId],
                      },
                    });
                  } else {
                    setValue('middleCategoryId', null);
                    dispatchClearTaskSmallBusinessUnits();
                  }
                }}
              />
            </Col>
            <Col span={6}>
              <Typography.Paragraph className="mb-1">
                <Label strong>
                  {t('common:business_unit')}（{t('common:small')}）
                </Label>
              </Typography.Paragraph>
              <Field
                allowClear
                name="minorCategoryId"
                type="singleSelect"
                emptyText={watch('middleCategoryId') && t('common:select_no_data')}
                loading={isSmallBusinessUnitsLoading}
                options={mapOptions(smallBusinessUnits, { labelKey: 'name', valueKey: 'id' })}
              />
            </Col>
          </Row>
          <Row gutter={35} className="mb-4">
            <Col span={5}>
              <Label strong>{t('task_type')}</Label>
              <Field
                name="basisType"
                type="select"
                size="large"
                className={styles['expanded-field']}
                options={[
                  { label: t('common:select_placeholder_required'), value: null },
                  ...convertObjectToOptions(taskBasisTypes, { transformKey: key => t(`task_type_${key}`) }),
                ]}
                onChange={basisType => {
                  if (basisType === taskBasisTypes.actual) {
                    setValue('periodType', null);
                    setValue('taskWeeklyPeriods', []);
                    setValue('taskMonthlyPeriods', []);
                    setValue('taskAnnuallyPeriods', []);
                    setValue('taskSpecifiedPeriods', []);
                  }
                }}
              />
            </Col>
            <Col span={19}>
              <Label strong>{t('form_deadline')}</Label>
              <Row gutter={16}>
                <Col span={6}>
                  <Field
                    type="select"
                    name="periodType"
                    size="large"
                    className={styles['expanded-field']}
                    options={[
                      {
                        label: t('common:select_placeholder_required'),
                        value: null,
                      },
                      ...convertObjectToOptions(taskPeriodTypes, { transformKey: key => t(`common:${snakeCase(key)}`) }),
                    ]}
                    disabled={watch('basisType') !== taskBasisTypes.deadline}
                    onChange={periodType => {
                      if (periodType !== getValues('periodType')) {
                        setValue('taskWeeklyPeriods', []);
                        setValue('taskMonthlyPeriods', []);
                        setValue('taskAnnuallyPeriods', []);
                        setValue('taskSpecifiedPeriods', []);
                        clearErrors('taskWeeklyPeriods');
                        clearErrors('taskMonthlyPeriods');
                        clearErrors('taskAnnuallyPeriods');
                        clearErrors('taskSpecifiedPeriods');
                      }
                    }}
                  />
                </Col>
                <PeriodPickerFields type={watch('periodType')} disabled={watch('basisType') !== taskBasisTypes.deadline} />
              </Row>
            </Col>
          </Row>
          <div>
            <Label strong>{t('lead_time')}</Label>
            <Row gutter={10}>
              <Col flex="0 0 80px">
                <FormLayout.Item>
                  <Field
                    type="number"
                    name="leadTimeDay"
                    className={styles['expanded-field']}
                    min={0}
                    size="large"
                    onStep={value => {
                      if (value === 0) {
                        form.setValue('leadTimeDay', 1, { shouldValidate: true });
                      }
                    }}
                  />
                </FormLayout.Item>
              </Col>
              <Col flex="0 0 114px">
                <FormLayout.Item>
                  <Field
                    name="leadTimeType"
                    type="select"
                    size="large"
                    options={convertObjectToOptions(leadTimeTypes, { transformKey: key => t(`lead_time_${key}`) })}
                    className="w-100"
                    allowClear
                    valueOnClear={null}
                  />
                </FormLayout.Item>
              </Col>
            </Row>
          </div>
          <div>
            <Label strong>{t('procedure')}</Label>
          </div>
          <TaskProcessFields />
          <div className="mb-4">
            <Label strong className="d-block">
              {t('task_description')}
            </Label>
            <Field type="textArea" name="explanation" className={styles['textarea-field']} />
          </div>
          <AttachmentFields />
          <RegulationFields regulationTypes={regulationTypes} regulations={regulations} />
          <NotificationFields />
          <Row gutter={12} justify="center" className="text-center mt-5">
            {type === FormTypes.Update ? (
              <>
                <Col>
                  <Button size="large" className="mn-w180p font-weight-bold" onClick={() => setModalCancelVisible(true)}>
                    {t('common:button_cancel')}
                  </Button>
                </Col>
                <Col>
                  <Button htmlType="submit" type="primary" className="mn-w180p font-weight-bold" size="large">
                    {t('common:button_update')}
                  </Button>
                </Col>
              </>
            ) : (
              <Col>
                <Button htmlType="submit" type="primary" className="mn-w180p font-weight-bold" size="large">
                  {t('button_submit_create_task')}
                </Button>
              </Col>
            )}
          </Row>
          {type === FormTypes.Update && (
            <div className="text-right mt-3 mb-4">
              <Button
                type="link"
                icon={<ArrowRightIcon />}
                className={classNames(styles['button-inactivate-task'], 'link-underline', 'p-0', 'h-auto')}
                onClick={() => setModalInactivateTaskVisible(true)}
              >
                {t('button_inactivate_task')}
              </Button>
            </div>
          )}
        </Card>
      </Form>
      <ModalInactivateTask
        visible={isModalInactivateTaskVisible}
        confirmLoading={isInactivateLoading}
        onOk={reason => {
          onInactivateTask({ reason, callback: () => setModalInactivateTaskVisible(false) });
        }}
        onCancel={() => setModalInactivateTaskVisible(false)}
      />
      <Modal
        visible={isModalCancelVisible}
        title={t('modal_cancel_update_task_title')}
        okText={t('modal_cancel_update_task_ok')}
        cancelText={t('modal_cancel_update_task_cancel')}
        onCancel={() => setModalCancelVisible(false)}
        onOk={() => {
          router.push({ pathname: paths.tasks.detail, query: { taskCode: router.query.taskCode } });
        }}
      >
        {t('modal_cancel_update_task_message')}
      </Modal>
      <ModalInfo
        title={t(`modal_${type}_task_no_department_title`)}
        className="text-pre-line modal-footer-center"
        footer={[
          <Button type="default" size="large" shape="round" className="font-weight-bold" onClick={modalWarningNoDepartment?.onCancel}>
            {t(`modal_${type}_task_no_department_cancel`)}
          </Button>,
          <Button type="primary" size="large" shape="round" className="font-weight-bold" onClick={modalWarningNoDepartment?.onOk}>
            {t(`modal_${type}_task_no_department_submit`)}
          </Button>,
        ]}
        {...modalWarningNoDepartment}
      >
        <Trans
          t={t}
          i18nKey={`modal_${type}_task_no_department_content`}
          components={{
            circle: <EllipseIcon className="mr-2" />,
          }}
        />
      </ModalInfo>
      <ModalInfo
        title={t(`modal_${type}_task_no_lead_time_title`)}
        className="text-pre-line modal-footer-center"
        footer={[
          <Button type="default" size="large" shape="round" className="font-weight-bold" onClick={modalWarningNoLeadTime?.onCancel}>
            {t(`modal_${type}_task_no_lead_time_cancel`)}
          </Button>,
          <Button type="primary" size="large" shape="round" className="font-weight-bold" onClick={modalWarningNoLeadTime?.onOk}>
            {t(`modal_${type}_task_no_lead_time_submit`)}
          </Button>,
        ]}
        {...modalWarningNoLeadTime}
      >
        {t(`modal_${type}_task_no_lead_time_content`)}
      </ModalInfo>
      <ModalInfo
        title={t('modal_clone_task_title')}
        visible={isModalCloneVisible}
        onCancel={() => setModalCloneVisible(false)}
        footer={[
          <Button type="default" size="large" className="mn-w180p font-weight-bold" onClick={() => setModalCloneVisible(false)}>
            {t('common:button_cancel')}
          </Button>,
          <Button type="primary" size="large" className="mn-w180p font-weight-bold" onClick={onCloneTask}>
            {t('modal_clone_task_submit')}
          </Button>,
        ]}
      >
        <div className="text-normal">{t('modal_clone_task_content')}</div>
      </ModalInfo>
    </WithAuth>
  );
};

const mapStateToProps = state => {
  const {
    task,
    departments,
    largeBusinessUnits,
    mediumBusinessUnits,
    smallBusinessUnits,
    regulationTypes,
    regulations,
    isLargeBusinessUnitsLoading,
    isMediumBusinessUnitsLoading,
    isSmallBusinessUnitsLoading,
    isCreateUpdateLoading,
    isSubmitting: isInactivateLoading,
  } = state.taskReducer;
  return {
    task,
    departments,
    largeBusinessUnits,
    mediumBusinessUnits,
    smallBusinessUnits,
    regulationTypes,
    regulations,
    isLargeBusinessUnitsLoading,
    isMediumBusinessUnitsLoading,
    isSmallBusinessUnitsLoading,
    isCreateUpdateLoading,
    isInactivateLoading,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetTaskLargeBusinessUnits: (payload: Payload) => dispatch(getTaskLargeBusinessUnits(payload)),
  dispatchGetTaskMediumBusinessUnits: (payload: Payload) => dispatch(getTaskMediumBusinessUnits(payload)),
  dispatchGetTaskSmallBusinessUnits: (payload: Payload) => dispatch(getTaskSmallBusinessUnits(payload)),
  dispatchClearTaskLargeBusinessUnits: () => dispatch(clearTaskLargeBusinessUnits()),
  dispatchClearTaskMediumBusinessUnits: () => dispatch(clearTaskMediumBusinessUnits()),
  dispatchClearTaskSmallBusinessUnits: () => dispatch(clearTaskSmallBusinessUnits()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(CreateUpdateTaskForm);
