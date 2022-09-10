import React, { Dispatch, useCallback, useMemo } from 'react';
import { Checkbox, Menu, Skeleton, Spin } from 'antd';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroller';
import Router from 'next/router';
import { isEmpty } from 'lodash';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import { Action, Payload } from '@/types';
import { useTranslation } from 'i18next-config';
import { RootState } from '@/redux/rootReducer';
import { getNotifications, readNotifications, setMenuMobile } from '@/redux/actions';
import { NOTIFICATION_TYPE, PAGINATE_NOTIFICATIONS } from '@/shared/constants';
import { LOADING_STATUSES } from '@/shared/loading';
import { parseStringifiedRawContentToHTML } from '@/utils/draft';
import { paths } from '@/shared/paths';
import { CrossMarkIcon } from '@/assets/images';
import { isMobile } from '@/utils/breakpointUtils';

import styles from './styles.module.scss';

const NotificationList = ({
  onClose,
  notifications,
  dispatchGetNotifications,
  dispatchReadNotifications,
  notificationLoadingStatus,
  paging: { page, nextPage, lastPage },
  status,
  dispatchSetMenuMobile,
  isStatusUnreadLoading,
}: PropsFromRedux & any) => {
  const [t] = useTranslation('common');

  const hasMore = useMemo(
    () => !!nextPage && nextPage > 1 && nextPage <= lastPage && notificationLoadingStatus !== LOADING_STATUSES.LOADING,
    [notificationLoadingStatus, lastPage, nextPage]
  );

  const loadMoreNotifications = useCallback(() => {
    if (hasMore) {
      dispatchGetNotifications({
        params: { offset: (page - 1) * PAGINATE_NOTIFICATIONS.limit, limit: PAGINATE_NOTIFICATIONS.limit, page, status },
      });
    }
  }, [dispatchGetNotifications, hasMore, page, status]);

  const handleNotification = useCallback(
    (notificationId, type, taskCode, resourceId) => {
      dispatchReadNotifications({
        params: {
          notificationId,
        },
      });
      if (taskCode) {
        dispatchSetMenuMobile({
          response: {
            isNotificationDesktopVisible: false,
            menuMobile: { isMenuMobileVisible: false, isNotificationsMobileVisible: false },
          },
        });
        const typeQuery = type === NOTIFICATION_TYPE.comment ? { commentId: resourceId } : { transactionId: resourceId };
        dispatchGetNotifications({
          params: {
            offset: PAGINATE_NOTIFICATIONS.offset,
            limit: PAGINATE_NOTIFICATIONS.limit,
            page: PAGINATE_NOTIFICATIONS.page,
            isForceRefresh: true,
            status,
          },
        });
        Router.push({ pathname: `${paths.tasks.detail}`, query: { taskCode, ...typeQuery } });
      }
    },
    [dispatchGetNotifications, dispatchReadNotifications, dispatchSetMenuMobile, status]
  );

  const handleUnreadNotification = useCallback(
    (e: CheckboxChangeEvent) => {
      if (e.target.checked) {
        dispatchGetNotifications({
          params: {
            offset: PAGINATE_NOTIFICATIONS.offset,
            limit: PAGINATE_NOTIFICATIONS.limit,
            page: PAGINATE_NOTIFICATIONS.page,
            isForceRefresh: true,
            status: 'unread',
          },
        });
      } else {
        dispatchGetNotifications({
          params: {
            offset: PAGINATE_NOTIFICATIONS.offset,
            limit: PAGINATE_NOTIFICATIONS.limit,
            page: PAGINATE_NOTIFICATIONS.page,
            isForceRefresh: true,
            status: 'all',
          },
        });
      }
    },
    [dispatchGetNotifications]
  );

  const handleCloseNotification = useCallback(() => {
    if (isMobile()) {
      dispatchSetMenuMobile({ response: { isMenuMobileVisible: false, hasModalNotification: false } });
    } else {
      onClose();
    }
  }, [dispatchSetMenuMobile, onClose]);

  return (
    <>
      <div className={styles['notification-header']}>
        <span>{t('common:notice')}</span>
        <div className="d-flex align-items-center">
          <Checkbox onChange={handleUnreadNotification} />
          <span>{t('common:show_unread_only')}</span>
          <CrossMarkIcon onClick={handleCloseNotification} />
        </div>
      </div>
      <Menu className={classNames(styles['notification-menu'], 'px-2')}>
        {isEmpty(notifications) ? (
          <div className={styles['no-data']}>
            <span>{t('nodata')}</span>
          </div>
        ) : (
          <InfiniteScroll
            initialLoad={false}
            pageStart={1}
            loadMore={loadMoreNotifications}
            hasMore={hasMore}
            loader={notificationLoadingStatus === LOADING_STATUSES.LOADING && <Skeleton key={0} active paragraph={{ rows: 1 }} />}
            useWindow={false}
          >
            {isStatusUnreadLoading ? (
              <div className="d-flex justify-content-center mt-3 mb-3">
                <Spin />
              </div>
            ) : (
              notifications?.map(({ id, type, taskComment, transaction, createdByUser, isRead, newReceiver }, key) => {
                const notificationContentText = type === NOTIFICATION_TYPE.comment ? t('register_comment') : t('assign_task');

                return (
                  <Menu.Item
                    className={classNames({ [styles['has-read']]: isRead }, styles['notification-item'])}
                    eventKey={key.toString()}
                    onClick={() =>
                      handleNotification(
                        id,
                        type,
                        taskComment?.task?.taskCode || transaction?.task?.taskCode,
                        taskComment?.id || transaction?.id
                      )
                    }
                  >
                    <div className={classNames(styles['noti-item-content'], 'text-minimum')}>
                      {isEmpty(newReceiver)
                        ? `${createdByUser?.name}${notificationContentText}`
                        : t('change_user_assign', { user: newReceiver?.name })}
                    </div>

                    <div className={classNames(styles['noti-item-details'], 'text-minimum mb-0')}>
                      {!!transaction?.title && <div>{transaction?.title}</div>}

                      {!!taskComment?.content && (
                        <>
                          <div>
                            {taskComment?.task?.taskCode}　{taskComment?.task?.title}
                          </div>
                          <div dangerouslySetInnerHTML={{ __html: parseStringifiedRawContentToHTML(taskComment?.content) }} />
                        </>
                      )}
                    </div>
                  </Menu.Item>
                );
              })
            )}
          </InfiniteScroll>
        )}
      </Menu>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const { notifications, paging, notificationLoadingStatus, menuMobile, status, isStatusUnreadLoading } = state.notificationReducer;
  return { notifications, notificationLoadingStatus, paging, menuMobile, status, isStatusUnreadLoading };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetNotifications: (payload: Payload) => dispatch(getNotifications(payload)),
  dispatchReadNotifications: (payload: Payload) => dispatch(readNotifications(payload)),
  dispatchSetMenuMobile: (payload: Payload) => dispatch(setMenuMobile(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(NotificationList);
