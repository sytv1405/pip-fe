import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Col, Row, Typography, Upload, Card, Button, Input, Table } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { isArray, isEmpty, set, get, transform, range, invert, isNil, isNumber } from 'lodash';
import { Workbook } from 'exceljs';
import FileSaver from 'file-saver';
import classNames from 'classnames';
import moment from 'moment';

import { Trans, useTranslation } from 'i18next-config';
import { convertFullWidthNumberToHalfWidth } from '@/utils/convertUtils';
import { downloadFile, formatDownloadFileName } from '@/utils/fileUtils';
import { WithAuth } from '@/components/Roots/WithAuth';
import { ModalInfo } from '@/components/modal';
import LoadingScreen from '@/components/LoadingScreen';
import { RootState } from '@/redux/rootReducer';
import { searchDepartments, getTasksExportExcel, bulkInsertTasks } from '@/redux/actions';
import { Payload } from '@/types';
import { TASK_XLSX_OPTIONS } from '@/shared/file';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { excelSerialDateToJSDate, formatDateTime } from '@/utils/dateTimeUtils';
import { DATE_FORMAT_JP } from '@/shared/constants';
import { SectionTitle } from '@/components/Typography';
import {
  CopyIcon,
  DownloadFileIcon,
  EllipseIcon,
  ExcelIcon,
  ExportCircleWhiteIcon,
  ExportIcon,
  ExternalIcon,
  FilePlusIcon,
} from '@/assets/images';
import { Spacer } from '@/components/Spacer';

import { taskBasisTypes, weekDays, months, leadTimeTypes } from '../../tasks/constants';

import styles from './styles.module.scss';

