import { Button, Card, Col, Row, Typography } from 'antd';
import Link from 'next/link';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { WithAuth } from '@/components/Roots/WithAuth';
import { Payload } from '@/types';
import {
  createUser,
  deleteUser,
  getDepartmentsForEditUser,
  getUserDetail,
  resendPassword,
  resetPassword,
  updateUser,
} from '@/redux/actions';
import { Field, Label, Form } from '@/components/form';
import { mapOptions, translateOptions } from '@/utils/selects';
import { USER_ROLE_ORGANIZATION } from '@/shared/constants/user';
import LoadingScreen from '@/components/LoadingScreen';
import { paths } from '@/shared/paths';
import { ModalInfo } from '@/components/modal';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { SectionTitle } from '@/components/Typography';
import { ArrowLeftIcon, LockExclamationIcon, LockQuestionIcon, FileCircleIcon } from '@/assets/images';
import message from '@/utils/message';

import styles from './styles.module.scss';

const EditUserOrganization = ({
  userDetail,
  dispatchGetUserDetail,
  departmentsForEditUser,
  isLoading,
  user,
  isSubmitting,
  isDeleting,
  isResending,
  isResetting,
  dispatchResendPassword,
  dispatchResetPassword,
  dispatchGetDepartments,
  dispatchUpdateUser,
  dispatchDeleteUser,
}: PropsFromRedux) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalComplete, setIsModalComplete] = useState(false);
  const [isModalUserNotFoundVisible, setIsModalUserNotFoundVisible] = useState(false);
  const [t] = useTranslation(['user_management', 'common']);
  const router = useRouter();
  const { id } = router.query;

  const [isShowModalSendPassword, setIsShowModalSendPassword] = useState(false);
  const [isShowModalSendCode, setIsShowModalSendCode] = useState(false);
  const [isShowModalDeleteYourSelf, setIsShowModalDeleteYourSelf] = useState(false);
  const [isShowModalDeleteAdmin, setIsShowModalDeleteAdmin] = useState(false);

  useEffect(() => {
    dispatchGetDepartments({ params: { organizationId: userDetail?.organizationId } });
  }, [dispatchGetDepartments, userDetail?.organizationId]);

  useEffect(() => {
    dispatchGetUserDetail({
      params: { id },
      errorCallback: () => {
        setIsModalUserNotFoundVisible(true);
      },
    });
  }, [dispatchGetUserDetail, id, router]);

  const form = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .required(t('common:message_required', { field: t('account_label') }))
          .max(50, t('common:message_max_length', { max: 50 })),
        email: yup
          .string()
          .required(t('common:message_required', { field: t('email_label') }))
          .email(t('common:email_validate'))
          .max(256, t('common:message_max_length', { max: 256 })),
        departmentId: yup.string().required(t('common:please_select', { field: t('department') })),
        userRole: yup.string().required(t('common:please_select', { field: t('author_label') })),
      })
    ),
    defaultValues: {
      name: userDetail?.name,
      email: userDetail?.email,
      departmentId: userDetail?.department?.id,
      userRole: userDetail?.userRole,
    },
  });

  const handleSubmit = useCallback(
    (data: any) => {
      const payload = { ...data, id, organizationId: user.organizationId };
      dispatchUpdateUser({
        params: payload,
        callback: () => {
          message.success(t('common:edit_success'));
          dispatchGetUserDetail({
            params: { id },
          });
        },
        errorCallback: errors => {
          if (errors?.errorCode === ErrorCodes.EMAIL_DUPLICATED) {
            form.setError('email', {
              type: 'manual',
              message: t(`server_error:${errors.errorCode}`),
            });
          }
        },
      });
    },
    [id, user.organizationId, dispatchUpdateUser, t, dispatchGetUserDetail, form]
  );

  const handleDeleteUser = useCallback(() => {
    dispatchDeleteUser({
      params: { id },
      callback: () => {
        setIsModalVisible(false);
        setIsModalComplete(true);
      },
      errorCallback: error => {
        if (error?.errorCode === ErrorCodes.DELETE_ACCOUNT_YOURSELF) {
          setIsModalVisible(false);
          setIsShowModalDeleteYourSelf(true);
        }
        if (error?.errorCode === ErrorCodes.DELETE_ACCOUNT_ADMIN) {
          setIsModalVisible(false);
          setIsShowModalDeleteAdmin(true);
        }
      },
    });
  }, [dispatchDeleteUser, id]);

  useEffect(() => {
    form.setValue('name', userDetail?.name || '');
    form.setValue('email', userDetail?.email || '');
    form.setValue('userRole', userDetail?.userRole || '');
    form.setValue(
      'departmentId',
      departmentsForEditUser?.find(item => item.id === userDetail?.department?.id) ? userDetail?.department?.id : ''
    );
  }, [userDetail, form, departmentsForEditUser]);

  const handleResendPassword = useCallback(() => {
    dispatchResendPassword({
      params: { id },
      callback: () => {
        message.success(t('user_management:resend_password_success'));
      },
      errorCallback: () => {
        setIsShowModalSendPassword(true);
      },
    });
  }, [dispatchResendPassword, id, t]);

  const handleResetPassword = async () => {
    dispatchResetPassword({
      params: { id },
      callback: () => {
        message.success(t('user_management:resend_code_success'));
      },
      errorCallback: () => {
        setIsShowModalSendCode(true);
      },
    });
  };

  const departmentOptions = useMemo(
    () => mapOptions(departmentsForEditUser, { labelKey: 'name', valueKey: 'id' }),
    [departmentsForEditUser]
  );

  return (
    <WithAuth title={t('page_edit_title')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <div className="mb-3">
        <Link href={paths.master.users.index}>
          <a className={styles['link-go-back']}>
            <ArrowLeftIcon className="mr-2" />
            {t('back_user_management')}
          </a>
        </Link>
      </div>
      <SectionTitle icon={<FileCircleIcon />}>{t('update_user')}</SectionTitle>
      <Card className="mb-5" bordered={false}>
        <Form form={form} onSubmit={handleSubmit}>
          <Label className="font-weight-bold" isRequired>
            {t('account_label')}
          </Label>
          <Field type="text" name="name" size="large" className="mb-3 border-input" />
          <Label className="font-weight-bold" isRequired>
            {t('email_label')}
          </Label>
          <Field type="text" name="email" size="large" className="mb-3 border-input" />
          <Label className="font-weight-bold" isRequired>
            {t('apply_label')}
          </Label>
          <Field
            type="select"
            name="departmentId"
            size="large"
            options={departmentOptions}
            className={classNames(styles['narrow-field'], 'mb-2')}
          />
          <Label className="font-weight-bold" isRequired>
            {t('author_label')}
          </Label>
          <Field
            type="select"
            name="userRole"
            size="large"
            options={translateOptions(USER_ROLE_ORGANIZATION, t, 'common')}
            className={classNames(styles['narrow-field'], 'mb-4')}
          />
          <Row justify="center" gutter={12}>
            <Col>
              <Button type="default" size="large" onClick={() => setIsModalVisible(true)} className="mn-w180p font-weight-bold">
                {t('common:delete')}
              </Button>
            </Col>
            <Col>
              <Button type="primary" size="large" className="mn-w180p font-weight-bold" loading={isSubmitting} htmlType="submit">
                {t('common:button_update')}
              </Button>
            </Col>
          </Row>
        </Form>

        <ModalInfo
          title={t('delete_user_modal')}
          visible={isModalVisible}
          okText={t('btn_delete_user')}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleDeleteUser}
          confirmLoading={isDeleting}
        >
          <p className="mb-1"> {t('delete_user_modal_sub_1')}</p>
          <p className="mb-3"> {t('delete_user_modal_sub_2')}</p>
          <p className="mb-0"> {t('delete_user_object_label')}</p>
          <p className="mb-0">
            {t('user_name')} ：{userDetail?.name}
          </p>
          <p className="mb-0">
            {t('apply_label')} ：{userDetail?.department?.name}
          </p>
        </ModalInfo>

        <ModalInfo
          title={t('delete_user_modal')}
          okText={t('common:button_close')}
          onCancel={() => setIsModalComplete(false)}
          visible={isModalComplete}
          onOk={() => router.push(paths.master.users.index)}
          closable={false}
        >
          <p className="mb-3"> {t('delete_complete')}</p>
          <p className="mb-0"> {t('user_delete')}</p>
          <p className="mb-0">
            {t('user_name')}：{userDetail?.name}
          </p>
          <p className="mb-0">
            {t('apply_label')}：{userDetail?.department?.name}
          </p>
        </ModalInfo>
      </Card>

      <Row gutter={32}>
        <Col span={12}>
          <SectionTitle icon={<LockExclamationIcon />}>{t('resend_password_label')}</SectionTitle>
        </Col>
        <Col span={12}>
          <SectionTitle icon={<LockQuestionIcon />}>{t('reset_password_label')}</SectionTitle>
        </Col>
      </Row>
      <Row gutter={32}>
        <Col span={12}>
          <Card bordered={false} className="h-100">
            <Typography.Paragraph className={styles.description}>{t('resend_password_desc')}</Typography.Paragraph>
            <div className="text-center">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                onClick={handleResendPassword}
                loading={isResending}
                className={classNames(styles['mw-222px'], 'font-weight-bold')}
              >
                {t('btn_send_pass')}
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false} className="h-100">
            <Typography.Paragraph className={styles.description}>{t('reset_password_desc')}</Typography.Paragraph>
            <div className="text-center">
              <Button
                type="primary"
                size="large"
                onClick={handleResetPassword}
                loading={isResetting}
                htmlType="submit"
                className={classNames(styles['mw-222px'], 'font-weight-bold')}
              >
                {t('btn_send_code')}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal user notfound */}
      <ModalInfo
        okText={t('return_user_management')}
        onOk={() => {
          setIsModalUserNotFoundVisible(false);
          router.back();
        }}
        maskClosable={false}
        closable={false}
        visible={isModalUserNotFoundVisible}
        title={t('update_user')}
      >
        <p className="mb-0">{t('user_not_found')}</p>
      </ModalInfo>

      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => {
          setIsShowModalSendPassword(false);
        }}
        maskClosable={false}
        closable={false}
        visible={isShowModalSendPassword}
        title={t('resend_password_failed_title')}
      >
        <p className="mb-0 text-pre-line">{t('resend_password_failed_sub_1')}</p>
        <p className="mb-0">{t('resend_password_failed_sub_2')}</p>
      </ModalInfo>

      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => {
          setIsShowModalSendCode(false);
        }}
        maskClosable={false}
        closable={false}
        visible={isShowModalSendCode}
        title={t('resend_code_failed_title')}
      >
        <p className="mb-0 text-pre-line">{t('resend_code_failed_sub_1')}</p>
        <p className="mb-0">{t('resend_code_failed_sub_2')}</p>
      </ModalInfo>

      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => {
          setIsShowModalDeleteYourSelf(false);
        }}
        visible={isShowModalDeleteYourSelf}
        title={t('delete_user_modal')}
        closable={false}
      >
        <p className="mb-0">{t('warning_delete_yourself')}</p>
      </ModalInfo>

      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => {
          setIsShowModalDeleteAdmin(false);
        }}
        visible={isShowModalDeleteAdmin}
        title={t('delete_user_modal')}
        closable={false}
      >
        <p className="mb-0">{t('warning_delete_admin')}</p>
        <p className="mb-0">{t('warning_delete_admin_sub')}</p>
      </ModalInfo>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGetUserDetail: (payload: Payload) => dispatch(getUserDetail(payload)),
  dispatchGetDepartments: (payload: Payload) => dispatch(getDepartmentsForEditUser(payload)),
  dispatchCreateUser: (payload: Payload) => dispatch(createUser(payload)),
  dispatchUpdateUser: (payload: Payload) => dispatch(updateUser(payload)),
  dispatchDeleteUser: (payload: Payload) => dispatch(deleteUser(payload)),
  dispatchResendPassword: (payload: Payload) => dispatch(resendPassword(payload)),
  dispatchResetPassword: (payload: Payload) => dispatch(resetPassword(payload)),
});

const mapStateToProps = (state: any) => {
  const { isLoading, isSubmitting, userDetail, isDeleting, isResending, isResetting } = state.userManagementReducer;
  const { departmentsForEditUser } = state.departmentReducer;
  const { user } = state.authReducer;

  return { isLoading, isSubmitting, userDetail, departmentsForEditUser, user, isDeleting, isResending, isResetting };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(EditUserOrganization);
