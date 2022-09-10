import React, { FC } from 'react';
import FullCalendar, { EventContentArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Typography } from 'antd';
import jaLocale from '@fullcalendar/core/locales/ja';
import moment from 'moment';
import classNames from 'classnames';

import { TaskStatus } from '@/shared/enum';
import { dateFormat, shortDateFormat } from '@/shared/constants';
import { holidaysJP } from '@/shared/holidaysJP';

import styles from './styles.module.scss';

export type Props = {
  events: {
    title: string;
    start: string;
    end?: string;
    backgroundColor: string;
    textColor: string;
    extendedProps?: any;
  }[];
  validRange: {
    start: string;
    end: string;
  };
  onClickEvent?: (data: any) => void;
};

export const Layout: FC<Props> = ({ events, validRange, onClickEvent }) => {
  const isTodoTask = (status: TaskStatus) => {
    return status === TaskStatus.TODO;
  };

  const isOpenTask = (status: TaskStatus) => {
    return status === TaskStatus.OPEN;
  };

  const isDoingTask = (status: TaskStatus) => {
    return status === TaskStatus.DOING;
  };

  const isCompletedTask = (status: TaskStatus) => {
    return status === TaskStatus.COMPLETED;
  };

  return (
    <div className={styles['ssc-fullcalendar-container']}>
      <FullCalendar
        viewClassNames="notranslate"
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={[
          ...events,
          ...holidaysJP.map(day => ({
            start: moment(day).format(dateFormat),
            end: moment(day).format(dateFormat),
            display: 'background',
          })),
        ]}
        eventContent={({ event: { extendedProps, title, end } }: EventContentArg) => {
          if (!end) {
            return (
              <div className={classNames(styles['task--daily'], styles['task--container'])}>
                <div
                  className={classNames(
                    styles['heading--bullet'],
                    { [styles['open--heading']]: isOpenTask(extendedProps.status) },
                    { [styles['doing--heading']]: isDoingTask(extendedProps.status) },
                    { [styles['todo--heading']]: isTodoTask(extendedProps.status) },
                    { [styles['completed--heading']]: isCompletedTask(extendedProps.status) }
                  )}
                ></div>
                <Typography.Text
                  onClick={onClickEvent}
                  ellipsis={true}
                  className={classNames(styles['task--text'], styles['task--text--title'], 'mb-0')}
                >
                  {title}
                </Typography.Text>
              </div>
            );
          }

          if (isOpenTask(extendedProps.status)) {
            return (
              <div className={classNames(styles['task--open'], styles['task--container'])}>
                <Typography.Text
                  onClick={onClickEvent}
                  ellipsis={true}
                  className={classNames(styles['task--text'], styles['task--text--title'], 'mb-0')}
                >
                  {title}
                </Typography.Text>
                <Typography.Text onClick={onClickEvent} className={classNames(styles['task--text'], styles['task--text--period'], 'mb-0')}>
                  {moment(extendedProps.start).format(shortDateFormat)} - {moment(extendedProps.end).format(shortDateFormat)}
                </Typography.Text>
              </div>
            );
          }

          if (isTodoTask(extendedProps.status)) {
            return (
              <div className={classNames(styles['task--todo'], styles['task--container'])}>
                <Typography.Text
                  onClick={onClickEvent}
                  ellipsis={true}
                  className={classNames(styles['task--text'], styles['task--text--title'], 'mb-0')}
                >
                  {title}
                </Typography.Text>
                <Typography.Text onClick={onClickEvent} className={classNames(styles['task--text'], styles['task--text--period'], 'mb-0')}>
                  {moment(extendedProps.start).format(shortDateFormat)} - {moment(extendedProps.end).format(shortDateFormat)}
                </Typography.Text>
              </div>
            );
          }

          if (isCompletedTask(extendedProps.status)) {
            return (
              <div className={classNames(styles['task--completed'], styles['task--container'])}>
                <Typography.Text
                  onClick={onClickEvent}
                  ellipsis={true}
                  className={classNames(styles['task--text'], styles['task--text--title'], 'mb-0')}
                >
                  {title}
                </Typography.Text>
                <Typography.Text onClick={onClickEvent} className={classNames(styles['task--text'], styles['task--text--period'], 'mb-0')}>
                  {moment(extendedProps.start).format(shortDateFormat)} - {moment(extendedProps.end).format(shortDateFormat)}
                </Typography.Text>
              </div>
            );
          }

          if (isDoingTask(extendedProps.status)) {
            return (
              <div className={classNames(styles['task--doing'], styles['task--container'])}>
                <Typography.Text
                  onClick={onClickEvent}
                  ellipsis={true}
                  className={classNames(styles['task--text'], styles['task--text--title'], 'mb-0')}
                >
                  {title}
                </Typography.Text>
                <Typography.Text onClick={onClickEvent} className={classNames(styles['task--text'], styles['task--text--period'], 'mb-0')}>
                  {moment(extendedProps.start).format(shortDateFormat)} - {moment(extendedProps.end).format(shortDateFormat)}
                </Typography.Text>
              </div>
            );
          }

          return <></>;
        }}
        eventClick={onClickEvent}
        headerToolbar={false}
        locale={jaLocale}
        firstDay={1}
        validRange={validRange}
        height="auto"
        dayCellContent={({ date }) => {
          return moment(date).format('D');
        }}
      />
    </div>
  );
};
