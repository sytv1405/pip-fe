import { Button, Col, Modal, Row, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Field, Form, Label } from '@/components/form';
import { useTranslation } from 'i18next-config';
import { Payload, RegulationType } from '@/types';
import { mapOptions } from '@/utils/selects';
import { ModalInfo } from '@/components/modal';

type Props = {
  isCreateLoading: boolean;
  dispatchCreateRegulation: (payload: Payload) => void;
  dispatchGetRegulations: (payload?: Payload) => void;
  regulationTypes: RegulationType[];
  disabled: boolean;
  visible?: boolean;
  onCancel: (e?: React.MouseEvent<HTMLElement>) => void;
};

const RegulationCreate = ({
  disabled,
  regulationTypes,
  isCreateLoading,
  dispatchCreateRegulation,
  dispatchGetRegulations,
  visible,
  onCancel,
}: Props) => {
  const { t } = useTranslation('regulations');
  const [modalError, setModalError] = useState(null);
  const [showModalForm, setShowModalForm] = useState(visible);
  const [modalSuccess, setModalSuccess] = useState(null);

  const form = useForm({
    resolver: yupResolver(
      yup.object().shape({
        regulationTypeId: yup.number().required(t('common:message_required', { field: t('kinds') })),
        name: yup
          .string()
          .required(t('common:message_required', { field: t('name') }))
          .max(100, t('common:message_max_length', { max: 100 })),
      })
    ),
  });

  const handleSubmit = params => {
    dispatchCreateRegulation({
      params,
      callback: () => {
        form.reset();
        setShowModalForm(false);
        setModalSuccess({
          visible: true,
          children: <p className="mb-0 text-center text-normal">{t('message_create_regulation_success')}</p>,
        });
        dispatchGetRegulations();
      },
      errorCallback: error => {
        if (error.status !== 403) {
          setModalError({
            visible: true,
            children: <span className="text-pre-line">{t(`server_error:${error.errorCode}`)}</span>,
          });
        }
      },
    });
  };

  const handleCloseSuccessModal = useCallback(() => {
    setModalSuccess(null);
    onCancel();
  }, [setModalSuccess, onCancel]);

  return (
    <>
      <Modal centered visible={showModalForm} footer={null} onCancel={onCancel} width={856}>
        <Form form={form} onSubmit={handleSubmit}>
          <Typography.Title level={4} className="form-title">
            {t('common:btn_create_one')}
          </Typography.Title>
          <section className="section-content mt-4">
            <Row gutter={10}>
              <Col flex="0 0 60px">
                <Label className="form-label mb-0">{t('kinds')}</Label>
              </Col>
              <Col flex={1}>
                <Field
                  type="select"
                  name="regulationTypeId"
                  options={mapOptions(regulationTypes, { labelKey: 'name', valueKey: 'id' })}
                  allowClear
                  style={{ width: '50%' }}
                  className="mb-3 border-input"
                  size="large"
                />
              </Col>
            </Row>
            <Row gutter={10}>
              <Col flex="0 0 60px">
                <Typography.Title level={4} className="form-label mb-0">
                  {t('name')}
                </Typography.Title>
              </Col>
              <Col flex={1}>
                <Field type="text" name="name" className="mb-3 border-input" size="large" />
              </Col>
            </Row>
            <div className="flex-center mt-2">
              <Button
                size="large"
                type="primary"
                shape="round"
                htmlType="submit"
                className="mn-w150p font-weight-bold"
                loading={isCreateLoading}
                disabled={disabled}
              >
                {t('common:button_register')}
              </Button>
            </div>
          </section>
        </Form>
      </Modal>
      <ModalInfo
        okText={t('common:button_close')}
        onOk={handleCloseSuccessModal}
        onCancel={handleCloseSuccessModal}
        maskClosable={false}
        bodyStyle={{ paddingBottom: '6px', paddingTop: '28px' }}
        {...modalSuccess}
      />
      <ModalInfo
        title={t('modal_create_regulation_success_title')}
        okText={t('common:button_close')}
        onOk={() => setModalError(null)}
        onCancel={() => setModalError(null)}
        closable={false}
        {...modalError}
      />
    </>
  );
};

export default RegulationCreate;
