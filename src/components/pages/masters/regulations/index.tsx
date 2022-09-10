import React, { useEffect, useMemo, useState } from 'react';
import { Button, Typography, Upload, Card, Table, ModalProps, Row, Col } from 'antd';
import Link from 'next/link';
import { connect, ConnectedProps } from 'react-redux';
import { useRouter } from 'next/router';
import { isEmpty, transform, entries } from 'lodash';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { Trans, useTranslation } from 'i18next-config';
import { createRegulation, deleteRegulations, getRegulations, getRegulationTypes, bulkInsertRegulations } from '@/redux/actions';
import { numberSorter, stringSorter } from '@/utils/sortUtils';
import { Payload, Regulation } from '@/types';
import { paths } from '@/shared/paths';
import { REGULATION_XLSX_OPTIONS } from '@/shared/file';
import { convertXlsxToJson, downloadFile, exportToXlsx, formatDownloadFileName, formatXlsxJsonData } from '@/utils/fileUtils';
import { ModalInfo } from '@/components/modal';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { convertFullWidthNumberToHalfWidth } from '@/utils/convertUtils';
import LoadingScreen from '@/components/LoadingScreen';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { SectionTitle } from '@/components/Typography';
import { CopyIcon, EditIcon, ExcelIcon, ExportIcon, ExternalIcon, FilePlusIcon, ListIcon, TrashThinIcon } from '@/assets/images';
import { Spacer } from '@/components/Spacer';
import { getTableTitleWithSort } from '@/shared/table';

import styles from './styles.module.scss';
import RegulationSearch from './modules/RegulationSearch';
import RegulationCreate from './modules/RegulationCreate';

