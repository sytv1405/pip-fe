import { Button, Col, Modal, Row, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useTranslation } from 'i18next-config';
import { Form, Field } from '@/components/form';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { ModalInfo } from '@/components/modal';

export type DepartmentFormProps = {
  isCreateLoading: boolean;
  dispatchCreateDepartment: (values: FieldValues) => void;
  visible?: boolean;
  onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
  onSucess: () => void;
};

const DepartmentForm = ({ isCreateLoading, dispatchCreateDepartment, onSucess, visible, onCancel }: DepartmentFormProps) => {
  const [t] = useTranslation('department_master');
  const [hasDuplicatedError, setHasDuplicatedError] = useState(false);
  const [isCreateSuccessVisible, setIsCreateSuccessVisible] = useState(false);

  const form = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .required(t('common:message_required', { field: t('department_name') }))
          .max(50, t('common:message_max_length', { max: 50 })),
      })
    ),
  });

  const handleSubmit = params => {
    dispatchCreateDepartment({
      params,
      callback: () => {
        onSucess();
        form.reset();
        setIsCreateSuccessVisible(true);
      },
      errorCallback: error => {
        if (error.errorCode === ErrorCodes.DEPARTMENT_EXISTING) {
          setHasDuplicatedError(true);
        }
      },
    });
  };

  const handleCancel = useCallback(() => {
    onCancel();
    form.reset();
  }, [onCancel, form.reset]);

  const handleCloseSuccessModal = useCallback(() => {
    setIsCreateSuccessVisible(false);
    handleCancel();
  }, [setIsCreateSuccessVisible, handleCancel]);

  return (
    <>
      <Modal centered visible={visible} footer={null} onCancel={handleCancel} width={856}>
        <Form form={form} onSubmit={handleSubmit}>
          <Typography.Title level={4} className="form-title">
            {t('create_department')}
          </Typography.Title>
          <section className="section-content mt-4">
            <Row gutter={10}>
              <Col>
                <Typography.Title level={4} className="form-label mb-0">
                  {t('department_name')}
                </Typography.Title>
              </Col>
              <Col flex={1}>
                <Field type="text" name="name" className="mb-3 border-input" size="large" />
              </Col>
            </Row>
            <div className="flex-center">
              <Button
                size="large"
                type="primary"
                shape="round"
                htmlType="submit"
                className="mn-w150p font-weight-bold"
                loading={isCreateLoading}
              >
                {t('common:button_register')}
              </Button>
            </div>
          </section>
        </Form>
      </Modal>

      {/* Modal duplicated error */}
      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => setHasDuplicatedError(false)}
        visible={hasDuplicatedError}
        title={t('modal_import_department_success_title')}
        closable={false}
      >
        <p className="mb-0">{t('modal_error_sub_1')}</p>
        <p className="mb-0">{t('modal_error_sub_2')}</p>
        <p className="mb-0">{t('modal_error_sub_3')}</p>
      </ModalInfo>

      {/* Modal create successfully */}
      <ModalInfo
        okText={t('common:button_close')}
        onOk={handleCloseSuccessModal}
        visible={isCreateSuccessVisible}
        onCancel={handleCloseSuccessModal}
        maskClosable={false}
      >
        <p className="mb-0 text-center">{t('modal_import_department__create_success')}</p>
      </ModalInfo>
    </>
  );
};

export default DepartmentForm;