const Layout = (props: PropsFromRedux) => {
  const [t] = useTranslation(['task_batch_registration']);

  const isOrganizationDeleted = useIsOrganizationDeleted();

  const [uploadErrors, setUploadErrors] = useState(null);
  const [modalUploadSuccess, setModalUploadSuccess] = useState(null);
  const [isModalGuidelineVisible, setModalGuidelineVisible] = useState(false);
  const [isModalErrorVisible, setModalErrorVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);

  const { departments, departmentsLoading, exportLoading, isBulkInsertLoading } = props;
  const { dispatchSearchDepartments, dispatchGetTasksExportExcel, dispatchBulkInsertTasks } = props;

  const taskBasisTypesJP = useMemo(
    () =>
      transform(
        taskBasisTypes,
        (acc, value, key) => {
          acc[t(`task:task_type_${key}`)] = value;
        },
        {}
      ),
    [t]
  );

  const weekDaysJP = useMemo(
    () =>
      transform(
        weekDays,
        (acc, value, key) => {
          acc[t(`common:${key}`)] = value;
        },
        {}
      ),
    [t]
  );

  const daysJP = useMemo(
    () =>
      transform(
        range(1, 32),
        (acc, value) => {
          acc[t('common:num_of_month', { num: value })] = value;

          if (value === 31) {
            acc[t('common:end_of_month')] = 99;
          }
        },
        {
          [t('common:early_of_month')]: 41,
          [t('common:middle_of_month')]: 42,
          [t('common:late_of_month')]: 43,
          [t('common:begin_of_month')]: 0,
        }
      ),
    [t]
  );

  const monthsJP = useMemo(
    () =>
      transform(
        months,
        (acc, value, key) => {
          acc[t(`common:${key}`)] = value;
        },
        {}
      ),
    [t]
  );

  const nosJP = useMemo(
    () =>
      transform(
        range(1, 5),
        (acc, no) => {
          acc[t(`task:monthly_no_${no}`)] = no;
        },
        {}
      ),
    [t]
  );

  const leadTimeTypesJP = useMemo(
    () =>
      transform(
        leadTimeTypes,
        (acc, value, key) => {
          acc[t(`task:lead_time_${key}`)] = value;
        },
        {}
      ),
    [t]
  );

  const departmentTableColumns = useMemo(
    () => [
      {
        title: t('department_name'),
        dataIndex: 'name',
        className: 'font-weight-bold',
      },
    ],
    [t]
  );

  const departmentTableDataSource = useMemo(
    () => departments.filter(department => !searchKeyword || department.name?.toLowerCase().includes(searchKeyword.toLowerCase())),
    [departments, searchKeyword]
  );

  const showModal = () => {
    setModalGuidelineVisible(true);
  };

  const handleOk = () => {
    setModalGuidelineVisible(false);
  };

  const handleCancel = () => {
    setModalGuidelineVisible(false);
  };

  const handleUpload = async ({ file }) => {
    const columnKeys = [
      'departmentId',
      'majorCategoryId',
      'middleCategoryId',
      'minorCategoryId',
      'taskCode',
      'title',
      'purpose',
      'overview',
      'basisType',
      'taskWeeklyPeriods.0.weekDay',
      'taskMonthlyPeriods.0.specifiedDay',
      'taskMonthlyNoPeriods.0.specifiedNo',
      'taskMonthlyNoPeriods.0.weekDay',
      'taskAnnuallyPeriods.0.specifiedMonth',
      'taskAnnuallyPeriods.0.specifiedDay',
      'taskAnnuallyNoPeriods.0.specifiedMonth',
      'taskAnnuallyNoPeriods.0.specifiedNo',
      'taskAnnuallyNoPeriods.0.weekDay',
      'taskSpecifiedPeriods.0.specifiedOn',
      'leadTimeDay',
      'leadTimeType',
      'explanation',
    ];

    const tasks = [];

    const wb = new Workbook();
    await wb.xlsx.load(file);
    const ws = wb.getWorksheet(1);

    ws.eachRow((row, rowNumber) => {
      if (rowNumber <= 1) return;

      const task = {};

      row.eachCell((cell, colNumber) => {
        const columnKey = columnKeys[colNumber - 1];

        switch (columnKey) {
          case 'majorCategoryId':
          case 'middleCategoryId':
          case 'minorCategoryId':
          case 'departmentId':
          case 'leadTimeDay':
            set(task, columnKey, convertFullWidthNumberToHalfWidth(cell.value as string));
            break;
          case 'taskSpecifiedPeriods.0.specifiedOn':
            if (isNumber(cell.value)) {
              set(task, columnKey, excelSerialDateToJSDate(cell.value).toISOString());
            } else {
              set(task, columnKey, moment(cell.value as string, DATE_FORMAT_JP).toISOString());
            }
            break;
          default:
            set(task, columnKey, cell.value);
        }
      });

      tasks[rowNumber - 2] = task;
    });

    if (isEmpty(tasks)) {
      setUploadErrors(null);
      setModalErrorVisible(true);
      return;
    }

    dispatchBulkInsertTasks({
      params: {
        tasks: range(tasks.length).map(index => tasks[index] || {}),
      },
      callback: response => {
        if (response?.result) {
          setUploadErrors(null);
          setModalUploadSuccess({
            visible: true,
            affectedRows: response?.data?.affectedRows,
          });
        } else {
          setUploadErrors(response.data);
        }
      },
      errorCallback: error => {
        setUploadErrors(error.data);
      },
    });
  };

  const handleDownloadTemplate = () => {
    downloadFile({
      href: '/static/xlsx/タスク.xlsx',
      fileName: formatDownloadFileName(TASK_XLSX_OPTIONS.fileName, { ext: 'xlsx' }),
    });
  };

  const handleExportXlsx = useCallback(
    async data => {
      if (isEmpty(data)) {
        handleDownloadTemplate();
        return;
      }

      const { fileName } = TASK_XLSX_OPTIONS;

      const wb = new Workbook();
      const ws = wb.addWorksheet();

      const maxTaskProcessesLength = Math.max(...data.map(task => task.taskProcesses?.length || 0));
      const maxTaskRegulationsLength = Math.max(...data.map(task => task.taskRegulations?.length || 0));
      const maxTaskNotificationsLength = Math.max(...data.map(task => task.taskNotifications?.length || 0));

      const columns = [
        t('department_id'),
        t('business_unit_large_id'),
        t('business_unit_medium_id'),
        t('business_unit_small_id'),
        t('task_code'),
        t('task_title'),
        t('purpose'),
        t('overview'),
        t('basis_type'),
        t('task_weekly_period'),
        t('task_monthly_period'),
        t('task_monthly_no_period'),
        null, // this cell will be merged below
        t('task_annually_period'),
        null, // this cell will be merged below
        t('task_annually_no_period'),
        null, // this cell will be merged below
        null, // this cell will be merged below
        t('task_specified_period'),
        t('lead_time'),
        null, // this cell will be merged below
      ];

      range(maxTaskProcessesLength).forEach(num => {
        columns.push(`${t('process_content')}${num + 1}`);
        columns.push(`${t('process_outcome')}${num + 1}`);
      });

      columns.push(t('explanation'));

      range(maxTaskRegulationsLength).forEach(num => {
        columns.push(`${t('regulation_id')}${num + 1}`);
        columns.push(`${t('regulation_memo')}${num + 1}`);
      });

      range(maxTaskNotificationsLength).forEach(num => {
        columns.push(`${t('notification_name')}${num + 1}`);
        columns.push(`${t('notification_document_no')}${num + 1}`);
      });

      const columnWidths = [10, 20, 20, 20, 20, 20, 20, 20, 20, 10, 10, 10, 15, 10, 10, 10, 10, 10, 20, 10, 10]
        .concat(range(maxTaskProcessesLength * 2).map(() => 15))
        .concat([20])
        .concat(range(maxTaskRegulationsLength * 2).map(() => 15))
        .concat(range(maxTaskNotificationsLength * 2).map(() => 15));

      ws.columns = columns.map((key, index) => ({
        header: key && t(key),
        key,
        width: columnWidths[index],
      }));

      const rows = ws.addRows(
        data.map(item => {
          const cells = [
            item.department?.id,
            item.majorCategory?.id,
            item.middleCategory?.id,
            item.minorCategory?.id,
            item.taskCode,
            item.title,
            item.purpose,
            item.overview,
            item.basisType && invert(taskBasisTypesJP)[item.basisType],
            isNil(item.taskWeeklyPeriods?.[0]?.weekCode) ? null : invert(weekDaysJP)[item.taskWeeklyPeriods[0].weekCode],
            isNil(item.taskMonthlyPeriods?.[0]?.specifiedDay) ? null : invert(daysJP)[item.taskMonthlyPeriods[0].specifiedDay],
            isNil(item.taskMonthlyNoPeriods?.[0]?.specifiedNo) ? null : invert(nosJP)[item.taskMonthlyNoPeriods[0].specifiedNo],
            isNil(item.taskMonthlyNoPeriods?.[0]?.weekCode) ? null : invert(weekDaysJP)[item.taskMonthlyNoPeriods[0].weekCode],
            item.taskAnnuallyPeriods?.[0]?.specifiedMonth && invert(monthsJP)[item.taskAnnuallyPeriods[0].specifiedMonth],
            isNil(item.taskAnnuallyPeriods?.[0]?.specifiedDay) ? null : invert(daysJP)[item.taskAnnuallyPeriods[0].specifiedDay],
            isNil(item.taskAnnuallyNoPeriods?.[0]?.specifiedMonth) ? null : invert(monthsJP)[item.taskAnnuallyNoPeriods[0].specifiedMonth],
            isNil(item.taskAnnuallyNoPeriods?.[0]?.specifiedNo) ? null : invert(nosJP)[item.taskAnnuallyNoPeriods[0].specifiedNo],
            isNil(item.taskAnnuallyNoPeriods?.[0]?.weekCode) ? null : invert(weekDaysJP)[item.taskAnnuallyNoPeriods[0].weekCode],
            item.taskSpecifiedPeriods?.[0]?.specifiedOn && formatDateTime(item.taskSpecifiedPeriods?.[0]?.specifiedOn, DATE_FORMAT_JP),
            item.leadTimeDay,
            item.leadTimeType && invert(leadTimeTypesJP)[item.leadTimeType],
          ];

          range(maxTaskProcessesLength).forEach(num => {
            cells.push(get(item, `taskProcesses.${num}.content`));
            cells.push(get(item, `taskProcesses.${num}.outcome`));
          });

          cells.push(item.explanation);

          range(maxTaskRegulationsLength).forEach(num => {
            cells.push(get(item, `taskRegulations.${num}.regulationId`));
            cells.push(get(item, `taskRegulations.${num}.memo`));
          });

          range(maxTaskNotificationsLength).forEach(num => {
            cells.push(get(item, `taskNotifications.${num}.name`));
            cells.push(get(item, `taskNotifications.${num}.documentNo`));
          });

          return cells;
        })
      );

      rows.forEach(row => {
        row.getCell('I').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(taskBasisTypesJP).join(',')}"`],
        };
        row.getCell('J').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(weekDaysJP).join(',')}"`],
        };
        row.getCell('K').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(daysJP).join(',')}"`],
        };
        row.getCell('L').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(nosJP).join(',')}"`],
        };
        row.getCell('M').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(weekDaysJP).join(',')}"`],
        };
        row.getCell('N').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(monthsJP).join(',')}"`],
        };
        row.getCell('O').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(daysJP).join(',')}"`],
        };
        row.getCell('P').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(monthsJP).join(',')}"`],
        };
        row.getCell('Q').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(nosJP).join(',')}"`],
        };
        row.getCell('R').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(weekDaysJP).join(',')}"`],
        };
        row.getCell('U').dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [`"${Object.keys(leadTimeTypesJP).join(',')}"`],
        };
      });

      ws.mergeCells('L1:M1');
      ws.mergeCells('N1:O1');
      ws.mergeCells('P1:R1');
      ws.mergeCells('T1:U1');
      ws.getCell('L1').alignment = { horizontal: 'center' };
      ws.getCell('N1').alignment = { horizontal: 'center' };
      ws.getCell('P1').alignment = { horizontal: 'center' };
      ws.getCell('T1').alignment = { horizontal: 'center' };

      const buffer = await wb.xlsx.writeBuffer();
      FileSaver.saveAs(new Blob([buffer]), formatDownloadFileName(fileName, { ext: 'xlsx' }));
    },
    [daysJP, leadTimeTypesJP, monthsJP, nosJP, t, taskBasisTypesJP, weekDaysJP]
  );

  const handleDownloadTasks = useCallback(() => {
    dispatchGetTasksExportExcel({
      params: {
        departmentIds: selectedDepartmentIds,
      },
      callback: handleExportXlsx,
    });
  }, [dispatchGetTasksExportExcel, handleExportXlsx, selectedDepartmentIds]);

  useEffect(() => {
    dispatchSearchDepartments({ params: {} });
  }, [dispatchSearchDepartments]);

  return (
    <WithAuth title={t('title')} isContentFullWidth>
      {(isBulkInsertLoading || exportLoading) && <LoadingScreen />}
      <SectionTitle icon={<CopyIcon />}>{t('subtitle_upload')}</SectionTitle>
      <Card bordered={false}>
        <Upload.Dragger
          name="file"
          showUploadList={false}
          multiple={false}
          accept=".xlsx"
          customRequest={handleUpload}
          disabled={isOrganizationDeleted}
        >
          <FilePlusIcon />
          <Trans
            i18nKey="common:drag_drop_attachment"
            t={t}
            components={{
              title: <p className="ant-upload-title" />,
              subtitle: <p className="ant-upload-subtitle" />,
            }}
          />
        </Upload.Dragger>
        <div className={styles['guide-card']}>
          <Typography.Paragraph className="description mb-0">
            <p className="desc mb-2 text-pre-line">{t('upload_description')}</p>
            <Button onClick={showModal} shape="round" className={styles['button-open-upload-guide-modal']}>
              {t('button_show_upload_guide')}
              <ExternalIcon className="ml-2" />
            </Button>
            <div className="group-link"></div>
          </Typography.Paragraph>
        </div>
        {!!uploadErrors &&
          uploadErrors?.map?.(error => (
            <Typography.Paragraph key={error?.errorCode} className="mt-2">
              <Typography.Text type="danger" className="text-pre-line">
                {t(`server_error:${error?.errorCode}`, {
                  lines: error?.rows
                    ?.map(row =>
                      isArray(row)
                        ? row.map(item => `${item + 1}${t('common:line')}`).join(t('common:and'))
                        : `${row + 1}${t('common:line')}`
                    )
                    .join('、'),
                })}
              </Typography.Text>
            </Typography.Paragraph>
          ))}
        <div className="text-center mt-3">
          <Button type="link" onClick={handleDownloadTemplate} className={classNames(styles['button-download-template'], 'link-underline')}>
            <ExportIcon className="mr-2" />
            {t('button_download_excel_template')}
            <ExcelIcon className="ml-2" />
          </Button>
        </div>
      </Card>
      <Spacer height="40px" />
      <SectionTitle icon={<DownloadFileIcon />}>{t('subtitle_download')}</SectionTitle>
      <Card className="pb-4" bordered={false}>
        <Typography.Paragraph className="description mb-4">
          <p className="desc mb-0 color-text">{t('download_desc_1')}</p>
        </Typography.Paragraph>
        <Row justify="space-between">
          <Col flex="0 0 232px">
            <Button
              block
              type="primary"
              shape="round"
              className={classNames(styles['button-download-task'], 'font-weight-bold')}
              disabled={exportLoading}
              onClick={handleDownloadTasks}
            >
              <ExportCircleWhiteIcon className="mr-2" />
              {t('button_download_task')}
            </Button>
          </Col>
          <Col flex="0 0 212px" className={styles['search-department-container']}>
            <Input.Search placeholder={t('search_department_placeholder')} onSearch={setSearchKeyword} allowClear />
          </Col>
        </Row>
        <Table
          className={classNames(styles['department-table'], 'mt-3')}
          pagination={false}
          loading={departmentsLoading}
          columns={departmentTableColumns}
          rowKey="id"
          dataSource={departmentTableDataSource}
          rowSelection={{
            type: 'checkbox',
            onChange: newSelectedDepartmentIds => {
              setSelectedDepartmentIds(newSelectedDepartmentIds as number[]);
            },
            selectedRowKeys: selectedDepartmentIds,
          }}
        />
      </Card>

      {/* modal */}
      <ModalInfo
        className="modal-pd-30 modal-footer-center"
        title={t('title_modal')}
        width={856}
        onCancel={handleCancel}
        centered
        visible={isModalGuidelineVisible}
        onOk={handleOk}
        closable
        okText={t('common:button_close')}
        footer={null}
      >
        <Spacer height="10px" />
        <Typography.Title level={5} className="mb-px-5">
          {t('subtitle_modal_1')}
        </Typography.Title>
        <Typography.Paragraph className="mb-0">
          <p className="mb-0 excel-modal-line">
            <EllipseIcon className="mr-2" />
            {t('modal_desc_1')}
          </p>
          <p className="mb-0 excel-modal-line">
            <EllipseIcon className="mr-2" />
            {t('modal_desc_2')}
          </p>
        </Typography.Paragraph>
        <Spacer height="20px" />
        <Typography.Title level={5} className="mb-px-5">
          {t('subtitle_modal_2')}
        </Typography.Title>
        <Typography.Paragraph className="mb-3">
          <p className="mb-0 excel-modal-line">
            <EllipseIcon className="mr-2" />
            {t('modal_desc_3')}
          </p>
          <p className="mb-0 excel-modal-line">
            <EllipseIcon className="mr-2" />
            {t('modal_desc_4')}
          </p>
          <p className="mb-0 excel-modal-line">
            <EllipseIcon className="mr-2" />
            {t('modal_desc_5')}
          </p>
        </Typography.Paragraph>
        <Typography.Title level={5} className="mb-px-5 mt-3">
          {t('subtitle_modal_3')}
        </Typography.Title>
        <Typography.Paragraph className="mb-0">
          <p className="mb-0 excel-modal-line">
            <EllipseIcon className="mr-2" />
            {t('modal_desc_6')}
          </p>
        </Typography.Paragraph>
        <Spacer height="20px" />
        <div className="flex-center">
          <Button type="primary" onClick={handleOk} className="mn-w180p font-weight-bold" size="large">
            {t('common:button_close')}
          </Button>
        </div>
      </ModalInfo>
      <ModalInfo
        {...modalUploadSuccess}
        title={t('modal_import_success_title')}
        okText={t('common:button_close')}
        onOk={() => setModalUploadSuccess(null)}
        onCancel={() => setModalUploadSuccess(null)}
      >
        <p className="text-pre-line">{t('modal_import_success_message', { import_count: modalUploadSuccess?.affectedRows })}</p>
      </ModalInfo>
      <ModalInfo
        title={t('title')}
        visible={isModalErrorVisible}
        onOk={() => setModalErrorVisible(false)}
        onCancel={() => setModalErrorVisible(false)}
        closable={false}
        okText={t('common:button_close')}
      >
        <div className="text-pre-line">{t('common:message_excel_no_data')}</div>
      </ModalInfo>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchSearchDepartments: (payload: Payload) => dispatch(searchDepartments(payload)),
  dispatchGetTasksExportExcel: (payload: Payload) => dispatch(getTasksExportExcel(payload)),
  dispatchBulkInsertTasks: (payload: Payload) => dispatch(bulkInsertTasks(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { isBulkInsertLoading } = state.taskReducer;
  const { departments, isLoading: departmentsLoading } = state.departmentReducer;
  const { isSubmitting: exportLoading } = state.taskReducer;
  return { departments, departmentsLoading, exportLoading, isBulkInsertLoading };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
