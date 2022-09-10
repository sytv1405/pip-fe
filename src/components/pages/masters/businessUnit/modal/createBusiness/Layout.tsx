import FormItem from 'antd/lib/form/FormItem';
import { Button, Col, Input, Modal, Radio, Row, Typography } from 'antd';
import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';

import { useTranslation } from 'i18next-config';
import { BusinessUnitLevel } from '@/shared/enum';
import { RootState } from '@/redux/rootReducer';
import {
  clearLargeBusinessUnits,
  clearMediumBusinessUnits,
  getLargeBusinessUnits,
  getMediumBusinessUnits,
} from '@/redux/actions/businessUnitActions';
import SingleSelect from '@/components/SingleSelect';
import { Payload } from '@/types';

export type Props = {
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  isOrganizationDeleted: boolean;
  isVisible: boolean;
  createBusinessUnit: (setFieldError: any) => ({ businessLevel, departmentId, majorCategoryId, middleCategoryId, name }) => void;
};

export const Layout: FC<Props> = ({ onOk, isVisible, isOrganizationDeleted, createBusinessUnit }) => {
  const [t] = useTranslation(['business_unit']);

  const reduxSelector = useSelector((state: RootState) => {
    const { largeBusinessUnits, mediumBusinessUnits } = state.businessUnitReducer;
    const { departments } = state.departmentReducer;
    const { isCreateLoading } = state.businessUnitReducer;
    return {
      departments,
      largeBusinessUnits,
      mediumBusinessUnits,
      isCreateLoading,
    };
  });
  const dispatch = useDispatch();

  const { departments, largeBusinessUnits, mediumBusinessUnits, isCreateLoading } = reduxSelector;
  const dispatchGetLargeBusiness = (payload: Payload) => dispatch(getLargeBusinessUnits(payload));
  const dispatchGetMediumBusiness = (payload: Payload) => dispatch(getMediumBusinessUnits(payload));
  const dispatchClearMediumBusinessUnits = () => dispatch(clearMediumBusinessUnits());

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    setError,
    getValues,
  } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .nullable()
          .required(t('common:message_required', { field: t('business_unit_name') }))
          .max(50, t('common:message_max_length', { max: 50 })),
        departmentId: yup
          .number()
          .nullable()
          .required(t('common:please_select', { field: t('department') })),
        majorCategoryId: yup
          .number()
          .nullable()
          .when('businessLevel', (businessLevel, schema) => {
            if (businessLevel !== BusinessUnitLevel.large) {
              return schema.required(t('common:please_select', { field: t('large_business_unit') }));
            }
            return schema;
          }),
        middleCategoryId: yup
          .number()
          .nullable()
          .when('businessLevel', (businessLevel, schema) => {
            if (businessLevel === BusinessUnitLevel.small) {
              return schema.required(t('common:please_select', { field: t('medium_business_unit') }));
            }
            return schema;
          }),
      })
    ),
    defaultValues: {
      businessLevel: BusinessUnitLevel.large,
      departmentId: null,
      majorCategoryId: null,
      middleCategoryId: null,
      name: null,
    },
  });

  const selectedBusinessLevel = watch('businessLevel');

  useEffect(() => {
    switch (selectedBusinessLevel) {
      case BusinessUnitLevel.large:
        dispatch(clearLargeBusinessUnits());
        dispatch(clearMediumBusinessUnits());
        setValue('majorCategoryId', null);
        setValue('middleCategoryId', null);
        break;
      case BusinessUnitLevel.medium:
        dispatch(clearMediumBusinessUnits());
        setValue('middleCategoryId', null);

        if (getValues('departmentId')) {
          dispatchGetLargeBusiness({ params: { departmentId: getValues('departmentId') } });
        }
        break;
      case BusinessUnitLevel.small:
        if (getValues('departmentId') && isEmpty(largeBusinessUnits)) {
          dispatchGetLargeBusiness({ params: { departmentId: getValues('departmentId') } });
        }

        if (getValues('majorCategoryId')) {
          dispatchGetMediumBusiness({ params: { majorCategoryId: getValues('majorCategoryId') } });
        }
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusinessLevel]);

  const isLargeBusiness = (): boolean => {
    return watch('businessLevel') === BusinessUnitLevel.large;
  };

  const isSmallBusiness = (): boolean => {
    return watch('businessLevel') === BusinessUnitLevel.small;
  };

  const getLargeBusiness = departmentId => {
    if (isLargeBusiness()) {
      return;
    }
    dispatchGetLargeBusiness({ params: { departmentId } });
  };

  const getMediumBusiness = majorCategoryId => {
    if (!isSmallBusiness()) {
      return;
    }
    dispatchGetMediumBusiness({ params: { majorCategoryId } });
  };

  return (
    <Modal
      className="modal-pd-35 modal-footer-center"
      width="75%"
      title={t('creat_one__business')}
      centered
      visible={isVisible}
      onCancel={onOk}
      footer={null}
    >
      <form onSubmit={handleSubmit(createBusinessUnit(setError))}>
        <Typography.Paragraph className="mb-0 mt-3">{t('creat_one__business_sub_1')}</Typography.Paragraph>
        <Typography.Paragraph className="mb-4"> {t('creat_one__business_sub_2')}</Typography.Paragraph>
        <Row gutter={25}>
          <Col span={6}>
            <Typography.Paragraph className="text-normal" strong>
              {t('business_level')}
            </Typography.Paragraph>
            <Controller
              control={control}
              name="businessLevel"
              render={({ field: { onChange, value } }) => (
                <Radio.Group className="radio-color-green" onChange={onChange} value={value}>
                  <Radio value={BusinessUnitLevel.large}> {t('common:large')}</Radio>
                  <Radio value={BusinessUnitLevel.medium}> {t('common:medium')}</Radio>
                  <Radio value={BusinessUnitLevel.small}> {t('common:small')}</Radio>
                </Radio.Group>
              )}
            />
          </Col>

          {/* Department in charge */}
          <Col span={6}>
            <Typography.Text className="text-normal d-block mb-3" strong>
              {t('department_in_charge')}
            </Typography.Text>
            <Controller
              control={control}
              name="departmentId"
              render={({ field: { onChange } }) => (
                <SingleSelect
                  options={departments.map(item => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  onChange={departmentId => {
                    setValue('majorCategoryId', null);
                    setValue('middleCategoryId', null);
                    onChange(departmentId);
                    getLargeBusiness(departmentId);
                    dispatchClearMediumBusinessUnits();
                  }}
                />
              )}
            />
            {errors?.departmentId && <Typography.Text className="color-red">{errors?.departmentId.message}</Typography.Text>}
          </Col>

          {/* Large business unit */}
          <Col span={6}>
            <Typography.Text className="text-normal d-block mb-3" strong>
              {t('business_unit_lg')}
            </Typography.Text>
            <Controller
              control={control}
              name="majorCategoryId"
              render={({ field: { onChange } }) => (
                <SingleSelect
                  options={largeBusinessUnits.map(item => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  value={watch('majorCategoryId')}
                  disabled={isLargeBusiness()}
                  onChange={majorCategoryId => {
                    onChange(majorCategoryId);
                    getMediumBusiness(majorCategoryId);
                    setValue('middleCategoryId', null);
                  }}
                />
              )}
            />
            {errors?.majorCategoryId && <Typography.Text className="color-red">{errors?.majorCategoryId.message}</Typography.Text>}
          </Col>

          {/* Medium business unit */}
          <Col span={6}>
            <Typography.Text className="text-normal d-block mb-3" strong>
              {t('business_unit_md')}
            </Typography.Text>
            <Controller
              control={control}
              name="middleCategoryId"
              render={({ field: { onChange } }) => (
                <SingleSelect
                  value={watch('middleCategoryId')}
                  options={mediumBusinessUnits.map(item => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  disabled={!isSmallBusiness()}
                  onChange={onChange}
                />
              )}
            />
            {errors?.middleCategoryId && <Typography.Text className="color-red">{errors?.middleCategoryId.message}</Typography.Text>}
          </Col>
        </Row>

        {/* business unit name */}
        <div className="mt-4">
          <Typography.Text className="text-normal" strong>
            {t('business_unit_name')}
          </Typography.Text>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState: { error } }) => (
              <FormItem className="mb-px-20 mt-px-10 border-input" validateStatus={error?.message ? 'error' : ''}>
                <Input {...field} size="large" />
                {error?.message && <Typography.Text className="color-red">{error?.message}</Typography.Text>}
              </FormItem>
            )}
          />
        </div>

        {/* Register button */}
        <div className="text-center mb-3">
          <Button
            className="mn-w180p font-weight-bold"
            type="primary"
            size="large"
            loading={isCreateLoading}
            htmlType="submit"
            disabled={isOrganizationDeleted}
          >
            {t('regulation_type:btn_register')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
