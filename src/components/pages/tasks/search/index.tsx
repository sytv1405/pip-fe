import { Button, Card, Checkbox, Col, Collapse, DatePicker, Form, Input, Row, Select, Table, Typography } from 'antd';
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
import { snakeCase, omit, isEmpty } from 'lodash';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import MultiSelect from '@/components/MultiSelect';
import { WithAuth } from '@/components/Roots/WithAuth';
import { Spacer } from '@/components/Spacer';
import { SectionTitle } from '@/components/Typography';
import { Payload, Task } from '@/types';
import { getTasks, setSelectedTasks, updateSearchCollapseState } from '@/redux/actions/taskActions';
import { RootState } from '@/redux/rootReducer';
import LoadingScreen from '@/components/LoadingScreen';
import { convertObjectToOptions, parseBoolean } from '@/utils/convertUtils';
import { searchDepartments } from '@/redux/actions';
import { numberSorter, stringSorter } from '@/utils/sortUtils';
import { paths } from '@/shared/paths';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { extractTaskCode } from '@/utils/TaskUtils';
import { getTaskPeriod } from '@/shared/calendar';
import { getCategorySeparatorOfTable, getTableTitleWithSort } from '@/shared/table';
import {
  CalendarOutlineIcon,
  CircleEmptyIcon,
  XIcon,
  RightOutLinedIcon,
  SearchPlusIcon,
  SwitchIcon,
  DownIcon,
  CollapseUpIcon,
  CollapseDownIcon,
  DoubleArrowIcon,
} from '@/assets/images';
import { getMode, getTaskFilterParams, setTaskFilterParams } from '@/utils/storage';
import { MODES } from '@/shared/mode';
import { isMobile } from '@/utils/breakpointUtils';
import { TaskPeriodType } from '@/shared/enum';

import { inActivateTaskReasons } from '../constants';
import { mappingFormValues, normalizeSearchParams } from '../transformValue';

import styles from './styles.module.scss';

