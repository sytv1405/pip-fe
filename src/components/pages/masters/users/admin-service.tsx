import { Button, Card, Row, Table, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { isEmpty } from 'lodash';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { Payload } from '@/types';
import { useTranslation } from 'i18next-config';
import { clearDepartments, createUser, getUsers, searchDepartments } from '@/redux/actions';
import { paths } from '@/shared/paths';
import { Field, Form, Label } from '@/components/form';
import { mapOptions, translateOptions } from '@/utils/selects';
import { USER_ROLE_SERVICE } from '@/shared/constants/user';
import { getOrganizations } from '@/redux/actions/organizationActions';
import { stringSorter } from '@/utils/sortUtils';
import { ModalInfo } from '@/components/modal';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { RootState } from '@/redux/rootReducer';
import { SectionTitle } from '@/components/Typography';
import { ArrowMarkIcon, EditIcon, ListIcon } from '@/assets/images';
import { getTableTitleWithSort } from '@/shared/table';
import { Spacer } from '@/components/Spacer';

import { Search } from './modules/SearchAdminService';
import styles from './styles.module.scss';

const UserManagementService = ({
  dispatchGetUserManagement,
  users,
  isLoading,
  meta,
  user,
  organizations,
  isSubmitting,
  departments,
  searchState,
  dispatchCreateUser,
  dispatchGetOrganizations,
  dispatchGetDepartments,
  dispatchClearDepartments,
}: PropsFromRedux) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [t] = useTranslation(['user_management', 'common']);
  const [isModalComplete, setIsModalComplete] = useState(false);
  const [isModalEmailDuplicatedErrorVisible, setIsModalEmailDuplicatedErrorVisible] = useState(false);

  useEffect(() => {
    dispatchGetUserManagement({
      params: {},
    });
  }, [dispatchGetUserManagement]);

  useEffect(() => {
    dispatchGetOrganizations({ params: {} });
    dispatchClearDepartments();
  }, [dispatchClearDepartments, dispatchGetOrganizations]);

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
        organizationId: yup.string().required(t('common:placeholder_select', { field: t('organization_label') })),
        department: yup.string().max(50, t('common:message_max_length', { max: 50 })),
        userRole: yup.string().required(t('common:placeholder_select', { field: t('author_label') })),
      })
    ),
  });

  const handleSubmit = useCallback(
    (data: any) => {
      const payload = { ...data, department: { name: data.department } };
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
    [dispatchCreateUser, dispatchGetUserManagement, form]
  );

  const organizationOptions = useMemo(() => mapOptions(organizations, { labelKey: 'name', valueKey: 'id' }), [organizations]);

  const onSelectOrganization = useCallback(
    values => {
      dispatchGetDepartments({ params: { organizationIds: [values] } });
    },
    [dispatchGetDepartments]
  );

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
        title: value => getTableTitleWithSort(value, 'organizationName', t('organization_label')),
        dataIndex: 'organizationName',
        key: 'organizationName',
        width: '20%',
        className: 'text-wrap',
        sorter: (record1, record2) => stringSorter(record1?.organization?.name, record2?.organization?.name),
        render: (text: string, record: any) => (
          <div>
            {record?.organization?.name}
            {text}
          </div>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'departmentName', t('apply_label')),
        dataIndex: `departmentName`,
        className: 'text-wrap',
        width: '20%',
        key: 'departmentName',
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
        className: 'text-wrap',
        width: '20%',
        dataIndex: 'userRole',
        key: 'userRole',
        sorter: (record1, record2) => stringSorter(record1?.userRole, record2?.userRole),
        render: (text: string, record: any) =>
          t(`common:${USER_ROLE_SERVICE.find(option => option.value === record.userRole)?.label}`, { text }),
      },
    ],
    [t]
  );

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
            {t('organization_label')}
          </Label>
          <Field
            type="select"
            size="large"
            name="organizationId"
            placeholder={t('common:please_select')}
            options={organizationOptions}
            className={classNames(styles['select-field'], 'mb-3')}
          />
          <Label className="font-weight-bold">{t('apply_label')}</Label>
          <Field type="text" name="department" size="large" className={classNames(styles['department-field'], 'mb-3', 'border-input')} />
          <Typography.Paragraph className={classNames(styles['small-text'], 'mb-3')}>{t('confirm_organization')}</Typography.Paragraph>
          <Label className="font-weight-bold" isRequired>
            {t('author_label')}
          </Label>
          <Field
            type="select"
            name="userRole"
            placeholder={t('common:please_select')}
            options={translateOptions(USER_ROLE_SERVICE, t, 'common')}
            className={classNames(styles['select-field'], 'mb-3')}
            size="large"
          />
          <div className="flex-center">
            <Button type="primary" htmlType="submit" size="large" className="font-weight-bold mn-w180p">
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
          <Search
            departments={departments}
            organizations={organizations}
            dispatchGetUserManagement={dispatchGetUserManagement}
            onSelectOrganization={onSelectOrganization}
          />
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
            <Typography.Text>{t('organization_label')}：</Typography.Text>
            <Typography.Text>
              {(searchState?.organizationIds as string[])
                ?.map?.(organizationId => organizations.find(organization => organization.id === +organizationId)?.name)
                .filter(Boolean)
                .join('、') || t('common:all')}
            </Typography.Text>
          </Typography.Paragraph>
          <span className={styles.divider} />
          <Typography.Paragraph className="mb-0">
            <Typography.Text>{t('limit_label')}：</Typography.Text>
            <Typography.Text>
              {(searchState?.roles as string[])
                ?.map?.(role => t(`common:${USER_ROLE_SERVICE.find(option => option.value === role)?.label}`))
                .filter(Boolean)
                .join('、') || t('common:all')}
            </Typography.Text>
          </Typography.Paragraph>
          <span className={styles.divider} />
          <Typography.Paragraph className="mb-0">
            <Typography.Text>{t('account_label')}：</Typography.Text>
            <Typography.Text>{searchState?.keyword || t('common:unspecified')}</Typography.Text>
          </Typography.Paragraph>
        </Row>
        <div className="table-content mt-3">
          <Table
            dataSource={users}
            columns={columns}
            loading={isLoading}
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
          {t('user_name')}：{form.watch('name')}
        </p>
        <p className="mb-0">
          {t('email_label')}：{form.watch('email')}
        </p>
        <p className="mb-0">
          {t('apply_label')}：{form.watch('department')}
        </p>
        <p className="mb-0">
          {t('author_label')}：{t(`common:${USER_ROLE_SERVICE.find(option => option.value === form.watch('userRole'))?.label}`)}
        </p>
      </ModalInfo>
      <ModalInfo
        title={t('register_user')}
        visible={isModalComplete}
        confirmLoading={isSubmitting}
        okText={t('common:button_close')}
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
  dispatchCreateUser: (payload: Payload) => dispatch(createUser(payload)),
  dispatchGetOrganizations: (payload: Payload) => dispatch(getOrganizations(payload)),
  dispatchGetDepartments: (payload: Payload) => dispatch(searchDepartments(payload)),
  dispatchClearDepartments: () => dispatch(clearDepartments()),
});

const mapStateToProps = (state: RootState) => {
  const { isLoading, isSubmitting, users, meta, searchState } = state.userManagementReducer;
  const { user } = state.authReducer;
  const { organizations } = state.organizationReducer;
  const { departments } = state.departmentReducer;

  return { isLoading, isSubmitting, users, user, organizations, departments, meta, searchState };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(UserManagementService);
