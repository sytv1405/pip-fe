import React, { ReactNode, useEffect, useState } from 'react';
import { Card, Button, Typography, ModalProps } from 'antd';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { connect, ConnectedProps } from 'react-redux';
import router, { useRouter } from 'next/router';
import { pick } from 'lodash';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { Form, Label, Field } from '@/components/form';
import { updateOrganization, getOrganization, deleteOrganization, getUser } from '@/redux/actions';
import { Payload } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import { paths } from '@/shared/paths';
import { ModalInfo } from '@/components/modal';
import { ORGANIZATION_CODE_REGEX } from '@/shared/regex';
import { SectionTitle } from '@/components/Typography';
import { ArrowLeftIcon, ListIcon } from '@/assets/images';
import message from '@/utils/message';

import OrganizationDeleteModal from '../modules/OrganizationDeleteModal';
import styles from '../modules/styles.module.scss';

const EditUserOrganizations = ({
  isLoading,
  isUpdateLoading,
  isDeleteLoading,
  user,
  organization,
  dispatchGetUser,
  dispatchGetOrganization,
  dispatchUpdateOrganization,
  dispatchDeleteOrganization,
}: PropsFromRedux) => {
  const [t] = useTranslation(['user_organizations', 'common']);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [modalConfirmDelete, setModalConfirmDelete] = useState<ModalProps & { children: ReactNode }>(null);
  const [modalDeleteSuccess, setModalDeleteSuccess] = useState<ModalProps & { children: ReactNode }>(null);

  const {
    query: { id },
  } = useRouter();

  const form = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .required(t('common:message_required', { field: t('organization_name') }))
          .max(100, t('common:message_max_length', { max: 100 })),
        organizationCode: yup
          .string()
          .required(t('common:message_required', { field: t('organization_code') }))
          .max(20, t('common:message_max_length', { max: 20 }))
          .matches(ORGANIZATION_CODE_REGEX, t('message_invalid_code')),
      })
    ),
  });

  useEffect(() => {
    dispatchGetOrganization({
      params: { id },
      callback: response => {
        form.reset(pick(response, ['name', 'organizationCode']));
      },
      errorCallback: error => {
        message.error(error?.data?.message?.[0]);
      },
    });
  }, [dispatchGetOrganization, form, id]);

  const handleSubmit = data => {
    dispatchUpdateOrganization({
      params: { id, data },
      callback: () => {
        message.success(t('common:edit_success'));
        router.push(paths.master.userOrganizations.index);
      },
      errorCallback: error => {
        message.error(error?.data?.message?.[0]);
      },
    });
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <WithAuth title={t('common:page_user_organization')} isContentFullWidth>
      <Typography.Paragraph>
        <Link href={paths.master.userOrganizations.index}>
          <a className={styles['back-text']}>
            <ArrowLeftIcon className="mr-2" />
            {t('btn_return')}
          </a>
        </Link>
      </Typography.Paragraph>
      <SectionTitle icon={<ListIcon className="mb-n1" />}>{t('title_editing')}</SectionTitle>
      <Card className="mt-2 border-none">
        <Form form={form} className="main-form" onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label strong isRequired htmlFor="name">
              {t('organization')}
            </Label>
            <Field type="text" id="name" name="name" className="border-input" size="large" />
          </div>
          <div className="mb-4">
            <Label strong isRequired htmlFor="organizationCode">
              {t('organization_code')}
            </Label>
            <Field type="text" id="organizationCode" name="organizationCode" disabled className="border-input" size="large" />
          </div>
          <div className="mt-4 pb-0 flex-center">
            <Button size="large" shape="round" className="mn-w150p font-weight-bold" onClick={() => setIsDeleteModalVisible(true)}>
              {t('common:delete')}
            </Button>
            <Button size="large" type="primary" htmlType="submit" className="mn-w150p ml-4 font-weight-bold" loading={isUpdateLoading}>
              {t('common:button_update')}
            </Button>
          </div>
        </Form>
      </Card>
      <OrganizationDeleteModal
        onOk={({ isHardDeleted }) => {
          setIsDeleteModalVisible(false);

          setModalConfirmDelete({
            visible: true,
            children: isHardDeleted ? (
              <>
                <Typography.Title level={4} className="title-section mb-2 color-text">
                  {t('modal_confirm_hard_delete_title')}
                </Typography.Title>
                <p className="text-pre-line">{t('modal_confirm_hard_delete_message', { name: organization.name })}</p>
                <p className={styles['preview-content']}>
                  {t('organization_name')}：{organization.name}
                  <br />
                  {t('execution_content')}：{t('delete_all')}
                </p>
              </>
            ) : (
              <>
                <Typography.Title level={4} className="title-section mb-2 color-text">
                  {t('modal_confirm_soft_delete_title')}
                </Typography.Title>
                <p className="text-pre-line">{t('modal_confirm_soft_delete_message', { name: organization.name })}</p>
                <div className={styles['preview-content']}>
                  <div>
                    <span>{t('organization_name')}：</span>
                    <span>{organization.name}</span>
                  </div>
                  <div>
                    <span>{t('execution_content')}：</span>
                    <span>{t('suspension_of_use')}</span>
                  </div>
                </div>
              </>
            ),
            onOk: () => {
              dispatchDeleteOrganization({
                params: { id, isHardDeleted },
                callback: () => {
                  setModalConfirmDelete(null);

                  setModalDeleteSuccess({
                    visible: true,
                    children: isHardDeleted ? (
                      <>
                        <Typography.Title level={4} className="title-section mb-2 color-text">
                          {t('modal_hard_delete_success_title')}
                        </Typography.Title>
                        <p className="text-pre-line">{t('modal_hard_delete_success_message')}</p>
                        <div className={styles['preview-content']}>
                          {t('deleted_organization')}：{organization.name}
                        </div>
                      </>
                    ) : (
                      <>
                        <Typography.Title level={4} className="title-section mb-2 color-text">
                          {t('modal_soft_delete_success_title')}
                        </Typography.Title>
                        <p className="text-pre-line">{t('modal_soft_delete_success_message')}</p>
                        <div className={styles['preview-content']}>
                          {t('suspended_organization')}：{organization.name}
                        </div>
                      </>
                    ),
                  });

                  if (+id === user.organization.id) {
                    dispatchGetUser();
                  }
                },
                errorCallback: () => {
                  setModalConfirmDelete(null);
                },
              });
            },
          });
        }}
        onCancel={() => setIsDeleteModalVisible(false)}
        visible={isDeleteModalVisible}
        organization={organization}
      />
      <ModalInfo
        onCancel={() => setModalConfirmDelete(null)}
        okText={t('common:button_execute')}
        confirmLoading={isDeleteLoading}
        {...modalConfirmDelete}
      />
      <ModalInfo
        onCancel={() => setModalDeleteSuccess(null)}
        onOk={() => router.push(paths.master.userOrganizations.index)}
        closable={false}
        okText={t('common:button_close')}
        {...modalDeleteSuccess}
      />
    </WithAuth>
  );
};

const mapStateToProps = state => {
  const { user } = state.authReducer;
  const { organization, isLoading, isUpdateLoading, isDeleteLoading } = state.organizationReducer;
  return { user, organization, isLoading, isUpdateLoading, isDeleteLoading };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetOrganization: (payload: Payload) => dispatch(getOrganization(payload)),
  dispatchUpdateOrganization: (payload: Payload) => dispatch(updateOrganization(payload)),
  dispatchDeleteOrganization: (payload: Payload) => dispatch(deleteOrganization(payload)),
  dispatchGetUser: () => dispatch(getUser()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(EditUserOrganizations);
