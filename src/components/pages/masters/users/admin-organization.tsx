import { Button, Card, Row, Table, Typography } from 'antd';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { connect, ConnectedProps } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { isEmpty } from 'lodash';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { Payload } from '@/types';
import { createUser, getDepartments, getUsers } from '@/redux/actions';
import { paths } from '@/shared/paths';
import { Field, Form, Label } from '@/components/form';
import { USER_ROLE_ORGANIZATION, USER_ROLE_SERVICE } from '@/shared/constants/user';
import { mapOptions, translateOptions } from '@/utils/selects';
import { stringSorter } from '@/utils/sortUtils';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { ModalInfo } from '@/components/modal';
import { RootState } from '@/redux/rootReducer';
import { SectionTitle } from '@/components/Typography';
import { ArrowMarkIcon, EditIcon, ListIcon } from '@/assets/images';
import { getTableTitleWithSort } from '@/shared/table';
import { Spacer } from '@/components/Spacer';

import { Search } from './modules/SearchAdminOrganization';
import styles from './styles.module.scss';

const UserManagementOrganization = ({
  dispatchGetUserManagement,
  users,
  user,
  meta,
  isSubmitting,
  departments,
  searchState,
  dispatchGetDepartments,
  dispatchCreateUser,
}: PropsFromRedux) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalComplete, setIsModalComplete] = useState(false);
  const [isModalEmailDuplicatedErrorVisible, setIsModalEmailDuplicatedErrorVisible] = useState(false);
  const router = useRouter();

  const [t] = useTranslation(['user_management', 'common']);

  const columns = useMemo(
    () => [
      {
        title: value => getTableTitleWithSort(value, 'name', t('account_label')),
        dataIndex: 'name',
        key: 'name',
        width: '40%',
        className: 'text-wrap',
        sorter: (record1, record2) => stringSorter(record1?.name, record2?.name),
        render: (text: string, record: any) => (
          <Link href={{ pathname: paths.master.users.edit, query: { id: record.id } }}>
            <a className={classNames(styles['user-link'], 'link-underline')}>
              {text}
              <EditIcon className={styles['table-icon-edit']} />
            </a>
          </Link>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'departmentName', t('apply_label')),
        dataIndex: `departmentName`,
        key: 'departmentName',
        width: '30%',
        className: 'text-wrap',
        sorter: (record1, record2) => stringSorter(record1?.department?.name, record2.department?.name),
        render: (text: string, record: any) => (
          <div>
            {record?.department?.name}
            {text}
          </div>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'userRole', t('author_label')),
        dataIndex: 'userRole',
        width: '30%',
        className: 'text-wrap',
        key: 'userRole',
        sorter: (record1, record2) => stringSorter(record1?.userRole, record2?.userRole),
        render: (text: string, record: any) =>
          t(`common:${USER_ROLE_SERVICE.find(option => option.value === record.userRole)?.label}`, { text }),
      },
    ],
    [t]
  );

  useEffect(() => {
    dispatchGetUserManagement({
      params: {},
    });
  }, [dispatchGetUserManagement, router]);

  useEffect(() => {
    dispatchGetDepartments();
  }, [dispatchGetDepartments]);

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
        department: yup.string().required(t('common:placeholder_select', { field: t('department') })),
        userRole: yup.string().required(t('common:placeholder_select', { field: t('author_label') })),
      })
    ),
  });

  const handleSubmit = useCallback(
    (data: any) => {
      const payload = { ...data, department: { name: data.department }, organizationId: user.organizationId };
      dispatchCreateUser({
        params: payload,
        callback: () => {
          setIsModalVisible(false);
          setIsModalComplete(true);
          form.reset();
          dispatchGetUserManagement({ params: {} });
        },
        errorCallback: error => {
          if (ErrorCodes.EMAIL_DUPLICATED === error.errorCode) {
            setIsModalEmailDuplicatedErrorVisible(true);
            setIsModalVisible(false);
          }
        },
      });
    },
    [dispatchCreateUser, form, user.organizationId, dispatchGetUserManagement]
  );
  const departmentOptions = useMemo(() => mapOptions(departments, { labelKey: 'name', valueKey: 'name' }), [departments]);

  return (
    <WithAuth title={t('page_title')} isContentFullWidth>
      <div className={styles['org-info']}>
        <span className="mr-2">
          {user?.organization?.name}
          {t('register_total')}
        </span>
        <span>
          {meta?.totalUserOfOrg}
          {t('common:people')}
        </span>
      </div>
      <SectionTitle icon={<ArrowMarkIcon />}>{t('register_new')}</SectionTitle>
      <Card bordered={false}>
        <Typography.Paragraph className={classNames(styles['small-text'], 'mb-0')}>{t('register_sub_1')}</Typography.Paragraph>
        <Typography.Paragraph className={styles['small-text']}> {t('register_sub_2')}</Typography.Paragraph>
        <Form form={form} onSubmit={() => setIsModalVisible(true)}>
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
            name="department"
            placeholder={t('common:please_select')}
            options={departmentOptions}
            className={classNames(styles['select-field'], 'mb-3')}
            size="large"
          />
          <Label className="font-weight-bold" isRequired>
            {t('author_label')}
          </Label>
          <Field
            type="select"
            name="userRole"
            placeholder={t('common:please_select')}
            options={translateOptions(USER_ROLE_ORGANIZATION, t, 'common')}
            className={classNames(styles['select-field'], 'mb-3')}
            size="large"
          />
          <div className="flex-center">
            <Button type="primary" htmlType="submit" className="mn-w150p font-weight-bold mn-w180p" size="large">
              {t('common:button_register')}
            </Button>
          </div>
        </Form>
      </Card>

      <Spacer height="40px" />
      <SectionTitle icon={<ListIcon />}>{t('user_list')}</SectionTitle>
      <Card bordered={false}>
        <div className={styles['section-search']}>
          <h3 className={styles['sub-title']}> {t('user_collapse')}</h3>
          <Search departments={departments} dispatchGetUserManagement={dispatchGetUserManagement} />
        </div>
        <h3 className={styles['sub-title']}>
          <span>{t('search_result')}</span>
          <span className={styles['sub-title-meta']}>
            {users?.length}
            {t('common:case')}
          </span>
        </h3>
        <Row align="middle">
          <Typography.Paragraph className="mb-0">
            <Typography.Text>{t('apply_label')}：</Typography.Text>
            <Typography.Text>
              {(searchState?.departmentIds as string[])
                ?.map?.(departmentId => departments.find(department => department.id === +departmentId)?.name)
                .filter(Boolean)
                .join('、') || t('common:all')}
            </Typography.Text>
          </Typography.Paragraph>
          <span className={styles.divider} />
          <Typography.Paragraph className="mb-0">
            <Typography.Text> {t('author_label')}：</Typography.Text>
            <Typography.Text>
              {(searchState?.roles as string[])
                ?.map?.(role => t(`common:${USER_ROLE_ORGANIZATION.find(option => option.value === role)?.label}`))
                .filter(Boolean)
                .join('、') || t('common:all')}
            </Typography.Text>
          </Typography.Paragraph>
          <span className={styles.divider} />
          <Typography.Paragraph className="mb-0">
            <Typography.Text> {t('account_label')}：</Typography.Text>
            <Typography.Text>{searchState?.keyword || t('common:unspecified')}</Typography.Text>
          </Typography.Paragraph>
        </Row>
        <div className="table-content mt-3">
          <Table
            dataSource={users}
            columns={columns}
            pagination={false}
            className={classNames(styles.table, 'ssc-table ssc-table-white custom-sort-icon cursor-pointer')}
            locale={
              !isEmpty(searchState) && {
                emptyText: <span className="text-pre-line">{t('common:table_search_empty_message')}</span>,
              }
            }
          />
        </div>
      </Card>

      <ModalInfo
        title={t('register_user')}
        okText={t('register_label')}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => handleSubmit(form.getValues())}
        confirmLoading={isSubmitting}
      >
        <p className="mb-3"> {t('register_sub_modal')}</p>
        <p className="mb-0">
          {t('user_name')} ： {form.watch('name')}
        </p>
        <p className="mb-0">
          {t('email_label')} ： {form.watch('email')}
        </p>
        <p className="mb-0">
          {t('apply_label')} ：{form.watch('department')}
        </p>
        <p className="mb-0">
          {t('author_label')}：{t(`common:${USER_ROLE_SERVICE.find(option => option.value === form.watch('userRole'))?.label}`)}
        </p>
      </ModalInfo>
      <ModalInfo
        title={t('register_user')}
        visible={isModalComplete}
        okText={t('common:button_close')}
        confirmLoading={isSubmitting}
        onOk={() => setIsModalComplete(false)}
        onCancel={() => setIsModalComplete(false)}
      >
        <p className="mb-3"> {t('register_complete')}</p>
        <p className="mb-3"> {t('register_complete_sub')}</p>
      </ModalInfo>
      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => setIsModalEmailDuplicatedErrorVisible(false)}
        onCancel={() => setIsModalEmailDuplicatedErrorVisible(false)}
        visible={isModalEmailDuplicatedErrorVisible}
        title={t('register_new')}
      >
        <p className="mb-0">{t('email_duplicated_error')}</p>
      </ModalInfo>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGetUserManagement: (payload: Payload) => dispatch(getUsers(payload)),
  dispatchGetDepartments: () => dispatch(getDepartments()),
  dispatchCreateUser: (payload: Payload) => dispatch(createUser(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { isLoading, isSubmitting, users, meta, searchState } = state.userManagementReducer;
  const { departments } = state.departmentReducer;
  const { user } = state.authReducer;

  return { isLoading, isSubmitting, users, user, departments, meta, searchState };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(UserManagementOrganization);
