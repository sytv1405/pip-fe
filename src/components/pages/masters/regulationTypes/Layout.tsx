import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Modal, Row, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';

import { Field, Form } from '@/components/form';
import LoadingScreen from '@/components/LoadingScreen';
import { WithAuth } from '@/components/Roots/WithAuth';
import { createRegulationType, deleteRegulationType, getRegulationTypes } from '@/redux/actions';
import { useTranslation } from 'i18next-config';
import { Payload } from '@/types';
import { ModalInfo } from '@/components/modal';
import { RootState } from '@/redux/rootReducer';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { DragIcon, FileCircleIcon, TrashIcon } from '@/assets/images';
import { SectionTitle } from '@/components/Typography';
import { Spacer } from '@/components/Spacer';
import message from '@/utils/message';

const Layout = ({
  regulationTypes,
  isLoading,
  isDeleting,
  isCreateLoading,
  dispatchGetRegulationType,
  dispatchCreateRegulationType,
  dispatchDeleteRegulationType,
}: PropsFromRedux) => {
  const [t] = useTranslation(['regulation_type']);
  const [isShowModal, setIsShowModal] = useState(false);
  const [modalConFirmDelete, setModalConFirmDelete] = useState(null);
  const [isShowModalDeleteComplete, setIsShowModalDeleteComplete] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [deletingField, setDeletingField] = useState(null);

  const isOrganizationDeleted = useIsOrganizationDeleted();

  useEffect(() => {
    dispatchGetRegulationType();
  }, [dispatchGetRegulationType]);

  const form = useForm({
    resolver: yupResolver(
      Yup.object().shape({
        regulationTypes: Yup.array().of(
          Yup.object().shape({
            name: Yup.string()
              .max(30, t('common:message_max_length', { max: 30 }))
              .required(t('common:message_required', { field: t('regulation_type_label') })),
          })
        ),
      })
    ),
  });
  const { control, reset, handleSubmit } = form;

  const { fields, append, move, remove } = useFieldArray({
    keyName: 'key',
    control,
    name: 'regulationTypes',
  });

  useEffect(() => {
    const values = {
      regulationTypes,
    };
    reset(values);
  }, [regulationTypes, reset]);

  const onSubmitHandler = useCallback(
    (values: any) => {
      if (isOrganizationDeleted) {
        return;
      }
      const newValues = values?.regulationTypes?.map((item, index) => ({
        name: item?.name,
        orderNo: index + 1,
        id: item?.id || undefined,
      }));
      const params = { regulationTypes: newValues };
      dispatchCreateRegulationType({
        params,
        callback: () => {
          setShowUpdateSuccess(true);
          dispatchGetRegulationType();
        },
        errorCallback: errors => {
          if (errors?.errorCode === ErrorCodes.DUPLICATE_REGULATION_TYPE) {
            const newErrors = errors?.data?.split(',');
            newErrors.forEach(error => {
              form.setError(`regulationTypes.${+error - 1}.name`, {
                type: 'manual',
                message: t(`server_error:${errors.errorCode}`),
              });
            });
          }
        },
      });
    },
    [dispatchCreateRegulationType, dispatchGetRegulationType, form, t, isOrganizationDeleted]
  );

  const handleDeleteRegulationType = (field, index) => {
    if (isOrganizationDeleted) {
      return;
    }

    const regulationTypesValue = form.getValues('regulationTypes');
    if (!regulationTypesValue?.[index]?.id) {
      remove(index);
      return;
    }

    if (field.isHadRegulation) {
      setIsShowModal(true);
      return;
    }

    setDeletingField(field);
    setModalConFirmDelete({
      visible: true,
      children: (
        <span>
          <p className="mb-1"> {t('confirm_before_delete')}</p>
          <p className="mb-1"> {t('click_to_delete')}</p>
          <div className="name-box d-flex justify-content-center p-3 mt-3 mb-1">
            <span className="text-nowrap">{t('deleting_type')}</span>
            <span className="font-weight-bold ml-2">{field?.name}</span>
          </div>
        </span>
      ),
    });
  };

  const handleDragDropItem = ({ source, destination }) => {
    move(source.index, destination.index);
    const formValues = form.getValues();
    const filterValueNoId = formValues?.regulationTypes?.filter(item => item.id != null);

    const orderRegulationType = filterValueNoId?.map((item, index) => ({
      name: item?.name,
      orderNo: index + 1,
      id: item?.id,
    }));

    const params = { regulationTypes: orderRegulationType };
    dispatchCreateRegulationType({
      params,
      callback: () => {
        message.success(t('order_message_success'));
      },
    });
  };

  const handleOnOk = () => {
    setCurrentType(deletingField.name);
    dispatchDeleteRegulationType({
      params: { id: deletingField?.id },
      callback: () => {
        setModalConFirmDelete(false);
        setIsShowModalDeleteComplete(true);
        dispatchGetRegulationType();
      },
    });
  };

  return (
    <WithAuth title={t('regulation_type_title')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <SectionTitle level={3} icon={<FileCircleIcon />}>
        {t('regulation_type_setting')}
      </SectionTitle>
      <Card className="regulation-type-card" bordered={false}>
        <div>
          <div className="regulation-type-content">
            <Typography.Text className="regulation-type-sub">{t('regulation_type_sub')}</Typography.Text>
          </div>
          <Spacer height="17px" />
          <div>
            <Row className="regulation-fields-title">
              <Col flex="0 0 76px" className="text-center">
                <Typography.Text> {t('department_master:sort_by')}</Typography.Text>
              </Col>
              <Col flex={1}>
                <Typography.Text> {t('regulation_type_name')}</Typography.Text>
              </Col>
              <Col flex="0 0 72px" className="text-center">
                <Typography.Text>{t('delete_label')}</Typography.Text>
              </Col>
            </Row>
            <div>
              <Form form={form} onSubmit={onSubmitHandler} className="main-form">
                <DragDropContext onDragEnd={({ source, destination }) => handleDragDropItem({ source, destination })}>
                  <Droppable droppableId="taskProcesses">
                    {provided => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {fields.map((field, index) => (
                          <Draggable key={field.key} draggableId={field.key.toString()} index={index}>
                            {draggableProvided => (
                              <Row
                                align="middle"
                                {...draggableProvided.draggableProps}
                                ref={draggableProvided.innerRef}
                                className="regulation-type-item"
                              >
                                <Col
                                  flex="0 0 76px"
                                  className={classNames('text-center', isOrganizationDeleted && 'disabled-action')}
                                  {...(isOrganizationDeleted ? {} : draggableProvided.dragHandleProps)}
                                >
                                  <DragIcon />
                                </Col>
                                <Col flex={1}>
                                  <Field disabled={isOrganizationDeleted} type="text" name={`regulationTypes.${index}.name`} size="large" />
                                </Col>
                                {fields && (
                                  <Col flex="0 0 72px" className="d-flex align-items-center justify-content-center">
                                    <TrashIcon
                                      className={`delete-button ${isOrganizationDeleted ? 'disabled-action' : ''}`}
                                      onClick={() => handleDeleteRegulationType(field, index)}
                                    />
                                  </Col>
                                )}
                              </Row>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <div className="d-flex justify-content-center mt-3">
                    <Button
                      disabled={isOrganizationDeleted}
                      className="add-button mn-w200p"
                      onClick={isOrganizationDeleted ? undefined : () => append({ name: '' })}
                    >
                      {t('add_regulation')} <PlusOutlined />
                    </Button>
                  </div>
                </DragDropContext>
              </Form>
              <Spacer height="29px" />
              <div className="flex-center">
                <Button
                  disabled={isOrganizationDeleted}
                  onClick={handleSubmit(onSubmitHandler)}
                  loading={isCreateLoading}
                  type="primary"
                  className="mn-w180p font-weight-bold"
                  size="large"
                >
                  {t('btn_register')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Modal
        className="modal-confirm modal-footer-center"
        centered
        maskClosable={false}
        closable={false}
        visible={isShowModal}
        footer={[
          <Button key="submit" type="primary" htmlType="button" onClick={() => setIsShowModal(false)}>
            {t('common:button_close')}
          </Button>,
        ]}
      >
        <Typography.Title level={4} className="title-section mb-2">
          {t('modal_delete_title')}
        </Typography.Title>
        <p className="text-pre-line mb-0">{t('warning_delete_sub_1')}</p>
        <p> {t('warning_delete_sub_2')}</p>
      </Modal>

      <ModalInfo
        title={t('modal_delete_title')}
        onCancel={() => setModalConFirmDelete(null)}
        className="modal-confirm modal-footer-center"
        footer={[
          <Button
            size="large"
            key="cancel"
            shape="round"
            className="mn-w180p color-text font-weight-bold"
            onClick={() => setModalConFirmDelete(null)}
          >
            {t('common:button_cancel')}
          </Button>,
          <Button
            size="large"
            key="submit"
            shape="round"
            className="mn-w180p font-weight-bold"
            type="primary"
            loading={isDeleting}
            onClick={handleOnOk}
          >
            {t('user_management:btn_delete_user')}
          </Button>,
        ]}
        afterClose={() => setDeletingField(null)}
        width="600px"
        {...modalConFirmDelete}
      />

      <ModalInfo
        title={t('modal_delete_title')}
        visible={isShowModalDeleteComplete}
        okText={t('common:button_close')}
        onOk={() => setIsShowModalDeleteComplete(false)}
        maskClosable={false}
        closable={false}
      >
        <p className="text-pre-line">{t('type_deleted')}</p>
        <p>
          {t('type_need_delete')}
          {currentType}
        </p>
      </ModalInfo>

      <ModalInfo
        className="modal-update-complete modal-footer-center"
        visible={showUpdateSuccess}
        okText={t('common:button_close')}
        onOk={() => setShowUpdateSuccess(false)}
        onCancel={() => setShowUpdateSuccess(false)}
      >
        <div className="flex-center">{t('update_regulation_complete')}</div>
      </ModalInfo>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGetRegulationType: () => dispatch(getRegulationTypes()),
  dispatchCreateRegulationType: (payload: Payload) => dispatch(createRegulationType(payload)),
  dispatchDeleteRegulationType: (payload: Payload) => dispatch(deleteRegulationType(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { isLoading, regulationTypes, isCreateLoading, isDeleting } = state.regulationTypeReducer;
  return { isLoading, regulationTypes, isCreateLoading, isDeleting };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
