import React, { useCallback, useEffect, useState } from 'react';
import { Card, Input, Button, Typography, Row, Col } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormItem from 'antd/lib/form/FormItem';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { FormError } from '@/components/form';
import { RootState } from '@/redux/rootReducer';
import { Payload } from '@/types';
import {
  deleteSmallBusinessUnit,
  getLargeBusinessUnits,
  getMediumBusinessUnits,
  getSmallBusinessUnitDetails,
  updateSmallBusinessUnit,
  cleanSmallBusinessUnitDetails,
} from '@/redux/actions/businessUnitActions';
import { getDepartments } from '@/redux/actions';
import LoadingScreen from '@/components/LoadingScreen';
import { paths } from '@/shared/paths';
import { UpdateBusinessSuccessModal } from '@/components/pages/masters/businessUnit/modal/updateBusinessSuccess';
import { DeleteBusinessConfirmModal } from '@/components/pages/masters/businessUnit/modal/DeleteBusinessConfirm';
import { GetBusinessDetailNotFound } from '@/components/pages/masters/businessUnit/modal/getBusinessDetailNotFound';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { ArrowLeftIcon, EllipseIcon, FileCheckIcon, FilePenIcon } from '@/assets/images';
import { SectionTitle } from '@/components/Typography';

import { DeleteBusinessSucessModal } from '../modal/DeleteBusinessSucess';
import BusinessFormSelect from '../BusinessFormSelect';
import BusinessTitleChange from '../BusinessTitleChange';
import styles from '../styles.module.scss';

interface UpdateSmallBusinessUnit {
  departmentId: number;
  majorCategoryId: number;
  middleCategoryId: number;
  name: string;
}

