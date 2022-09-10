import moment from 'moment';
import * as yup from 'yup';

import { CHOICE_IDENTIFIER_005 } from '../../constants';

export const generateCreateUpdateTransactionSchema = t =>
  yup.object().shape(
    {
      title: yup
        .string()
        .nullable()
        .required(t('common:message_required', { field: t('subject') }))
        .max(150, t('common:message_max_length', { max: 150 })),
      startDate: yup
        .date()
        .nullable()
        .required(t('please_select_date'))
        .test('isBeforeCompletionDate', t(`server_error:SSC-60-004`), function test(startDate) {
          return !this.parent.completionDate || moment(startDate).isSameOrBefore(this.parent.completionDate, 'day');
        }),
      completionDate: yup
        .date()
        .nullable()
        .required(t('please_select_date'))
        .test('isBeforeCompletionDate', t('server_error:SSC-60-010'), function test(completionDate) {
          return !this.parent.startDate || moment(this.parent.startDate).isSameOrBefore(completionDate, 'day');
        }),
      personInCharge: yup
        .string()
        .nullable()
        .when('assignee', (assignee, schema) => {
          if (+assignee === CHOICE_IDENTIFIER_005.personInCharge) {
            return schema.required(t('server_error:SSC-60-005'));
          }
          return schema;
        }),
      memo: yup
        .string()
        .nullable()
        .max(1000, t('common:message_max_length', { max: 1000 })),
    },
    [['startDate', 'completionDate']]
  );
