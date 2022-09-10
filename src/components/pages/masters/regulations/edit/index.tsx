import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col } from 'antd';
import Link from 'next/link';
import { connect, ConnectedProps } from 'react-redux';
import router, { useRouter } from 'next/router';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowRightOutlined } from '@ant-design/icons';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { getRegulation, getRegulationTypes, updateRegulation } from '@/redux/actions';
import { Payload } from '@/types';
import { Field, Form, Label } from '@/components/form';
import { paths } from '@/shared/paths';
import LoadingScreen from '@/components/LoadingScreen';
import { ModalInfo } from '@/components/modal';
import { ArrowLeftIcon, FileCircleIcon } from '@/assets/images';
import { SectionTitle } from '@/components/Typography';
import { Spacer } from '@/components/Spacer';

const RegulationEdit = ({
  isLoading,
  isUpdateLoading,
  regulation,
  regulationTypes,
  dispatchGetRegulation,
  dispatchUpdateRegulation,
  dispatchGetRegulationTypes,
}: PropsFromRedux) => {
  const [t] = useTranslation(['regulations']);
  const [modalConfirmVisible, setModalConfirmVisible] = useState(null);
  const [modalSuccessVisible, setModalSuccessVisible] = useState(null);
  const [modalError, setModalError] = useState(null);
  const regulationType = regulationTypes.find(record => record.id === regulation.regulationTypeId);

  const {
    query: { id },
  } = useRouter();

  const form = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .required(t('common:message_required', { field: t('name') }))
          .max(100, t('common:message_max_length', { max: 100 })),
      })
    ),
  });

  const handleSubmit = data => {
    dispatchUpdateRegulation({
      params: {
        id,
        data,
      },
      callback: () => {
        setModalSuccessVisible(true);
        setModalConfirmVisible(false);
      },
      errorCallback: error => {
        if (error.status !== 403) {
          setModalError({
            visible: true,
            children: <span className="text-pre-line">{t(`server_error:${error.errorCode}`)}</span>,
          });
        }
        setModalConfirmVisible(false);
      },
    });
  };

  useEffect(() => {
    dispatchGetRegulation({
      params: { id },
      callback: response => {
        form.setValue('name', response.name);
        form.setValue('regulationTypeId', response.regulationTypeId);
      },
    });
    dispatchGetRegulationTypes();
  }, [dispatchGetRegulation, id, form, dispatchGetRegulationTypes]);

  return (
    <WithAuth title={t('title')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <Typography.Paragraph className="mb-4">
        <Link href={paths.master.regulations.index}>
          <p className="cursor-pointer">
            <ArrowLeftIcon />
            <span className="ml-2 text-minimum">{t('return_to_top_page')}</span>
          </p>
        </Link>
      </Typography.Paragraph>
      <SectionTitle icon={<FileCircleIcon />} level={3}>
        {t('title_edit')}
      </SectionTitle>
      <Card className="mt-2">
        <Form form={form} className="main-form" onSubmit={() => setModalConfirmVisible(true)}>
          <Row className="mb-3">
            <Col flex="0 0 130px">
              <Label htmlFor="name" className="mb-0 mt-1 font-weight-bold">
                {t('selected_name')}
              </Label>
            </Col>
            <Col flex={1}>
              <Typography className="text-large">{regulation?.name}</Typography>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col flex="0 0 130px" className="pt-2">
              <Label htmlFor="name" className="font-weight-bold">
                {t('name_after_change')}
              </Label>
            </Col>
            <Col flex={1}>
              <Field size="large" type="text" id="name" name="name" />
            </Col>
          </Row>
          <Field type="hidden" name="regulationTypeId" />
          <Typography className="text-center">{t('form_desc')}</Typography>
          <Spacer height="20px" />
          <div className="flex-center">
            <Button type="primary" htmlType="submit" className="mn-w150p font-weight-bold" size="large">
              {t('common:button_register')}
            </Button>
          </div>
        </Form>
      </Card>
      <ModalInfo
        width={600}
        visible={modalConfirmVisible}
        onCancel={() => setModalConfirmVisible(false)}
        title={t('modal_update_regulation__title')}
        className="modal-confirm modal-footer-center"
        footer={[
          <Button
            size="large"
            key="cancel"
            shape="round"
            className="mn-w150p color-text font-weight-bold"
            onClick={() => setModalConfirmVisible(false)}
          >
            {t('common:button_cancel')}
          </Button>,
          <Button
            size="large"
            key="submit"
            shape="round"
            className="mn-w150p font-weight-bold"
            type="primary"
            loading={isUpdateLoading}
            onClick={() => handleSubmit(form.getValues())}
          >
            {t('common:confirm_button')}
          </Button>,
        ]}
      >
        <div>{t('modal_update_regulation__desc1')}</div>
        <div className="mb-3">{t('modal_update_regulation__desc2')}</div>
        <div className="name-box p-3 mb-2">
          <p className="mb-0 text-center old-name">{regulation?.name}</p>
          <div className="d-flex justify-content-center align-items-center">
            {t('business_unit:name_changed')}
            <span className="font-weight-bold ml-2">{form.watch('name')}</span>
          </div>
        </div>
      </ModalInfo>
      <ModalInfo
        visible={modalSuccessVisible}
        title={t('modal_update_regulation_success__title')}
        onCancel={() => setModalSuccessVisible(false)}
        closable={false}
        onOk={() => router.push(paths.master.regulations.index)}
        okText={t('common:button_close')}
      >
        <p>{t('modal_update_regulation_success__desc')}</p>
        <p className="mb-0">{regulationType?.name}</p>
        <ul>
          <li>
            {regulation?.name} <ArrowRightOutlined className="mr-1" />
            {form.watch('name')}
          </li>
        </ul>
      </ModalInfo>
      <ModalInfo
        title={t('modal_update_regulation__title')}
        okText={t('common:button_close')}
        onOk={() => setModalError(null)}
        onCancel={() => setModalError(null)}
        closable={false}
        {...modalError}
      />
    </WithAuth>
  );
};

const mapStateToProps = state => {
  const { regulation, isUpdateLoading, isLoading } = state.regulationReducer;
  const { regulationTypes } = state.regulationTypeReducer;
  return { regulation, regulationTypes, isUpdateLoading, isLoading };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetRegulation: (payload: Payload) => dispatch(getRegulation(payload)),
  dispatchGetRegulationTypes: () => dispatch(getRegulationTypes()),
  dispatchUpdateRegulation: (payload: Payload) => dispatch(updateRegulation(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(RegulationEdit);