const Regulations = ({
  regulations,
  regulationTypes,
  isRegulationsLoading,
  isRegulationTypesLoading,
  isDeleteLoading,
  isBulkInsertLoading,
  isCreateLoading,
  dispatchGetRegulations,
  dispatchGetRegulationTypes,
  dispatchDeleteRegulations,
  dispatchBulkInsertRegulations,
  dispatchCreateRegulation,
}: PropsFromRedux) => {
  const [t] = useTranslation(['regulations', 'common']);
  const isOrganizationDeleted = useIsOrganizationDeleted();

  const [isModalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalDeleteSuccess, setModalDeleteSuccess] = useState<
    ModalProps & {
      selectedRegulationGroup: any;
    }
  >(null);
  const [selectedRegulationIds, setSelectedRegulationIds] = useState([]);
  const [uploadErrors, setUploadErrors] = useState(null);
  const [modalUploadSuccess, setModalUploadSuccess] = useState(null);
  const [isModalDeleteWarningVisible, setModalDeleteWarningVisible] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isModalErrorVisible, setModalErrorVisible] = useState(false);
  const [searchState, setSearchState] = useState<{ keyword: string; typeId?: number }>({ keyword: '', typeId: undefined });
  const [showModalCreateOne, setShowModalCreateOne] = useState(false);
  const router = useRouter();

  const columns = useMemo(
    () => [
      {
        title: value => getTableTitleWithSort(value, 'id', t('regulation_id')),
        dataIndex: 'id',
        key: 'id',
        sorter: (record1, record2) => numberSorter(record1.id, record2.id),
        width: '10%',
      },
      {
        title: value => getTableTitleWithSort(value, 'regulationType', t('regulation_type')),
        dataIndex: 'regulationType',
        key: 'regulationType',
        sorter: (record1, record2) => stringSorter(record1.regulationType?.name, record2.regulationType?.name),
        width: '30%',
        className: 'text-wrap',
        render: regulationType => regulationType?.name,
      },
      {
        title: value => getTableTitleWithSort(value, 'name', t('name')),
        dataIndex: 'name',
        key: 'name',
        sorter: (record1, record2) => stringSorter(record1.name, record2.name),
        width: '55%',
        className: 'text-wrap',
        render: (name, regulation) =>
          isOrganizationDeleted ? (
            <span>{name}</span>
          ) : (
            <Link href={{ pathname: paths.master.regulations.edit, query: { id: regulation.id } }}>
              <a className={classNames(styles['edit-link'], 'link-underline')}>
                {name}
                <EditIcon className={styles['table-icon-edit']} />
              </a>
            </Link>
          ),
      },
    ],
    [t, isOrganizationDeleted]
  );

  const selectedRegulationGroup = useMemo(
    () =>
      transform(
        selectedRegulationIds,
        (result, regulationId) => {
          const selectedRegulation = regulations.find(record => record.id === regulationId);

          if (selectedRegulation) {
            if (result[selectedRegulation.regulationType?.name]) {
              result[selectedRegulation.regulationType?.name].push(selectedRegulation);
            } else {
              // eslint-disable-next-line no-param-reassign
              result[selectedRegulation.regulationType?.name] = [selectedRegulation];
            }
          }
        },
        {}
      ),
    [regulations, selectedRegulationIds]
  );

  const handleDeleteRegulations = () => {
    dispatchDeleteRegulations({
      params: { ids: selectedRegulationIds },
      callback: () => {
        setModalDeleteVisible(false);
        setModalDeleteSuccess({
          visible: true,
          selectedRegulationGroup,
        });
        setSelectedRegulationIds([]);
        dispatchGetRegulations({
          params: {
            keyword: router.query.keyword,
            typeId: router.query.typeId,
          },
        });
      },
    });
  };

  const handleUpload = async ({ file }) => {
    const jsonData = await convertXlsxToJson(file);

    if (isEmpty(jsonData)) {
      setUploadErrors(null);
      setModalErrorVisible(true);
      return;
    }

    const formattedJsonData = formatXlsxJsonData(jsonData, {
      columnNames: REGULATION_XLSX_OPTIONS.columnNames,
      transformData: (value, key) => {
        if (key === 'id' && value) return convertFullWidthNumberToHalfWidth(value);
        return value;
      },
    });

    dispatchBulkInsertRegulations({
      params: {
        regulations: formattedJsonData,
      },
      callback: response => {
        if (response?.result) {
          setUploadErrors(null);
          setModalUploadSuccess({
            visible: true,
            affectedRows: response?.data?.affectedRows,
          });
          dispatchGetRegulations({
            params: {
              keyword: router.query.keyword,
              typeId: router.query.typeId,
            },
          });
        } else {
          setUploadErrors(response.data);
        }
      },
    });
  };

  const handleDownloadTemplate = () => {
    downloadFile({
      href: '/static/xlsx/規定.xlsx',
      fileName: formatDownloadFileName(REGULATION_XLSX_OPTIONS.fileName, { ext: 'xlsx' }),
    });
  };

  const handleDownloadXlsx = () => {
    const { columnNames, columnWidths, fileName } = REGULATION_XLSX_OPTIONS;

    exportToXlsx({
      data: [
        [columnNames.type, columnNames.id, columnNames.name],
        ...regulations.map(regulation => [regulation.regulationType.name, regulation.id, regulation.name]),
      ],
      fileName: formatDownloadFileName(fileName, { ext: 'xlsx' }),
      columnWidths,
    });
  };

  const handleSearch = params => {
    setIsSearch(true);
    setSearchState(params);
    dispatchGetRegulations({
      params,
    });
  };

  useEffect(() => {
    dispatchGetRegulations();
  }, [dispatchGetRegulations]);

  useEffect(() => {
    dispatchGetRegulationTypes();
  }, [dispatchGetRegulationTypes]);

  return (
    <WithAuth title={t('title')} isContentFullWidth>
      {isBulkInsertLoading && <LoadingScreen />}
      <Row>
        <Col sm={12}>
          <SectionTitle icon={<CopyIcon />}>{t('subtitle_upload')}</SectionTitle>
        </Col>
        <Col sm={12}>
          <div className={styles['section-action']}>
            <Button
              className={styles['action-button']}
              shape="round"
              disabled={isOrganizationDeleted}
              onClick={() => setShowModalCreateOne(true)}
            >
              {t('common:btn_create_one')}
              <ExternalIcon className="ml-2" />
            </Button>
          </div>
        </Col>
      </Row>
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
            <p className="desc mb-0">{t('upload_desc_1')}</p>
            <p className="desc mb-0">{t('upload_desc_2')}</p>
            <p className="desc mb-0">{t('upload_desc_3')}</p>
          </Typography.Paragraph>
        </div>
        <div className="flex-center mt-3">
          <Button
            type="link"
            onClick={handleDownloadTemplate}
            className={classNames(styles['button-download-template'], 'link-underline mr-5')}
          >
            <ExportIcon className="mr-2" />
            {t('link_download_1')}
            <ExcelIcon className="ml-2" />
          </Button>
          <Button type="link" onClick={handleDownloadXlsx} className={classNames(styles['button-download-template'], 'link-underline')}>
            <ExportIcon className="mr-2" />
            {t('link_download_2')}
            <ExcelIcon className="ml-2" />
          </Button>
        </div>
        {!!uploadErrors &&
          uploadErrors?.map?.(error => (
            <Typography.Paragraph key={error?.errorCode}>
              <Typography.Text type="danger" className="text-pre-line">
                {error?.errorCode === ErrorCodes.REGULATION_NAME_DUPLICATED_EXCEL
                  ? t(`server_error:${error?.errorCode}`, {
                      lines: error?.rows
                        ?.map(rowGroup => rowGroup.map(row => `${row + 1}${t('common:line')}`).join(t('common:and')))
                        .join('、'),
                    })
                  : t(`server_error:${error?.errorCode}`, {
                      lines: error?.rows.map(row => `${row + 1}${t('common:line')}`).join('、'),
                    })}
              </Typography.Text>
            </Typography.Paragraph>
          ))}
      </Card>
      <Spacer height="40px" />
      <SectionTitle icon={<ListIcon />}>{t('list_regulations')}</SectionTitle>
      <Card bordered={false}>
        <section className="section-content section-upload">
          <RegulationSearch isRegulationTypesLoading={isRegulationTypesLoading} regulationTypes={regulationTypes} onSearch={handleSearch} />

          <h3 className={classNames(styles['sub-title'], 'mt-4')}>
            <span>{t('common:search_result')}</span>
            <span className={styles['sub-title-meta']}>
              {regulations?.length}
              {t('common:case')}
            </span>
          </h3>
          <Row align="middle">
            <Typography.Paragraph className="mb-0">
              <Typography.Text> {t('kinds')}：</Typography.Text>
              <Typography.Text>
                {searchState?.typeId ? regulationTypes?.find(type => type.id === +searchState.typeId)?.name : t('common:all')}
              </Typography.Text>
            </Typography.Paragraph>
            <span className={styles.divider} />
            <Typography.Paragraph className="mb-0">
              <Typography.Text>{t('keyword')}：</Typography.Text>
              <Typography.Text>{searchState?.keyword || t('common:unspecified')}</Typography.Text>
            </Typography.Paragraph>
          </Row>
          <Button
            disabled={isOrganizationDeleted}
            onClick={() => {
              if (isEmpty(selectedRegulationIds)) {
                setModalDeleteWarningVisible(true);
              } else {
                setModalDeleteVisible(true);
              }
            }}
            className="mt-2"
          >
            {t('btn_delete_rule')}
            <TrashThinIcon className="ml-1" />
          </Button>
          <div className="table-content mt-3">
            <Table
              dataSource={regulations}
              columns={columns}
              className={classNames(
                styles['regulation-table'],
                'ssc-table ssc-table-white custom-sort-icon cursor-pointer select-task-table'
              )}
              pagination={false}
              loading={isRegulationsLoading}
              locale={
                isSearch && {
                  emptyText: <span className="text-pre-line">{t('common:table_search_empty_message')}</span>,
                }
              }
              rowSelection={{
                type: 'checkbox',
                onChange: newSelectedRegulationIds => {
                  setSelectedRegulationIds(newSelectedRegulationIds as number[]);
                },
                selectedRowKeys: selectedRegulationIds,
              }}
              rowKey="id"
            />
          </div>
        </section>
      </Card>
      <ModalInfo
        title={t('modal_delete_title')}
        onCancel={() => setModalDeleteVisible(false)}
        visible={isModalDeleteVisible}
        okText={t('modal_delete_btn')}
        onOk={handleDeleteRegulations}
        confirmLoading={isDeleteLoading}
      >
        <p className="mb-0">{t('modal_delete_desc_1')}</p>
        <p className="mb-3">{t('modal_delete_desc_2')}</p>
        {entries(selectedRegulationGroup).map(([typeName, records]) => (
          <>
            <p className="mb-0">
              {t('modal_delete_desc_3')}（{typeName}）
            </p>
            <ul>
              {(records as Regulation[]).map(record => (
                <li key={record.id}>{record.name}</li>
              ))}
            </ul>
          </>
        ))}
      </ModalInfo>
      <ModalInfo
        title={t('modal_delete_title')}
        okText={t('common:button_close')}
        onOk={() => setModalDeleteSuccess(null)}
        {...modalDeleteSuccess}
      >
        <p className="mb-3">{t('modal_delete_desc_4')}</p>
        {entries(modalDeleteSuccess?.selectedRegulationGroup)?.map(([typeName, records]) => (
          <>
            <p className="mb-0">
              {t('modal_delete_desc_3')}（{typeName}）
            </p>
            <ul>
              {(records as Regulation[]).map(record => (
                <li key={record.id}>{record.name}</li>
              ))}
            </ul>
          </>
        ))}
      </ModalInfo>
      <ModalInfo
        {...modalUploadSuccess}
        title={t('modal_import_regulation_success__title')}
        okText={t('common:button_close')}
        onOk={() => setModalUploadSuccess(null)}
        onCancel={() => setModalUploadSuccess(null)}
      >
        <p className="text-pre-line">{t('modal_import_regulation_success__message', { import_count: modalUploadSuccess?.affectedRows })}</p>
      </ModalInfo>
      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => setModalDeleteWarningVisible(false)}
        onCancel={() => setModalDeleteWarningVisible(false)}
        visible={isModalDeleteWarningVisible}
      >
        <p className="text-center mb-0">{t('message_not_select_regulation_for_delete')}</p>
      </ModalInfo>
      <ModalInfo
        title={t('modal_import_regulation_error_title')}
        visible={isModalErrorVisible}
        onOk={() => setModalErrorVisible(false)}
        onCancel={() => setModalErrorVisible(false)}
        okText={t('common:button_close')}
      >
        <div className="text-pre-line">{t('common:message_excel_no_data')}</div>
      </ModalInfo>
      {showModalCreateOne && (
        <RegulationCreate
          visible={showModalCreateOne}
          regulationTypes={regulationTypes}
          isCreateLoading={isCreateLoading}
          dispatchCreateRegulation={dispatchCreateRegulation}
          dispatchGetRegulations={dispatchGetRegulations}
          disabled={isOrganizationDeleted}
          onCancel={() => setShowModalCreateOne(false)}
        />
      )}
    </WithAuth>
  );
};

const mapStateToProps = state => {
  const {
    regulationReducer: { regulations, isLoading: isRegulationsLoading, isCreateLoading, isDeleteLoading, isBulkInsertLoading },
    regulationTypeReducer: { regulationTypes, isLoading: isRegulationTypesLoading },
  } = state;
  return {
    regulations,
    regulationTypes,
    isRegulationsLoading,
    isRegulationTypesLoading,
    isCreateLoading,
    isDeleteLoading,
    isBulkInsertLoading,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetRegulations: (payload?: Payload) => dispatch(getRegulations(payload)),
  dispatchGetRegulationTypes: () => dispatch(getRegulationTypes()),
  dispatchCreateRegulation: (payload: Payload) => dispatch(createRegulation(payload)),
  dispatchDeleteRegulations: (payload: Payload) => dispatch(deleteRegulations(payload)),
  dispatchBulkInsertRegulations: (payload: Payload) => dispatch(bulkInsertRegulations(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Regulations);