const SearchTask = ({
  tasks,
  departments,
  isLoading,
  isSearchCriteriaOpen,
  dispatchGetTasks,
  dispatchSetSelectedTasks,
  dispatchSearchDepartments,
  dispatchUpdateSearchCollapseState,
}: PropsFromRedux) => {
  const [t] = useTranslation(['task', 'common', 'department_master']);
  const router = useRouter();
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: mappingFormValues(getTaskFilterParams()),
  });
  const mode = getMode();
  const isManagementMode = mode === MODES.MANAGEMENT;

  const [isOpen, setIsOpen] = useState(isSearchCriteriaOpen);
  const [formKey, setFormKey] = useState(Date.now());

  const onSearchHandler = useCallback(
    params => {
      const searchParams = normalizeSearchParams(params);

      dispatchGetTasks({ params: searchParams });
      setTaskFilterParams(searchParams);
    },
    [dispatchGetTasks]
  );

  const onClearSearchHandler = useCallback(() => {
    const searchParams = normalizeSearchParams({});

    dispatchGetTasks({ params: searchParams });
    setTaskFilterParams(searchParams);
    reset(mappingFormValues({}));
    setFormKey(Date.now());
  }, [dispatchGetTasks, reset]);

  useEffect(() => {
    dispatchSetSelectedTasks({ params: { selectedTaskIds: [] } });
    dispatchSearchDepartments({ params: {} });
  }, [dispatchSetSelectedTasks, dispatchSearchDepartments]);

  useEffect(() => {
    dispatchGetTasks({ params: getTaskFilterParams() });
  }, [dispatchGetTasks]);

  useEffect(() => {
    dispatchUpdateSearchCollapseState({ params: { isSearchCriteriaOpen: isOpen } });

    return () => {
      dispatchUpdateSearchCollapseState({ params: { isSearchCriteriaOpen: false } });
    };
  }, [dispatchUpdateSearchCollapseState, isOpen]);

  const columns = useMemo(
    () => [
      {
        title: value => getTableTitleWithSort(value, 'taskCode', `${t('task_no')}.`),
        dataIndex: 'taskCode',
        key: 'taskCode',
        className: 'text-wrap',
        width: '8%',
        sorter: (record1, record2) => {
          const { organizationCode: organizationCode1, taskOrder: taskOrder1 } = extractTaskCode(record1.taskCode);
          const { organizationCode: organizationCode2, taskOrder: taskOrder2 } = extractTaskCode(record2.taskCode);

          return stringSorter(organizationCode1, organizationCode2) || numberSorter(taskOrder1, taskOrder2);
        },
        render: (_, record) => <Typography.Text className={styles['column-task-code']}>{record.taskCode}</Typography.Text>,
      },
      {
        title: value => getTableTitleWithSort(value, 'departmentName', t('department_master:department_name')),
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: '8%',
        sorter: (record1, record2) => stringSorter(record1?.department?.name, record2?.department?.name),
        render: (_: string, record: any) => (
          <Typography.Text title={record?.department?.name} className={classNames(styles['column-department-name'], 'truncate-three-line')}>
            {record?.department?.name}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'majorCategoryName', t('common:business_unit')),
        key: `majorCategoryName`,
        dataIndex: 'majorCategoryName',
        width: '20%',
        sorter: (record1, record2) =>
          stringSorter(
            `${record1?.majorCategory?.name} > ${record1?.middleCategory?.name} > ${record1?.minorCategory?.name}`,
            `${record2?.majorCategory?.name} > ${record2?.middleCategory?.name} > ${record2?.minorCategory?.name}`
          ),
        render: (_: string, record: any) => (
          <Typography.Text className={classNames(styles['column-category'], 'truncate-three-line')}>
            <span className="font-weight-medium">{record?.majorCategory?.name}</span>
            {record?.middleCategory?.name && (
              <>
                {getCategorySeparatorOfTable()}
                {record?.middleCategory?.name}
              </>
            )}
            {record?.minorCategory?.name && (
              <>
                {getCategorySeparatorOfTable()}
                {record?.minorCategory?.name}
              </>
            )}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'title', t('task_name')),
        dataIndex: 'title',
        key: 'title',
        width: '44%',
        sorter: (record1, record2) => stringSorter(record1?.title, record2?.title),
        render: (text: string) => (
          <Typography.Text title={text} className={classNames(styles['column-task-name'], `truncate-three-line font-weight-bold`)}>
            {text}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'deadline', t('deadline')),
        dataIndex: 'deadline',
        key: 'deadline',
        width: '15%',
        sorter: (record1, record2) => stringSorter(getTaskPeriod(record1, t), getTaskPeriod(record2, t)),
        render: (_: string, record: Task) => (
          <Typography.Text className={classNames(styles['column-task-deadline'], 'truncate-three-line')}>
            {getTaskPeriod(record, t)}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'status', t('common:active')),
        dataIndex: 'status',
        key: 'status',
        width: '5%',
        sorter: (record1, record2) => numberSorter(record1?.deletedAt ? 1 : 0, record2?.deletedAt ? 1 : 0),
        render: (_: string, record: any) => <div>{record?.deletedAt ? <XIcon /> : <CircleEmptyIcon />}</div>,
      },
    ],
    [t, isManagementMode]
  );

  const mobileColumns = useMemo(
    () => [
      {
        title: value => getTableTitleWithSort(value, 'title', t('task_name')),
        dataIndex: 'title',
        key: 'title',
        width: '40%',
        sorter: (record1, record2) => stringSorter(record1?.title, record2?.title),
        render: (text: string) => (
          <Typography.Text
            title={text}
            className={classNames(styles['column-task-name'], `truncate-three-line ${!isManagementMode && 'font-weight-bold'}`)}
          >
            {text}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'majorCategoryName', t('common:business_unit')),
        key: `majorCategoryName`,
        dataIndex: 'majorCategoryName',
        width: '20%',
        sorter: (record1, record2) =>
          stringSorter(
            `${record1?.majorCategory?.name} > ${record1?.middleCategory?.name} > ${record1?.minorCategory?.name}`,
            `${record2?.majorCategory?.name} > ${record2?.middleCategory?.name} > ${record2?.minorCategory?.name}`
          ),
        render: (_: string, record: any) => (
          <Typography.Text className={classNames(styles['column-category'], 'truncate-three-line')}>
            <span className="font-weight-medium">{record?.majorCategory?.name}</span>
            {record?.middleCategory?.name && (
              <>
                {getCategorySeparatorOfTable()}
                {record?.middleCategory?.name}
              </>
            )}
            {record?.minorCategory?.name && (
              <>
                {getCategorySeparatorOfTable()}
                {record?.minorCategory?.name}
              </>
            )}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'departmentName', t('department_master:department_name')),
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: '14%',
        sorter: (record1, record2) => stringSorter(record1?.department?.name, record2?.department?.name),
        render: (_: string, record: any) => (
          <Typography.Text title={record?.department?.name} className={classNames(styles['column-department-name'], 'truncate-three-line')}>
            {record?.department?.name}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'deadline', t('deadline')),
        dataIndex: 'deadline',
        key: 'deadline',
        width: '15%',
        sorter: (record1, record2) => stringSorter(getTaskPeriod(record1, t), getTaskPeriod(record2, t)),
        render: (_: string, record: Task) => (
          <Typography.Text className={classNames(styles['column-task-deadline'], 'truncate-three-line')}>
            {getTaskPeriod(record, t)}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'status', t('common:active')),
        dataIndex: 'status',
        key: 'status',
        width: '5%',
        sorter: (record1, record2) => numberSorter(record1?.deletedAt ? 1 : 0, record2?.deletedAt ? 1 : 0),
        render: (_: string, record: any) => <div className="flex-center">{record?.deletedAt ? <XIcon /> : <CircleEmptyIcon />}</div>,
      },
      {
        title: value => getTableTitleWithSort(value, 'taskCode', `${t('task_no')}.`),
        dataIndex: 'taskCode',
        key: 'taskCode',
        className: 'text-wrap',
        width: '6%',
        sorter: (record1, record2) => {
          const { organizationCode: organizationCode1, taskOrder: taskOrder1 } = extractTaskCode(record1.taskCode);
          const { organizationCode: organizationCode2, taskOrder: taskOrder2 } = extractTaskCode(record2.taskCode);

          return stringSorter(organizationCode1, organizationCode2) || numberSorter(taskOrder1, taskOrder2);
        },
        render: (_, record) => <Typography.Text className={styles['column-task-code']}>{record.taskCode}</Typography.Text>,
      },
    ],
    [t, isManagementMode]
  );

  const isEnableSelectTask = useMemo(() => !!tasks?.length, [tasks]);

  const specified = watch('specified');
  const periodTypes = watch('periodTypes');
  const deadline = watch('deadline');
  const actual = watch('actual');
  const isDisablePeriodType = useMemo(() => parseBoolean(actual) && !parseBoolean(deadline), [actual, deadline]);
  const isEnableDeadline = useMemo(() => !isEmpty(specified) || !isEmpty(periodTypes), [specified, periodTypes]);

  useEffect(() => {
    if (isEmpty(specified)) {
      setValue('timeFrom', undefined);
      setValue('timeTo', undefined);
    }
  }, [specified, setValue]);

  useEffect(() => {
    if (isEnableDeadline) {
      setValue('deadline', true);
    }
  }, [isEnableDeadline, setValue]);

  useEffect(() => {
    if (!parseBoolean(deadline)) {
      setValue('periodTypes', []);
      setValue('specified', []);
    }
  }, [deadline, setValue]);

  const isOrganizationDeleted = useIsOrganizationDeleted();

  const limitTimeTo = useCallback((date: moment.Moment, timeFrom: moment.Moment) => {
    return timeFrom ? date.isSameOrBefore(timeFrom) : false;
  }, []);

  const limitTimeFrom = useCallback((date: moment.Moment, timeTo: moment.Moment) => {
    return timeTo ? date.isSameOrAfter(timeTo) : false;
  }, []);

  return (
    <WithAuth title={t('common:page_task_search')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <div className={styles['section-title']}>
        <SectionTitle level={3} icon={<SwitchIcon />}>
          {t('common:search_condition')}
        </SectionTitle>
      </div>
      <Card bordered={false} className={classNames(styles['form-search-task'], 'task-container')}>
        <Form layout="vertical">
          {isManagementMode ? (
            <Row gutter={38}>
              <Col span={6}>
                <Form.Item
                  label={
                    <Typography.Text className={styles['control-item-title']} strong>
                      {t('department_master:department_name')}
                    </Typography.Text>
                  }
                  className="mb-1"
                >
                  <Controller
                    control={control}
                    name="departmentIds"
                    render={({ field }) => (
                      <MultiSelect
                        key={formKey}
                        {...omit(field, ['ref'])}
                        className={styles['department-select']}
                        options={departments.map(item => ({
                          label: item.name,
                          value: item.id,
                        }))}
                        defaultOption={{ label: t('department_master:no_department'), value: null }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  className="basic-type"
                  label={
                    <Typography.Text className={styles['control-item-title']} strong>
                      {t('task_type')}
                    </Typography.Text>
                  }
                >
                  <Controller
                    control={control}
                    name="deadline"
                    render={({ field }) => (
                      <Checkbox checked={field.value} {...field}>
                        {t('task_type_deadline')}
                      </Checkbox>
                    )}
                  />
                  <br />
                  <Controller
                    control={control}
                    name="actual"
                    render={({ field }) => (
                      <Checkbox checked={field.value} {...field}>
                        {t('task_type_actual')}
                      </Checkbox>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <Typography.Text className={styles['control-item-title']} strong>
                      {t('task_duration')}
                    </Typography.Text>
                  }
                  className="mb-px-20"
                >
                  <Controller
                    control={control}
                    name="periodTypes"
                    render={({ field }) => (
                      <Checkbox.Group disabled={isDisablePeriodType} className={styles['period-type-checkbox']} {...field}>
                        <Checkbox value={TaskPeriodType.WEEKLY}>{t('weekly')}</Checkbox>
                        <Checkbox value={TaskPeriodType.MONTHLY}>{t('monthly')}</Checkbox>
                        <Checkbox value={TaskPeriodType.ANNUALLY}>{t('annually')}</Checkbox>
                      </Checkbox.Group>
                    )}
                  />
                  <Row justify="start" align="middle" gutter={8} className="mt-2">
                    <Col>
                      <Controller
                        control={control}
                        name="specified"
                        render={({ field }) => (
                          <Checkbox.Group disabled={isDisablePeriodType} className={styles['period-type-checkbox']} {...field}>
                            <Checkbox value={TaskPeriodType.SPECIFIED}>{t('common:specified')}</Checkbox>
                          </Checkbox.Group>
                        )}
                      />
                    </Col>
                    <Col flex="1 1 0%" xs={24} className={styles['col-datepicker']}>
                      <Row justify="start" align="middle" gutter={10}>
                        <Col span={11}>
                          <Controller
                            control={control}
                            name="timeFrom"
                            render={({ field }) => (
                              <DatePicker
                                placeholder=""
                                className={styles['ssc-datepicker']}
                                suffixIcon={<CalendarOutlineIcon />}
                                {...field}
                                disabled={isEmpty(specified)}
                                disabledDate={date => limitTimeFrom(date, watch('timeTo'))}
                              />
                            )}
                          />
                        </Col>
                        <Col span={2} className="text-center">
                          〜
                        </Col>
                        <Col span={11}>
                          <Controller
                            control={control}
                            name="timeTo"
                            render={({ field }) => (
                              <DatePicker
                                placeholder=""
                                className={styles['ssc-datepicker']}
                                suffixIcon={<CalendarOutlineIcon />}
                                {...field}
                                disabled={isEmpty(specified)}
                                disabledDate={date => limitTimeTo(date, watch('timeFrom'))}
                              />
                            )}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form.Item>
                <Form.Item
                  label={
                    <Typography.Text className={styles['control-item-title']} strong>
                      {t('search_for_disabled_tasks')}
                    </Typography.Text>
                  }
                >
                  <Controller
                    control={control}
                    name="reasons"
                    render={({ field }) => (
                      <Select mode="multiple" showArrow {...field} suffixIcon={<DownIcon />} placeholder={t('common:all')}>
                        <Select.Option value="all">{t('common:all')}</Select.Option>
                        {convertObjectToOptions(inActivateTaskReasons, {
                          transformKey: key => t(snakeCase(key)),
                        }).map(option => (
                          <Select.Option value={option.value}>{option.label}</Select.Option>
                        ))}
                      </Select>
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <Collapse
              ghost
              className={classNames(styles['search-collapse'], 'ant-collapse--comment')}
              expandIcon={props => (props.isActive ? <CollapseUpIcon /> : <CollapseDownIcon />)}
              accordion
              defaultActiveKey={isOpen && 1}
              onChange={() => setIsOpen(!isOpen)}
            >
              <Collapse.Panel key={1} header={isOpen ? t('common:button_close') : t('common:add_search_criteria')}>
                <Row gutter={18}>
                  <Col xs={24} sm={24} md={7} lg={7}>
                    <Form.Item
                      label={
                        <Typography.Text className={styles['control-item-title']} strong>
                          {t('department_master:department_name')}
                        </Typography.Text>
                      }
                      className="mb-1"
                    >
                      <Controller
                        control={control}
                        name="departmentIds"
                        render={({ field }) => (
                          <MultiSelect
                            key={formKey}
                            {...omit(field, ['ref'])}
                            options={departments.map(item => ({
                              label: item.name,
                              value: item.id,
                            }))}
                            defaultOption={{ label: t('department_master:no_department'), value: null }}
                          />
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={7} lg={5}>
                    <Form.Item
                      className="basic-type"
                      label={
                        <Typography.Text className={styles['control-item-title']} strong>
                          {t('task_type')}
                        </Typography.Text>
                      }
                    >
                      <Controller
                        control={control}
                        name="deadline"
                        render={({ field }) => (
                          <Checkbox checked={field.value} {...field}>
                            {t('task_type_deadline')}
                          </Checkbox>
                        )}
                      />
                      <br />
                      <Controller
                        control={control}
                        name="actual"
                        render={({ field }) => (
                          <Checkbox checked={field.value} {...field}>
                            {t('task_type_actual')}
                          </Checkbox>
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={10} lg={12}>
                    <Form.Item
                      label={
                        <Typography.Text className={styles['control-item-title']} strong>
                          {t('task_duration')}
                        </Typography.Text>
                      }
                    >
                      <Controller
                        control={control}
                        name="periodTypes"
                        render={({ field }) => (
                          <Checkbox.Group disabled={isDisablePeriodType} className={styles['period-type-checkbox']} {...field}>
                            <Checkbox value={TaskPeriodType.WEEKLY}>{t('weekly')}</Checkbox>
                            <Checkbox value={TaskPeriodType.MONTHLY}>{t('monthly')}</Checkbox>
                            <Checkbox value={TaskPeriodType.ANNUALLY}>{t('annually')}</Checkbox>
                          </Checkbox.Group>
                        )}
                      />
                      <Row justify="start" align="middle" gutter={8} className="mt-2">
                        <Col>
                          <Controller
                            control={control}
                            name="specified"
                            render={({ field }) => (
                              <Checkbox.Group disabled={isDisablePeriodType} className={styles['period-type-checkbox']} {...field}>
                                <Checkbox value={TaskPeriodType.SPECIFIED}>{t('common:specified')}</Checkbox>
                              </Checkbox.Group>
                            )}
                          />
                        </Col>
                        <Col flex="1 1 0%" xs={24} className={styles['col-datepicker']}>
                          <Row justify="start" align="middle" gutter={0}>
                            <Col span={11}>
                              <Controller
                                control={control}
                                name="timeFrom"
                                render={({ field }) => (
                                  <DatePicker
                                    placeholder=""
                                    className={styles['ssc-datepicker']}
                                    suffixIcon={<CalendarOutlineIcon />}
                                    {...field}
                                    disabled={isEmpty(specified)}
                                    disabledDate={date => limitTimeFrom(date, watch('timeTo'))}
                                  />
                                )}
                              />
                            </Col>
                            <Col span={2} className="text-center">
                              〜
                            </Col>
                            <Col span={11}>
                              <Controller
                                control={control}
                                name="timeTo"
                                render={({ field }) => (
                                  <DatePicker
                                    placeholder=""
                                    className={styles['ssc-datepicker']}
                                    suffixIcon={<CalendarOutlineIcon />}
                                    {...field}
                                    disabled={isEmpty(specified)}
                                    disabledDate={date => limitTimeTo(date, watch('timeFrom'))}
                                  />
                                )}
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Form.Item>
                    <Form.Item
                      className="mb-0"
                      label={
                        <Typography.Text className={styles['control-item-title']} strong>
                          {t('search_for_disabled_tasks')}
                        </Typography.Text>
                      }
                    >
                      <Controller
                        control={control}
                        name="reasons"
                        render={({ field }) => (
                          <Select mode="multiple" showArrow {...field} suffixIcon={<DownIcon />} placeholder={t('common:all')}>
                            <Select.Option value="all">{t('common:all')}</Select.Option>
                            {convertObjectToOptions(inActivateTaskReasons, {
                              transformKey: key => t(snakeCase(key)),
                            }).map(option => (
                              <Select.Option value={option.value}>{option.label}</Select.Option>
                            ))}
                          </Select>
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Collapse.Panel>
            </Collapse>
          )}
          <Spacer height={isOpen ? '20px' : '10px'} />

          <Form.Item
            name="keyword"
            className={styles['form-item-keyword']}
            label={
              <Typography.Text className={styles['control-item-title']} strong>
                {t('common:keyword')}
              </Typography.Text>
            }
          >
            <Controller control={control} name="keyword" render={({ field }) => <Input allowClear {...field} />} />
          </Form.Item>

          <Row justify="center">
            <Form.Item className="mb-0">
              <Button className="mn-w180p font-weight-bold" onClick={onClearSearchHandler} size="large">
                {t('common:button_clear_search')}
              </Button>
            </Form.Item>
            <Spacer width="12px" />
            <Form.Item className="mb-0">
              <Button
                className="mn-w180p font-weight-bold"
                onClick={handleSubmit(onSearchHandler)}
                size="large"
                type="primary"
                htmlType="submit"
              >
                {t('common:button_search')}
              </Button>
            </Form.Item>
          </Row>
        </Form>
      </Card>
      <Spacer height="40px" />
      <div className={classNames(styles['section-title'], 'd-flex align-items-center')}>
        <SectionTitle icon={<SearchPlusIcon />} level={3}>
          {t('common:search_result')}
        </SectionTitle>
        <Typography.Text className={classNames(styles['number-of-tasks'], 'mb-3 ml-2')}>
          {tasks?.length ?? 0}
          {t('common:case')}
        </Typography.Text>
      </div>
      <Card className="task-container border-none">
        {isManagementMode && (
          <Row className="mb-3" justify="space-between" align="bottom">
            {!isOrganizationDeleted && (
              <Button
                className={styles['bulk-action-btn']}
                icon={<RightOutLinedIcon />}
                disabled={!isEnableSelectTask}
                onClick={isEnableSelectTask ? () => router.push({ pathname: paths.tasks.selection }) : undefined}
              >
                {t('button_select_task')}
              </Button>
            )}
          </Row>
        )}
        <div>
          {tasks?.length ? (
            <div className={styles['task-search-table']}>
              {isMobile() && (
                <div className="d-flex align-items-center text-minimum mb-px-10">
                  <DoubleArrowIcon className="mr-2" /> {t('common:scroll_sideway')}
                </div>
              )}
              <Table
                columns={isMobile() ? mobileColumns : columns}
                rowKey="id"
                dataSource={tasks}
                className="table-header-center nowrap ssc-table ssc-table-brown custom-sort-icon cursor-pointer ssc-table-tasks"
                pagination={false}
                onRow={record => ({
                  onClick: () => {
                    router.push({ pathname: paths.tasks.detail, query: { taskCode: record.taskCode, backUrl: paths.tasks.search } });
                  },
                })}
              />
            </div>
          ) : (
            <Row className="nodata-indicator">
              <Typography.Text className="nodata-indicator__text">{t('search_no_data')}</Typography.Text>
            </Row>
          )}
        </div>
        {isManagementMode && (
          <Row className="mt-3" justify="space-between" align="bottom">
            {!isOrganizationDeleted && (
              <Button
                className={styles['bulk-action-btn']}
                icon={<RightOutLinedIcon />}
                disabled={!isEnableSelectTask}
                onClick={isEnableSelectTask ? () => router.push({ pathname: paths.tasks.selection }) : undefined}
              >
                {t('button_select_task')}
              </Button>
            )}
          </Row>
        )}
      </Card>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGetTasks: (payload: Payload) => dispatch(getTasks(payload)),
  dispatchSetSelectedTasks: (payload: Payload) => dispatch(setSelectedTasks(payload)),
  dispatchSearchDepartments: (payload: Payload) => dispatch(searchDepartments(payload)),
  dispatchUpdateSearchCollapseState: (payload: Payload) => dispatch(updateSearchCollapseState(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { tasks, meta, isLoading: taskLoading, isSearchCriteriaOpen } = state.taskReducer;
  const { departments, isLoading: departmentLoading } = state.departmentReducer;
  return { tasks, meta, isLoading: taskLoading || departmentLoading, departments, isSearchCriteriaOpen };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SearchTask);
