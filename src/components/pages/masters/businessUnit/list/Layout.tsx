import React, { FC, useCallback, useEffect, useState } from 'react';
import { Button, Card, Checkbox, Col, Form, Input, Radio, Row, Typography } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { BusinessUnitLevel } from '@/shared/enum';
import { Spacer } from '@/components/Spacer';
import { BusinessUnitTable } from '@/components/pages/masters/businessUnit/searchBusiessUnitTable';
import { useTranslation } from 'i18next-config';
import { RootState } from '@/redux/rootReducer';
import SingleSelect from '@/components/SingleSelect';
import { searchBusinessUnit, updateBusinessUnitQueryParam } from '@/redux/actions/businessUnitActions';
import { Payload } from '@/types';

import styles from '../styles.module.scss';

const Layout: FC<PropsFromRedux> = ({
  departments,
  businessUnitSearch,
  isSearchLoading,
  dispatchSearchBusinessUnit,
  dispatchUpdateSearchBusinessUnitQueryParam,
}: PropsFromRedux) => {
  const [t] = useTranslation(['business_unit']);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(null);
  const [selectedBusinessLevel, setSelectedBusinessLevel] = useState<string>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string>(null);
  const [formKey, setFormKey] = useState(Date.now());

  const {
    handleSubmit,
    control,
    watch,
    reset,
    getValues: formValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        departmentId: yup
          .number()
          .nullable()
          .required(t('common:please_select', { field: t('department') })),
      })
    ),
    defaultValues: {
      businessLevel: BusinessUnitLevel.large,
      departmentId: null,
      keyword: null,
      hasNoChildren: null,
    },
  });

  const getDepartmentNameById = useCallback(() => {
    const departmentId = watch('departmentId');
    const department = departments.find(item => item.id === departmentId);
    return department?.name;
  }, [departments, watch]);

  const getBusinessLevel = useCallback(() => {
    const businessLevel = watch('businessLevel');
    switch (businessLevel) {
      case BusinessUnitLevel.large:
        return t('common:large');
      case BusinessUnitLevel.medium:
        return t('common:medium');
      default:
        return t('common:small');
    }
  }, [t, watch]);

  const filter = (filterData: BusinessUnitMasterFilterForm) => {
    setSelectedDepartment(getDepartmentNameById());
    setSelectedBusinessLevel(getBusinessLevel);
    setSelectedKeyword(formValue('keyword'));
    dispatchSearchBusinessUnit({
      params: filterData,
      callback: () => {
        dispatchUpdateSearchBusinessUnitQueryParam({
          params: {
            businessUnitQueryParam: filterData,
          },
        });
      },
    });
  };

  useEffect(() => {
    const searchParams = { businessLevel: BusinessUnitLevel.large, departmentId: null, keyword: null, hasNoChildren: null };
    dispatchSearchBusinessUnit({
      params: searchParams,
      callback: () => {
        dispatchUpdateSearchBusinessUnitQueryParam({
          params: {
            businessUnitQueryParam: searchParams,
          },
        });
      },
    });
  }, [dispatchSearchBusinessUnit, dispatchUpdateSearchBusinessUnitQueryParam]);

  return (
    <Card bordered={false}>
      <form className={styles['gray-form']} onSubmit={handleSubmit(filter)}>
        <Typography.Title level={4}>{t('title_search_condition')}</Typography.Title>
        <Row className="w-100 m-0" gutter={60}>
          {/* Department in charge */}
          <Col span={6} className="p-0">
            <Typography.Text className="text-normal" strong>
              {t('department_in_charge')}
            </Typography.Text>
            <Spacer height="8px" />
            <Controller
              control={control}
              name="departmentId"
              render={({ field: { onChange, value } }) => (
                <SingleSelect
                  key={formKey}
                  value={value}
                  options={departments.map(item => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  onChange={onChange}
                />
              )}
            />
            {errors?.departmentId && <Typography.Text className="color-red">{errors?.departmentId.message}</Typography.Text>}
          </Col>

          <Col span={18} className="pr-0">
            <div>
              <Typography.Paragraph className="text-normal m-0" strong>
                {t('business_level')}
              </Typography.Paragraph>
              <Spacer height="8px" />
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
            </div>
            <div className="my-3">
              <Typography.Text className="text-normal" strong>
                {t('common:keyword')}
              </Typography.Text>
              <Controller
                control={control}
                name="keyword"
                render={({ field: { onChange, value } }) => (
                  <Input onChange={onChange} value={value} className="mt-2" allowClear style={{ height: '38px' }} />
                )}
              />
            </div>
            <div>
              <Controller
                control={control}
                name="hasNoChildren"
                render={({ field: { onChange, value } }) => (
                  <Checkbox onChange={onChange} checked={!!value}>
                    <p className="mb-0">{t('seach_buniess')}</p>
                    <p className="mb-0 text-minimum"> {t('seach_buniess_sub')}</p>
                  </Checkbox>
                )}
              />
            </div>
          </Col>
        </Row>
        {/* Filter button */}
        <Spacer height="28px" />
        <Row justify="center">
          <Form.Item className={styles['form-button']}>
            <Button
              className="mn-w180p font-weight-bold"
              size="large"
              onClick={() => {
                reset();
                filter(formValue());
                setFormKey(Date.now());
              }}
            >
              {t('common:button_clear_search')}
            </Button>
          </Form.Item>
          <Spacer width="12px" />
          <Form.Item className={styles['form-button']}>
            <Button className="mn-w180p font-weight-bold" size="large" type="primary" htmlType="submit" loading={isSearchLoading}>
              {t('common:button_search')}
            </Button>
          </Form.Item>
        </Row>
      </form>

      {/* Search result */}
      <Spacer height="30px" />
      <div className="d-flex align-items-center">
        <Typography.Title level={4} className="mb-0">
          {t('common:search_result')}
        </Typography.Title>
        <Typography className="text-normal mx-px-10">{`${businessUnitSearch.length ?? 0}${t('common:case')}`}</Typography>
      </div>
      <Spacer height="15px" />
      <div>
        <Typography className="mb-px-10 d-flex align-items-center">
          <span>
            {t('department_in_charge')}：{selectedDepartment || t('common:all')}
          </span>
          <span className={styles.divider} />
          <span>
            {t('business_level')}：{selectedBusinessLevel || t('common:large')}
          </span>
          <span className={styles.divider} />
          <span>
            {t('common:keyword')}：{selectedKeyword || t('common:unspecified')}
          </span>
        </Typography>
        <BusinessUnitTable />
      </div>
    </Card>
  );
};

const mapStateToProps = (state: RootState) => {
  const { departments, isLoading: departmentLoading } = state.departmentReducer;
  const { businessUnitSearch, isSearchLoading } = state.businessUnitReducer;
  return { departments, departmentLoading, businessUnitSearch, isSearchLoading };
};

const mapDispatchToProps = dispatch => ({
  dispatchSearchBusinessUnit: (payload: Payload) => dispatch(searchBusinessUnit(payload)),
  dispatchUpdateSearchBusinessUnitQueryParam: (payload: Payload) => dispatch(updateBusinessUnitQueryParam(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