// FIXME: use typescript instead of any
const Layout = ({
  smallBusinessUnitDetails,
  departmentsLoading,
  businessUnitLoading,
  isDeleteLoading,
  isUpdateLoading,
  dispatchGetDepartments,
  dispatchUpdateSmallBusiness,
  dispatchGetSmallBusinessDetails,
  dispatchDeleteSmallBusiness,
  dispatchCleanSmallBusinessDetails,
}: PropsFromRedux) => {
  const [t] = useTranslation(['business_unit']);
  const formProps = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .nullable()
          .max(50, t('common:message_max_length', { max: 50 })),
        departmentId: yup
          .number()
          .nullable()
          .required(t('common:please_select', { field: t('department') })),
        majorCategoryId: yup
          .number()
          .nullable()
          .required(t('common:please_select', { field: t('large_business_unit') })),
        middleCategoryId: yup
          .number()
          .nullable()
          .required(t('common:please_select', { field: t('medium_business_unit') })),
      })
    ),
  });
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    setError,
  } = formProps;
  const selectedName = watch('name');
  const selectedDepartmentId = watch('departmentId');
  const selectedMajorCategoryId = watch('majorCategoryId');
  const selectedMiddleCategoryId = watch('middleCategoryId');
  const router = useRouter();
  const { id: smallUnitId } = router.query;

  const [isModalUpdateSuccessVisible, setIsModalUpdateSuccessVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalDeleteSucessVisible, setIsModalDeleteSucessVisible] = useState(false);
  const [isModalDetailNotFoundVisible, setIsModalDetailNotFoundVisible] = useState(false);

  const updateSmallBusiness = useCallback(
    ({ name, departmentId, majorCategoryId, middleCategoryId }: UpdateSmallBusinessUnit) => {
      dispatchUpdateSmallBusiness({
        params: {
          ...(departmentId && { departmentId }),
          ...(majorCategoryId && { majorCategoryId }),
          ...(middleCategoryId && { middleCategoryId }),
          ...(name && { name }),
          id: (smallBusinessUnitDetails as any).id,
        },
        callback: () => {
          setIsModalUpdateSuccessVisible(true);
        },
        errorCallback: error => {
          if (error?.errorCode === ErrorCodes.DUPLICATE_CATEGORY) {
            setError('name', { message: t('business_name_duplicate') });
          }
        },
      });
    },
    [dispatchUpdateSmallBusiness, smallBusinessUnitDetails, setError, t]
  );

  const deleteSmallBusiness = () => {
    dispatchDeleteSmallBusiness({
      params: {
        id: smallUnitId,
      },
      callback: () => {
        setIsModalDeleteVisible(false);
        setIsModalDeleteSucessVisible(true);
      },
    });
  };

  useEffect(() => {
    dispatchGetDepartments();
    dispatchGetSmallBusinessDetails({
      params: smallUnitId,
      errorCallback: error => {
        if (error?.data?.errorCode === ErrorCodes.NOT_FOUND) {
          setIsModalDetailNotFoundVisible(true);
        }
      },
    });
  }, [dispatchGetDepartments, dispatchGetSmallBusinessDetails, smallUnitId]);

  useEffect(() => {
    return () => {
      dispatchCleanSmallBusinessDetails();
    };
  }, [dispatchCleanSmallBusinessDetails]);

  useEffect(() => {
    setValue('name', smallBusinessUnitDetails?.name);
  }, [smallBusinessUnitDetails?.name, setValue]);

  return (
    <WithAuth title={t('buniness_unit_title')} isContentFullWidth>
      {(departmentsLoading || businessUnitLoading) && <LoadingScreen />}
      <Typography.Paragraph>
        <Link href={`${paths.master.businessUnit.index}`}>
          <a>
            <ArrowLeftIcon />
            <span className={classNames(styles['back-link'], 'ml-2 text-minimum')}>{t('return_to_business_master')}</span>
          </a>
        </Link>
      </Typography.Paragraph>
      <Row className="edit-business-unit" gutter={32}>
        <Col md={12}>
          <SectionTitle level={3} icon={<FileCheckIcon />}>
            {t('subtitle_select_business_unit')}
          </SectionTitle>
          <Card bordered={false}>
            <div className="select-business">
              <div className="top-content mb-4">
                <Typography.Paragraph>
                  <div className="d-flex align-items-center mb-px-10">
                    <div className={styles['gray-label']}>{t('business_unit_name')}</div>
                    {(smallBusinessUnitDetails as any).name}
                  </div>
                  <div className="d-flex align-items-center mb-px-10">
                    <div className={styles['gray-label']}>{t('business_unit_level')}</div>
                    {t('common:small')}
                  </div>
                  <div className="d-flex align-items-center mb-0">
                    <div className={styles['gray-label']}>{t('department_in_charge')}</div>
                    {(smallBusinessUnitDetails as any).department?.name}
                  </div>
                </Typography.Paragraph>
              </div>
              {(smallBusinessUnitDetails as any).tasks?.length > 0 ? (
                <div className={classNames(styles['child-card'], 'p-4')}>
                  <Typography.Title level={5}>{t('edit__small_business_unit_children')}</Typography.Title>
                  {(smallBusinessUnitDetails as any)?.tasks.map((item, key) => (
                    <div className="d-flex align-items-center" key={key}>
                      <EllipseIcon />
                      <Typography className="mx-px-10 mb-1">{item.title}</Typography>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border text-center">{t('message_no_task')}</div>
              )}
            </div>
          </Card>
        </Col>
        <Col md={12}>
          <SectionTitle level={3} icon={<FilePenIcon />}>
            {t('title_business_unit_edit')}
          </SectionTitle>
          <form onSubmit={handleSubmit(updateSmallBusiness)}>
            <Card bordered={false}>
              <section className={classNames(styles['name-change-section'])}>
                <Typography.Title level={4} className="title">
                  {t('change_business_name')}
                </Typography.Title>
                <Typography.Text strong>{t('name_changed')}</Typography.Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem validateStatus={error?.message ? 'error' : ''} className="mt-px-5 mb-0 border-input">
                      <Input {...field} size="large" />
                    </FormItem>
                  )}
                />
                <FormError name="name" errors={errors} />
              </section>

              <BusinessFormSelect businessUnit={smallBusinessUnitDetails} {...formProps} />

              <div className={classNames(styles['title-change-section'], 'mx-auto')}>
                <BusinessTitleChange
                  businessUnit={smallBusinessUnitDetails}
                  selectedBusinessUnit={{
                    selectedName,
                    selectedDepartmentId,
                    selectedMajorCategoryId,
                    selectedMiddleCategoryId,
                  }}
                />
                <div className="my-3 flex-center">
                  <Button type="primary" className="mn-w180p font-weight-bold" size="large" htmlType="submit" loading={isUpdateLoading}>
                    {t('button_update_business_unit')}
                  </Button>
                </div>
                {(smallBusinessUnitDetails as any).tasks?.length === 0 && (
                  <div className="d-flex justify-content-end">
                    <Button type="link" className="link-underline" onClick={() => setIsModalDeleteVisible(true)}>
                      {t('delete_business_unit')}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </form>
        </Col>
      </Row>
      <UpdateBusinessSuccessModal isVisible={isModalUpdateSuccessVisible} onOk={() => router.push(paths.master.businessUnit.index)} />
      <DeleteBusinessConfirmModal
        isVisible={isModalDeleteVisible}
        onCancel={() => setIsModalDeleteVisible(false)}
        onOk={deleteSmallBusiness}
        isDeleteLoading={isDeleteLoading}
        businessType={t('common:small')}
        businessName={smallBusinessUnitDetails?.name}
      />
      <DeleteBusinessSucessModal
        isVisible={isModalDeleteSucessVisible}
        onCancel={() => setIsModalDeleteSucessVisible(false)}
        onOk={() => router.push(paths.master.businessUnit.index)}
      />
      <GetBusinessDetailNotFound
        isVisible={isModalDetailNotFoundVisible}
        onOk={() => {
          setIsModalDetailNotFoundVisible(false);
          router.push(paths.master.businessUnit.index);
        }}
      />
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const {
    smallBusinessUnitDetails = {} as any,
    largeBusinessUnits,
    isUpdateLoading,
    mediumBusinessUnits,
    isDeleteLoading,
  } = state.businessUnitReducer;
  const { isLoading: businessUnitLoading } = state.businessUnitSearchReducer;
  const { departments, isLoading: departmentsLoading } = state.departmentReducer;
  return {
    departments,
    smallBusinessUnitDetails,
    departmentsLoading,
    isUpdateLoading,
    businessUnitLoading,
    largeBusinessUnits,
    mediumBusinessUnits,
    isDeleteLoading,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetDepartments: () => dispatch(getDepartments()),
  dispatchGetSmallBusinessDetails: (payload: Payload) => dispatch(getSmallBusinessUnitDetails(payload)),
  dispatchCleanSmallBusinessDetails: () => dispatch(cleanSmallBusinessUnitDetails()),
  dispatchUpdateSmallBusiness: (payload: Payload) => dispatch(updateSmallBusinessUnit(payload)),
  dispatchGetLargeBusiness: (payload: Payload) => dispatch(getLargeBusinessUnits(payload)),
  dispatchGetMediumBusiness: (payload: Payload) => dispatch(getMediumBusinessUnits(payload)),
  dispatchDeleteSmallBusiness: (payload: Payload) => dispatch(deleteSmallBusinessUnit(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
