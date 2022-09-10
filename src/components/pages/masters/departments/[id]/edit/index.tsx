import { Button, Card, Col, Modal, Row, Typography } from 'antd';
import React, { useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { connect, ConnectedProps } from 'react-redux';
import { useRouter } from 'next/router';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { Form, Field } from '@/components/form';
import { Payload } from '@/types';
import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { getDepartmentDetail, updateDepartment } from '@/redux/actions';
import LoadingScreen from '@/components/LoadingScreen';
import { paths } from '@/shared/paths';
import { ModalInfo } from '@/components/modal';
import { ArrowLeftIcon, FileCircleIcon } from '@/assets/images';
import { SectionTitle } from '@/components/Typography';

const EditDepartment = ({ departmentDetail, isLoading, getDepartmentDetailAction, updateDepartmentAction }: PropsFromRedux) => {
  const [t] = useTranslation(['department_master', 'common']);
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [isShowModalComplete, setIsShowModalComplete] = useState(false);
  const [isShowModalError, setIsShowModalError] = useState(false);
  const [isShowModalDepartmentNotFoundError, setIsShowModalDepartmentNotFoundError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const { id } = router.query;
    getDepartmentDetailAction({ params: { id }, errorCallback: () => setIsShowModalDepartmentNotFoundError(true) });
  }, [getDepartmentDetailAction, router]);

  const handleSubmit = useCallback(
    (values: any) => {
      const { id } = router.query;
      updateDepartmentAction({
        params: { ...values, id },
        callback: () => {
          setIsShowModalConfirm(false);
          setIsShowModalComplete(true);
        },
        errorCallback: () => {
          setIsShowModalConfirm(false);
          setIsShowModalError(true);
        },
      });
    },
    [router, updateDepartmentAction]
  );

  const form = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .required(t('common:message_required', { field: t('department_name') }))
          .max(50, t('common:message_max_length', { max: 50 })),
      })
    ),
    defaultValues: { name: departmentDetail?.name },
  });

  useEffect(() => {
    form.setValue('name', departmentDetail?.name || '');
  }, [departmentDetail, form]);

  const departmentName = form.watch('name');

  return (
    <WithAuth title={t('common:page_department')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <div className="department-container">
        <div className="mb-4">
          <Link href={paths.master.departments.index}>
            <a className="back-text">
              <ArrowLeftIcon className="mr-2" />
              {t('user_management:back_department_master')}
            </a>
          </Link>
        </div>
        <SectionTitle level={4} icon={<FileCircleIcon />}>
          {t('edit_department_label')}
        </SectionTitle>
        <Card className="mb-4 card-body">
          <section className="section-content section-upload ">
            <Row className="mb-2" gutter={16}>
              <Col flex="0 0 112px">
                <Typography.Paragraph className="field-label mb-0">{t('current_name')}</Typography.Paragraph>
              </Col>
              <Col flex={1}>
                <Typography.Paragraph className="field-value mb-0">{departmentDetail?.name}</Typography.Paragraph>
              </Col>
            </Row>
            <Form form={form} onSubmit={() => setIsShowModalConfirm(true)}>
              <Row gutter={16}>
                <Col flex="0 0 112px">
                  <Typography.Title level={4} className="form-label mb-0">
                    {t('department_changed')}
                  </Typography.Title>
                </Col>
                <Col flex={1}>
                  <Field type="text" name="name" className="border-input" size="large" />
                </Col>
              </Row>
              <div className="flex-center mt-3">
                <Button size="large" type="primary" shape="round" htmlType="submit" className="mn-w150p">
                  {t('common:button_register')}
                </Button>
              </div>
            </Form>
          </section>
        </Card>
      </div>
      <Modal
        className="modal-footer-center"
        onCancel={() => setIsShowModalConfirm(false)}
        centered
        visible={isShowModalConfirm}
        footer={[
          <Button
            size="large"
            key="cancel"
            shape="round"
            className="mn-w180p color-text font-weight-bold"
            onClick={() => setIsShowModalConfirm(false)}
          >
            {t('common:button_cancel')}
          </Button>,
          <Button
            size="large"
            key="submit"
            shape="round"
            className="mn-w180p font-weight-bold"
            type="primary"
            loading={isLoading}
            onClick={() => handleSubmit(form.getValues())}
          >
            {t('common:confirm_button')}
          </Button>,
        ]}
        width="600px"
        bodyStyle={{
          paddingBottom: 0,
        }}
      >
        <Typography.Title level={4} className="title-section mb-2 color-text">
          {t('modal_edit_department_title')}
        </Typography.Title>
        <p className="mb-0">{t('edit_department_sub_1')}</p>
        <p className="mb-0">{t('edit_department_sub_2')}</p>
        <Typography.Paragraph className="preview-content p-3 mt-3">
          <p className="desc mb-0">
            <span>{t('department_changed')}</span>
            <span className="preview-value ml-2">{departmentName}</span>
          </p>
        </Typography.Paragraph>
      </Modal>
      <Modal
        className="modal-confirm modal-footer-center"
        onCancel={() => setIsShowModalComplete(false)}
        centered
        visible={isShowModalComplete}
        footer={[
          <Button
            size="large"
            key="submit"
            shape="round"
            type="primary"
            className="mn-w150p"
            onClick={() => router.push(paths.master.departments.index)}
          >
            {t('btn_near')}
          </Button>,
        ]}
        bodyStyle={{
          paddingBottom: 10,
        }}
      >
        <p className="mb-0 text-center color-text">{t('modal_edit_department_complete')}</p>
      </Modal>
      <Modal
        className="modal-footer-center"
        onCancel={() => setIsShowModalError(false)}
        centered
        visible={isShowModalError}
        footer={[
          <Button key="submit" shape="round" type="primary" className="mn-w150p color-text" onClick={() => setIsShowModalError(false)}>
            {t('btn_near')}
          </Button>,
        ]}
      >
        <Typography.Title level={4} className="title-section mb-1">
          {t('modal_edit_department_error_title')}
        </Typography.Title>
        <p className="mb-0">{t('modal_error_sub_1')}</p>
        <p className="mb-0">{t('modal_error_sub_2')}</p>
        <p className="mb-0">{t('modal_error_sub_3')}</p>
      </Modal>

      {/* Modal department notfound */}
      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => {
          setIsShowModalDepartmentNotFoundError(false);
          router.back();
        }}
        visible={isShowModalDepartmentNotFoundError}
        title={t('edit_department_label')}
        closable={false}
      >
        <p className="mb-0">{t('modal_department_not_found')}</p>
      </ModalInfo>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  getDepartmentDetailAction: (payload: Payload) => dispatch(getDepartmentDetail(payload)),
  updateDepartmentAction: (payload: Payload) => dispatch(updateDepartment(payload)),
});

const mapStateToProps = (state: any) => {
  const { departmentDetail, isLoading } = state.departmentReducer;
  return { departmentDetail, isLoading };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(EditDepartment);
