import { useEffect, useMemo, useState } from 'react';
import { Typography, Card, Table } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import Link from 'next/link';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { createOrganization, getOrganizations } from '@/redux/actions/organizationActions';
import { Payload } from '@/types';
import { formatDateTime } from '@/utils/dateTimeUtils';
import { paths } from '@/shared/paths';
import { dateTimeSorter, numberSorter, stringSorter } from '@/utils/sortUtils';
import { SectionTitle } from '@/components/Typography';
import { EditIcon, ListIcon } from '@/assets/images';
import { DATE_TIME_FORMAT_JP } from '@/shared/constants';
import { getTableTitleWithSort } from '@/shared/table';
import { Spacer } from '@/components/Spacer';

import OrganizationCreate from './modules/OrganizationCreate';
import OrganizationSearch from './modules/OrganizationSearch';
import styles from './modules/styles.module.scss';

const Organizations = ({
  isLoading,
  isCreateLoading,
  organizations,
  dispatchGetOrganizations,
  dispatchCreateOrganization,
}: PropsFromRedux) => {
  const [t] = useTranslation(['user_organizations']);

  const [isSearch, setIsSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const columns = useMemo(
    () => [
      {
        title: value => getTableTitleWithSort(value, 'name', t('organization_name')),
        dataIndex: 'name',
        key: 'name',
        sorter: (record1, record2) => stringSorter(record1.name, record2.name),
        render: (text, organization) => (
          <>
            <Link href={{ pathname: paths.master.userOrganizations.edit, query: { id: organization.id } }}>
              <a className={classNames('text-underline', styles['tbody-field'])}>
                {text}
                <EditIcon className={styles['edit-icon']} />
              </a>
            </Link>
          </>
        ),
        className: 'text-wrap',
      },
      {
        title: value => getTableTitleWithSort(value, 'totalUsers', t('number_of_registered_user')),
        dataIndex: 'totalUsers',
        key: 'totalUsers',
        render: totalUsers => `${totalUsers}${t('common:people')}`,
        sorter: (record1, record2) => numberSorter(record1.totalUsers, record2.totalUsers),
        width: 150,
      },
      {
        title: value => getTableTitleWithSort(value, 'createdAt', t('common:registered_date')),
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: (record1, record2) => dateTimeSorter(record1.createAt, record2.createdAt),
        render: createAt => formatDateTime(createAt, DATE_TIME_FORMAT_JP),
        width: 300,
      },
    ],
    [t]
  );

  const handleSearch = params => {
    setIsSearch(true);
    setSearchKeyword(params?.keyword);
    dispatchGetOrganizations({
      params,
    });
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    setSearchKeyword('');
    dispatchGetOrganizations();
  };

  useEffect(() => {
    dispatchGetOrganizations();
  }, [dispatchGetOrganizations]);

  return (
    <WithAuth title={t('title')} isContentFullWidth>
      <OrganizationCreate
        isCreateLoading={isCreateLoading}
        dispatchGetOrganizations={dispatchGetOrganizations}
        dispatchCreateOrganization={dispatchCreateOrganization}
      />
      <Spacer height="40px" />
      <SectionTitle icon={<ListIcon className="mb-n1" />}>{t('list_user_title')}</SectionTitle>
      <Card className="border-none">
        <OrganizationSearch onSearch={handleSearch} onClear={handleClearSearch} />
        <div className="search-result mt-4">
          <div className="top-table flex-center-between">
            <div className="top-desc">
              <Typography.Title level={5} className={classNames(styles['total-title'])}>
                {t('search_results')}
                <Typography.Text className={classNames(styles.total, 'ml-2')}>
                  {organizations?.length} {t('common:case')}
                </Typography.Text>
              </Typography.Title>
              <Typography.Text className={classNames(styles['search-keyword'])}>
                {t('organization_name')}： {searchKeyword}
              </Typography.Text>
            </div>
          </div>
          <div className="table-content mt-3">
            <Table
              dataSource={organizations}
              columns={columns}
              className="ssc-table ssc-table-white custom-sort-icon cursor-pointer"
              loading={isLoading}
              pagination={false}
              locale={
                isSearch && {
                  emptyText: <span className="text-pre-line">{t('common:table_search_empty_message')}</span>,
                }
              }
            />
          </div>
        </div>
      </Card>
    </WithAuth>
  );
};

const mapStateToProps = state => {
  const { organizations, isLoading, isCreateLoading } = state.organizationReducer;
  return { organizations, isLoading, isCreateLoading };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetOrganizations: (payload?: Payload) => dispatch(getOrganizations(payload)),
  dispatchCreateOrganization: (payload: Payload) => dispatch(createOrganization(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Organizations);
