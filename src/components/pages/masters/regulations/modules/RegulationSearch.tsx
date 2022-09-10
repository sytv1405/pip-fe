import { Button, Col, Row, Typography } from 'antd';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { Field, Form, Label } from '@/components/form';
import { RegulationType } from '@/types';

import styles from '../styles.module.scss';

type RegulationSearchProps = {
  isRegulationTypesLoading: boolean;
  regulationTypes: RegulationType[];
  onSearch: (params?: Record<string, any>) => void;
};

const RegulationSearch = ({ isRegulationTypesLoading, regulationTypes, onSearch }: RegulationSearchProps) => {
  const [t] = useTranslation('regulations');
  const form = useForm();

  const handleClear = useCallback(() => {
    onSearch();
    form.reset();
  }, [form, onSearch]);

  return (
    <Form form={form} className={classNames(styles['search-container'])} onSubmit={onSearch}>
      <Typography.Title level={2} className={classNames(styles['search-title'], 'mb-3')}>
        {t('search_title')}
      </Typography.Title>
      <Row className="mb-3" gutter={14}>
        <Col flex="0 0 96px">
          <Label className="form-label">{t('kinds')}</Label>
        </Col>
        <Col span={8}>
          <Field
            allowClear
            name="typeId"
            type="select"
            options={regulationTypes.map(regulationType => ({
              label: regulationType.name,
              value: regulationType.id.toString(),
            }))}
            style={{ width: '100%' }}
            loading={isRegulationTypesLoading}
            size="large"
            className="border-input"
          />
        </Col>
      </Row>
      <Row className="mb-3" gutter={14}>
        <Col flex="0 0 96px">
          <Label className="form-label">{t('keyword')}</Label>
        </Col>
        <Col flex={1}>
          <Field type="text" name="keyword" className={classNames(styles['input-keyword'], 'border-input')} allowClear />
        </Col>
      </Row>
      <Row gutter={12} justify="center">
        <Col>
          <Button size="large" type="default" htmlType="button" className="mn-w180p font-weight-bold" onClick={handleClear}>
            {t('common:button_clear_search')}
          </Button>
        </Col>
        <Col>
          <Button size="large" type="primary" htmlType="submit" className="mn-w180p font-weight-bold">
            {t('common:button_search')}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default RegulationSearch;
