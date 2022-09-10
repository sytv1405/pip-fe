import { Button, Card, Col, Row, Typography, Spin } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { isEmpty } from 'lodash';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { RootState } from '@/redux/rootReducer';
import { getDepartmentsForSearchUnit } from '@/redux/actions';
import SingleSelect from '@/components/SingleSelect';
import { Form } from '@/components/form';
import { SectionTitle } from '@/components/Typography';
import { Spacer } from '@/components/Spacer';
import {
  getLargeBusinessUnitsForSearch,
  cleanLargeBusinessUnitsForSearch,
  getMediumBusinessUnitsForSearch,
  cleanMediumBusinessUnitsForSearch,
  getSmallBusinessUnitsForSearch,
  cleanSmallBusinessUnitsForSearch,
  getAllBusinessUnitsForSearch,
} from '@/redux/actions/businessUnitSearchActions';
import { Payload } from '@/types';
import { client } from '@/api/client';
import {
  URL_GET_MEDIUM_BUSINESS_UNIT_ALL_ROLES,
  URL_GET_SMALL_BUSINESS_UNIT_ALL_ROLES,
  URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH,
} from '@/shared/endpoints';
import BusinessSearchTable from '@/components/pages/businessUnit/search/BusinessSearchTable';
import { SwitchIcon, SearchPlusIcon } from '@/assets/images';
import { getBusinessUnitFilterState, setBusinessUnitFilterState } from '@/utils/storage';

import styles from './styles.module.scss';

interface FilterForm {
  departmentId: string;
  majorCategoryId: string;
  middleCategoryId: string;
  minorCategoryId: string;
}

interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

const LARGE_BUSINESS = 'LargeBusiness';
const MEDIUM_BUSINESS = 'MediumBusiness';
const SMALL_BUSINESS = 'SmallBusiness';

function updateTreeData(list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] {
  return list.map(node => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });
}

function updateTreeDataTask(list: DataNode[], key: React.Key, tasks: DataNode[]): DataNode[] {
  return list.map(node => {
    if (node.key === key) {
      return {
        ...node,
        tasks,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeDataTask(node.children, key, tasks),
      };
    }
    return node;
  });
}

