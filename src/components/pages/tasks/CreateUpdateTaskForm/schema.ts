import * as yup from 'yup';
import { isNumber } from 'lodash';

import { isDefined } from '@/utils/commonUtil';

import { leadTimeTypes, taskBasisTypes, taskPeriodTypes } from '../constants';

export const getValidationSchema = t =>
  yup.object().shape(
    {
      title: yup
        .string()
        .required(t('common:message_required', { field: t('task_name') }))
        .max(100, t('common:message_max_length', { max: 100 })),
      purpose: yup
        .string()
        .nullable()
        .max(100, t('common:message_max_length', { max: 100 })),
      overview: yup
        .string()
        .nullable()
        .max(100, t('common:message_max_length', { max: 100 })),
      explanation: yup
        .string()
        .nullable()
        .max(1000, t('common:message_max_length', { max: 1000 })),
      taskProcesses: yup.array().of(
        yup.object().shape({
          content: yup
            .string()
            .max(50, t('common:message_max_length', { max: 50 }))
            .when('outcome', {
              is: value => !!value,
              then: schema => schema.required(t('common:message_required', { field: t('process_name') })),
            }),
          outcome: yup
            .string()
            .nullable()
            .max(1000, t('common:message_max_length', { max: 1000 })),
        })
      ),
      taskRegulations: yup.array().of(
        yup.object().shape({
          regulationId: yup.string().when(['type', 'memo'], {
            is: (type, memo) => !!type || !!memo,
            then: schema => schema.required(t('common:message_required', { field: t('regulation_name') })),
          }),
          memo: yup
            .string()
            .nullable()
            .max(1000, t('common:message_max_length', { max: 1000 })),
        })
      ),
      taskNotifications: yup.array().of(
        yup.object().shape({
          name: yup
            .string()
            .max(100, t('common:message_max_length', { max: 100 }))
            .when(['documentNo', 'fileName'], {
              is: (documentNo, fileName) => !!documentNo || !!fileName,
              then: schema => schema.required(t('common:message_required', { field: t('notification') })),
            }),
          documentNo: yup
            .string()
            .nullable()
            .max(50, t('common:message_max_length', { max: 50 })),
          size: yup
            .number()
            .nullable()
            .max(10 * 1024 * 1024, t('common:message_invalid_file_size', { size: '10MB' })),
        })
      ),
      taskAttachments: yup.array().of(
        yup.object().shape({
          size: yup
            .number()
            .nullable()
            .max(10 * 1024 * 1024, t('common:message_invalid_file_size', { size: '10MB' })),
        })
      ),
      leadTimeDay: yup
        .number()
        .nullable()
        .when('leadTimeType', {
          is: value => !!value,
          then: schema => schema.required(t('server_error:SSC-100-006')),
        })
        .test({
          name: 'testNonZero',
          message: t('message_leadtime_required'),
          test(value) {
            return value !== 0;
          },
        })
        .test({
          name: 'testIsValid',
          message: t('message_invalid_leadtime'),
          test() {
            const { basisType, periodType, leadTimeType, leadTimeDay } = this.parent;

            if (!basisType || basisType !== taskBasisTypes.deadline || !periodType || !leadTimeDay || !leadTimeType) {
              return true;
            }

            switch (periodType) {
              case taskPeriodTypes.weekly:
                if (leadTimeType === leadTimeTypes.days) return leadTimeDay <= 7;

                if (leadTimeType === leadTimeTypes.weeks) return leadTimeDay <= 1;

                return false;
              case taskPeriodTypes.monthly:
                if (leadTimeType === leadTimeTypes.days) return leadTimeDay <= 31;

                if (leadTimeType === leadTimeTypes.weeks) return leadTimeDay <= 4;

                return leadTimeDay <= 1;
              case taskPeriodTypes.annually:
                if (leadTimeType === leadTimeTypes.days) return leadTimeDay <= 365;

                if (leadTimeType === leadTimeTypes.weeks) return leadTimeDay <= 52;

                return leadTimeDay <= 12;
              case taskPeriodTypes.specified:
              default:
                return true;
            }
          },
        }),
      leadTimeType: yup
        .string()
        .nullable()
        .when('leadTimeDay', {
          is: value => isNumber(value),
          then: schema => schema.required(t('server_error:SSC-100-006')),
        }),
      periodType: yup
        .string()
        .nullable()
        .test({
          name: 'periodType',
          message: t('server_error:SSC-100-009'),
          test(value, context) {
            const { basisType } = context.parent;
            if (basisType === taskBasisTypes.deadline) {
              return isDefined(value);
            }
            return true;
          },
        }),
      'taskWeeklyPeriods.0.weekCode': yup.number().test({
        name: 'weekCode',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskWeeklyPeriods, periodType } = context?.parent || {};
          const { weekCode } = taskWeeklyPeriods?.[0] || {};
          if (periodType === taskPeriodTypes.weekly) {
            return isDefined(weekCode);
          }
          return true;
        },
      }),
      'taskMonthlyPeriods.0.specifiedDay': yup.number().test({
        name: 'specifiedDay',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskMonthlyPeriods, periodType } = context?.parent || {};
          const { specifiedDay } = taskMonthlyPeriods?.[0] || {};
          if (periodType === taskPeriodTypes.monthly) {
            return isDefined(specifiedDay);
          }
          return true;
        },
      }),
      'taskMonthlyPeriods.0.specifiedNo': yup.number().test({
        name: 'specifiedNo',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskMonthlyPeriods, periodType } = context?.parent || {};
          const { specifiedNo } = taskMonthlyPeriods?.[0] || {};
          if (periodType === taskPeriodTypes.monthlyNo) {
            return isDefined(specifiedNo);
          }
          return true;
        },
      }),
      'taskMonthlyPeriods.0.weekCode': yup.number().test({
        name: 'specifiedNo',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskMonthlyPeriods, periodType } = context?.parent || {};
          const { weekCode } = taskMonthlyPeriods?.[0] || {};
          if (periodType === taskPeriodTypes.monthlyNo) {
            return isDefined(weekCode);
          }
          return true;
        },
      }),
      'taskAnnuallyPeriods.0.specifiedMonth': yup.number().test({
        name: 'specifiedMonth',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskAnnuallyPeriods, periodType } = context?.parent || {};
          const { specifiedMonth } = taskAnnuallyPeriods?.[0] || {};
          switch (periodType) {
            case taskPeriodTypes.annually:
              return isDefined(specifiedMonth);
            case taskPeriodTypes.annuallyNo:
              return isDefined(specifiedMonth);
            default:
              return true;
          }
        },
      }),
      'taskAnnuallyPeriods.0.specifiedDay': yup.number().test({
        name: 'specifiedDay',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskAnnuallyPeriods, periodType } = context?.parent || {};
          const { specifiedDay } = taskAnnuallyPeriods?.[0] || {};
          if (periodType === taskPeriodTypes.annually) {
            return isDefined(specifiedDay);
          }
          return true;
        },
      }),
      'taskAnnuallyPeriods.0.specifiedNo': yup.number().test({
        name: 'specifiedNo',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskAnnuallyPeriods, periodType } = context?.parent || {};
          const { specifiedNo } = taskAnnuallyPeriods?.[0] || {};
          if (periodType === taskPeriodTypes.annuallyNo) {
            return isDefined(specifiedNo);
          }
          return true;
        },
      }),
      'taskAnnuallyPeriods.0.weekCode': yup.number().test({
        name: 'weekCode',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskAnnuallyPeriods, periodType } = context?.parent || {};
          const { weekCode } = taskAnnuallyPeriods?.[0] || {};
          if (periodType === taskPeriodTypes.annuallyNo) {
            return isDefined(weekCode);
          }
          return true;
        },
      }),
      'taskSpecifiedPeriods.0.specifiedOn': yup.mixed().test({
        name: 'specifiedOn',
        message: t('server_error:SSC-100-009'),
        test(_, context) {
          const { taskSpecifiedPeriods, periodType } = context?.parent || {};
          const { specifiedOn } = taskSpecifiedPeriods?.[0] || {};
          if (periodType === taskPeriodTypes.specified) {
            return isDefined(specifiedOn);
          }
          return true;
        },
      }),
    },
    [['leadTimeType', 'leadTimeDay']]
  );