const Layout = ({
  departmentsLoading,
  departmentsForSearchUnit,
  largeBusinessUnitsForSearch,
  mediumBusinessUnitsForSearch,
  smallBusinessUnitsForSearch,
  businessUnitLoading,
  dispatchGetDepartmentsForSearchUnit,
  dispatchGetLargeBusinessUnitsForSearch,
  dispatchCleanLargeBusinessUnitsForSearch,
  dispatchGetMediumBusinessUnitsForSearch,
  dispatchCleanMediumBusinessUnitsForSearch,
  dispatchGetSmallBusinessUnitsForSearch,
  dispatchCleanSmallBusinessUnitsForSearch,
  dispatchGetAllBusinessForSearch,
}: PropsFromRedux) => {
  const [t] = useTranslation('business_unit');

  const { searchParams, treeData: cachedTreeData, expandedRowKeys: cachedRowKeys } = getBusinessUnitFilterState();

  // FIXME: add type for data
  const [treeData, setTreeData] = useState<any[]>(cachedTreeData || []);
  const [treeLoading, setTreeLoading] = useState<boolean>(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(cachedRowKeys || []);
  const [businessTasks, setBusinessTasks] = useState<any>({});
  const [formKey, setFormKey] = useState(Date.now());
  const filterForm = useForm({
    defaultValues: {
      departmentId: null,
      majorCategoryId: null,
      middleCategoryId: null,
      minorCategoryId: null,
      ...(searchParams || {}),
    },
  });
  const { watch, reset, getValues } = filterForm;
  const departmentIdWatch = watch('departmentId');
  const majorCategoryIdWatch = watch('majorCategoryId');
  const middleCategoryIdWatch = watch('middleCategoryId');
  const minorCategoryIdWatch = watch('minorCategoryId');

  const getTaskBusiness = async (params, id) => {
    const newBusinessTasks = { ...businessTasks };
    try {
      const tasks = await client.get(URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH, { params });
      newBusinessTasks[`${id}`] = tasks.data;
      setBusinessTasks(newBusinessTasks);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChangeDepartment = departmentId => {
    if (departmentId === departmentIdWatch) {
      return;
    }

    dispatchGetLargeBusinessUnitsForSearch({ params: { departmentIds: [departmentId] } });
    dispatchCleanLargeBusinessUnitsForSearch();
    dispatchCleanMediumBusinessUnitsForSearch();
    dispatchCleanSmallBusinessUnitsForSearch();
    reset({
      departmentId,
      majorCategoryId: '',
      middleCategoryId: '',
      minorCategoryId: '',
    });
  };

  const handleChangeMajorBusiness = majorCategoryId => {
    if (majorCategoryId === majorCategoryIdWatch) {
      return;
    }

    dispatchGetMediumBusinessUnitsForSearch({ params: { majorCategoryIds: [majorCategoryId] } });
    getTaskBusiness({ majorCategoryId }, `major-${majorCategoryId}`);
    dispatchCleanMediumBusinessUnitsForSearch();
    dispatchCleanSmallBusinessUnitsForSearch();
    reset({
      ...getValues(),
      majorCategoryId,
      middleCategoryId: '',
      minorCategoryId: '',
    });
  };

  const handleChangeMiddleBusiness = middleCategoryId => {
    if (middleCategoryId === middleCategoryIdWatch) {
      return;
    }

    dispatchGetSmallBusinessUnitsForSearch({ params: { middleCategoryIds: [middleCategoryId] } });
    getTaskBusiness({ middleCategoryId }, `middle-${middleCategoryId}`);
    dispatchCleanSmallBusinessUnitsForSearch();
    reset({
      ...getValues(),
      middleCategoryId,
      minorCategoryId: '',
    });
  };

  const handleChangeMinorBusiness = minorCategoryId => {
    if (minorCategoryId === minorCategoryIdWatch) {
      return;
    }

    getTaskBusiness({ minorCategoryId }, `minor-${minorCategoryId}`);
    reset({
      ...getValues(),
      minorCategoryId,
    });
  };

  const handleUpdateTreeData = (
    formData,
    {
      largeBusinessUnitsForSearch: largeUnits = [],
      mediumBusinessUnitsForSearch: mediumUnits = [],
      smallBusinessUnitsForSearch: smalUnits = [],
      businessTasks: businessTasksSearch,
    }
  ) => {
    const rowKeys = [];
    const { majorCategoryId, middleCategoryId, minorCategoryId } = formData;
    const data = largeUnits.map(majorCategory => {
      const mediumBusinessUnits = mediumUnits.filter(mediumCategory => +mediumCategory.majorCategoryId === majorCategory.id);
      return {
        major: `${majorCategory.name}`,
        key: `${majorCategory.id}`,
        id: majorCategory.id,
        type: LARGE_BUSINESS,
        tasks: businessTasksSearch[`major-${majorCategory.id}`],
        children: mediumBusinessUnits.map(mediumCategory => {
          const smallBusinessUnits = smalUnits.filter(minorCategory => +minorCategory.middleCategoryId === mediumCategory.id);
          return {
            medium: `${mediumCategory.name}`,
            key: `${majorCategory.id}-${mediumCategory.id}`,
            id: mediumCategory.id,
            type: MEDIUM_BUSINESS,
            tasks: businessTasksSearch[`middle-${mediumCategory.id}`],
            children: smallBusinessUnits.map(minorCategory => ({
              minor: `${minorCategory.name}`,
              key: `${majorCategory.id}-${mediumCategory.id}-${minorCategory.id}`,
              id: minorCategory.id,
              type: SMALL_BUSINESS,
              tasks: businessTasksSearch[`minor-${minorCategory.id}`],
            })),
          };
        }),
      };
    });
    setTreeData(data);

    if (majorCategoryId) {
      rowKeys.push(`${majorCategoryId}`);
    }
    if (middleCategoryId) {
      rowKeys.push(`${majorCategoryId}-${middleCategoryId}`);
    }
    if (middleCategoryId) {
      rowKeys.push(`${majorCategoryId}-${middleCategoryId}-${minorCategoryId}`);
    }
    setExpandedRowKeys(rowKeys);
    setBusinessUnitFilterState({
      ...getBusinessUnitFilterState(),
      searchParams: formData,
      treeData: data,
      expandedRowKeys: rowKeys,
    });
  };

  const selectedDepartment = useMemo(
    () => departmentsForSearchUnit?.find(item => item.id === departmentIdWatch),
    [departmentIdWatch, departmentsForSearchUnit]
  );

  const onFormSubmit = (formData: FilterForm) => {
    handleUpdateTreeData(formData, {
      largeBusinessUnitsForSearch,
      mediumBusinessUnitsForSearch,
      smallBusinessUnitsForSearch,
      businessTasks,
    });
  };

  const onLoadData = async ({ key, children, id, type }: any, expandedKeys) => {
    if (!isEmpty(children)) {
      return;
    }

    setTreeLoading(true);
    try {
      let res;
      let tasks;
      let childType;
      let childTitle;
      switch (type) {
        case LARGE_BUSINESS:
          [res, tasks] = await Promise.all([
            client.get(URL_GET_MEDIUM_BUSINESS_UNIT_ALL_ROLES, { params: { majorCategoryIds: [id] } }),
            client.get(URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH, { params: { majorCategoryId: id } }),
          ]);
          childType = MEDIUM_BUSINESS;
          childTitle = 'medium';
          break;
        case MEDIUM_BUSINESS:
          [res, tasks] = await Promise.all([
            client.get(URL_GET_SMALL_BUSINESS_UNIT_ALL_ROLES, { params: { middleCategoryIds: [id] } }),
            client.get(URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH, { params: { middleCategoryId: id } }),
          ]);
          childType = SMALL_BUSINESS;
          childTitle = 'minor';
          break;
        case SMALL_BUSINESS:
          tasks = await client.get(URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH, { params: { minorCategoryId: id } });
          break;
        default:
          break;
      }
      const { data = [] } = res || {};
      const child = [];

      child.push(
        ...data.map(item => {
          const node = {
            key: `${key}-${item.id}`,
            id: item.id,
            type: childType,
            children: [],
          };
          node[`${childTitle}`] = `${item.name}`;
          return node;
        })
      );

      const newTreeDataWithTask = [...updateTreeDataTask(treeData, key, tasks.data || [])];
      const newTreeData = [...updateTreeData(newTreeDataWithTask, key, child)];
      setTreeData(newTreeData);
      setBusinessUnitFilterState({ ...getBusinessUnitFilterState(), treeData: newTreeData, expandedRowKeys: expandedKeys });
      setTreeLoading(false);
    } catch (error) {
      setTreeLoading(false);
      console.log(error);
    }
  };

  const handleClear = useCallback(() => {
    filterForm.reset({
      departmentId: null,
      majorCategoryId: null,
      middleCategoryId: null,
      minorCategoryId: null,
    });
    setFormKey(Date.now());
    dispatchCleanLargeBusinessUnitsForSearch();
    dispatchCleanMediumBusinessUnitsForSearch();
    dispatchCleanSmallBusinessUnitsForSearch();
  }, [
    dispatchCleanLargeBusinessUnitsForSearch,
    dispatchCleanMediumBusinessUnitsForSearch,
    dispatchCleanSmallBusinessUnitsForSearch,
    filterForm,
  ]);

  useEffect(() => {
    dispatchGetDepartmentsForSearchUnit();
  }, [dispatchGetDepartmentsForSearchUnit]);

  useEffect(() => {
    const { departmentId, majorCategoryId, middleCategoryId, minorCategoryId } = getBusinessUnitFilterState().searchParams || {};

    if (!departmentId) return;

    reset({
      departmentId: +departmentId,
      majorCategoryId: majorCategoryId ? +majorCategoryId : '',
      middleCategoryId: middleCategoryId ? +middleCategoryId : '',
      minorCategoryId: minorCategoryId ? +minorCategoryId : '',
    });

    dispatchCleanLargeBusinessUnitsForSearch();
    dispatchCleanMediumBusinessUnitsForSearch();
    dispatchCleanSmallBusinessUnitsForSearch();

    const callback = response => {
      handleUpdateTreeData(getValues(), response);
      setBusinessTasks(response.businessTasks);
    };

    if (!majorCategoryId) {
      dispatchGetAllBusinessForSearch({
        params: { departmentIds: [departmentId] },
        callback,
      });
      return;
    }

    if (!middleCategoryId) {
      dispatchGetAllBusinessForSearch({
        params: { departmentIds: [departmentId], majorCategoryIds: [majorCategoryId] },
        callback,
      });
      return;
    }

    dispatchGetAllBusinessForSearch({
      params: {
        departmentIds: [departmentId],
        majorCategoryIds: [majorCategoryId],
        middleCategoryIds: [middleCategoryId],
        minorCategoryId,
      },
      callback,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WithAuth title={t('common:page_business_unit_search')} isContentFullWidth>
      <SectionTitle level={3} icon={<SwitchIcon />}>
        {t('title_search_condition')}
      </SectionTitle>
      <Card bordered={false}>
        <Spin spinning={departmentsLoading || businessUnitLoading}>
          <Form form={filterForm} onSubmit={onFormSubmit}>
            <Row gutter={23}>
              <Col span={6}>
                <Typography.Text className={styles['title-modal-item']} strong>
                  {t('business_search__department_in_charge')}
                </Typography.Text>
                <Controller
                  control={filterForm.control}
                  name="departmentId"
                  render={({ field: { onChange, value } }) => (
                    <SingleSelect
                      key={formKey}
                      value={value}
                      options={departmentsForSearchUnit.map(item => ({
                        label: item.name,
                        value: item.id,
                      }))}
                      onChange={departmentId => {
                        onChange(departmentId);
                        handleChangeDepartment(departmentId);
                      }}
                      emptyText={t('business_unit_select_empty')}
                      className={styles['select-box-item']}
                    />
                  )}
                />
                {filterForm.formState?.errors && (
                  <Typography.Text className="color-red">{filterForm.formState.errors?.departmentId?.message}</Typography.Text>
                )}
              </Col>
              <Col span={6}>
                <Typography.Text className={styles['title-modal-item']} strong>
                  {t('common:business_unit')}（{t('common:large')}）
                </Typography.Text>
                <Controller
                  control={filterForm.control}
                  name="majorCategoryId"
                  render={({ field: { onChange, value } }) => {
                    return (
                      <SingleSelect
                        key={formKey}
                        options={largeBusinessUnitsForSearch.map(item => ({
                          label: item.name,
                          value: item.id,
                        }))}
                        onChange={majorCategoryId => {
                          onChange(majorCategoryId);
                          handleChangeMajorBusiness(majorCategoryId);
                        }}
                        value={value}
                        emptyText={t('business_unit_select_empty')}
                        className={styles['select-box-item']}
                      />
                    );
                  }}
                />
              </Col>
              <Col span={6}>
                <Typography.Text className={styles['title-modal-item']} strong>
                  {t('common:business_unit')}（{t('common:medium')}）
                </Typography.Text>
                <Controller
                  control={filterForm.control}
                  name="middleCategoryId"
                  render={({ field: { onChange, value } }) => (
                    <SingleSelect
                      key={formKey}
                      options={mediumBusinessUnitsForSearch.map(item => ({
                        label: item.name,
                        value: item.id,
                      }))}
                      onChange={middleCategoryId => {
                        onChange(middleCategoryId);
                        handleChangeMiddleBusiness(middleCategoryId);
                      }}
                      value={value}
                      emptyText={t('business_unit_select_empty')}
                      className={styles['select-box-item']}
                    />
                  )}
                />
              </Col>
              <Col span={6}>
                <Typography.Text className={styles['title-modal-item']} strong>
                  {t('common:business_unit')}（{t('common:small')}）
                </Typography.Text>
                <Controller
                  control={filterForm.control}
                  name="minorCategoryId"
                  render={({ field: { onChange, value } }) => (
                    <SingleSelect
                      key={formKey}
                      options={smallBusinessUnitsForSearch.map(item => ({
                        label: item.name,
                        value: item.id,
                      }))}
                      onChange={minorCategoryId => {
                        onChange(minorCategoryId);
                        handleChangeMinorBusiness(minorCategoryId);
                      }}
                      value={value}
                      emptyText={t('business_unit_select_empty')}
                      className={styles['select-box-item']}
                    />
                  )}
                />
              </Col>
            </Row>
            <Spacer height="20px" />
            <Row gutter={12} justify="center">
              <Col>
                <Button size="large" type="default" htmlType="button" className="mn-w180p font-weight-bold" onClick={handleClear}>
                  {t('common:button_clear_search')}
                </Button>
              </Col>
              <Col>
                <Button
                  className="mx-auto mn-w180p font-weight-bold"
                  size="large"
                  type="primary"
                  htmlType="submit"
                  disabled={!departmentIdWatch}
                >
                  {t('button_search')}
                </Button>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>

      <Spacer height="40px" />
      <SectionTitle level={3} icon={<SearchPlusIcon />}>
        {t('title_search_result')}
      </SectionTitle>
      <Card bordered={false}>
        {!departmentIdWatch || !treeData?.length ? (
          <div className={styles.search__empty_box}>
            <Typography.Text className="text-pre-line text-center">
              <div>{t('empty_department_note_1')}</div>
              <div>{t('empty_department_note_2')}</div>
            </Typography.Text>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Typography.Title level={5} className={classNames(styles['title-table'], 'font-weight-normal')}>
                {t('department_in_charge')}：{selectedDepartment?.name}
              </Typography.Title>
            </div>
            <BusinessSearchTable
              dataSource={treeData}
              expandedRowKeys={expandedRowKeys}
              onExpand={(expanded, record, expandedKeys) => {
                if (expanded) {
                  onLoadData(record, expandedKeys);
                }
              }}
              loading={treeLoading}
            />
          </>
        )}
      </Card>
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const { departmentsForSearchUnit, isLoading: departmentsLoading } = state.departmentReducer;
  const {
    largeBusinessUnitsForSearch,
    mediumBusinessUnitsForSearch,
    smallBusinessUnitsForSearch,
    isLoading: businessUnitLoading,
  } = state.businessUnitSearchReducer;
  return {
    departmentsForSearchUnit,
    departmentsLoading,
    largeBusinessUnitsForSearch,
    mediumBusinessUnitsForSearch,
    smallBusinessUnitsForSearch,
    businessUnitLoading,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetDepartmentsForSearchUnit: () => dispatch(getDepartmentsForSearchUnit()),
  dispatchGetLargeBusinessUnitsForSearch: (payload: Payload) => dispatch(getLargeBusinessUnitsForSearch(payload)),
  dispatchCleanLargeBusinessUnitsForSearch: () => dispatch(cleanLargeBusinessUnitsForSearch()),
  dispatchGetMediumBusinessUnitsForSearch: (payload: Payload) => dispatch(getMediumBusinessUnitsForSearch(payload)),
  dispatchCleanMediumBusinessUnitsForSearch: () => dispatch(cleanMediumBusinessUnitsForSearch()),
  dispatchGetSmallBusinessUnitsForSearch: (payload: Payload) => dispatch(getSmallBusinessUnitsForSearch(payload)),
  dispatchCleanSmallBusinessUnitsForSearch: () => dispatch(cleanSmallBusinessUnitsForSearch()),
  dispatchGetAllBusinessForSearch: (payload: Payload) => dispatch(getAllBusinessUnitsForSearch(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
