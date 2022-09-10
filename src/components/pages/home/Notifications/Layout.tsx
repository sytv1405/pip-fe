import { Dropdown } from 'antd';
import { Dispatch, useCallback, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import classNames from 'classnames';

import { BellIcon } from '@/assets/images';
import { getNotifications, setMenuMobile } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import { Action, Payload } from '@/types';
import { LOADING_STATUSES } from '@/shared/loading';
import { PAGINATE_NOTIFICATIONS, TIME_RELOAD_NOTIFICATIONS } from '@/shared/constants';
import { isMobile } from '@/utils/breakpointUtils';

import NotificationList from './NotificationList';
import styles from './styles.module.scss';

const Layout = ({
  notificationLoadingStatus,
  status,
  paging: { totalUnread },
  menuMobile: { isNotificationsMobileVisible } = {},
  isNotificationDesktopVisible,
  dispatchGetNotifications,
  dispatchSetMenuMobile,
}: PropsFromRedux) => {
  useEffect(() => {
    if (notificationLoadingStatus === LOADING_STATUSES.IDLE) {
      dispatchGetNotifications({
        params: {
          offset: PAGINATE_NOTIFICATIONS.offset,
          limit: PAGINATE_NOTIFICATIONS.limit,
          page: PAGINATE_NOTIFICATIONS.page,
          status,
        },
      });
    }
  }, [dispatchGetNotifications, notificationLoadingStatus, status]);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((!isNotificationsMobileVisible && isMobile()) || (!isNotificationDesktopVisible && !isMobile())) {
        dispatchGetNotifications({
          params: {
            offset: PAGINATE_NOTIFICATIONS.offset,
            limit: PAGINATE_NOTIFICATIONS.limit,
            page: PAGINATE_NOTIFICATIONS.page,
            isForceRefresh: true,
            status,
          },
        });
      }
    }, TIME_RELOAD_NOTIFICATIONS);

    return () => clearInterval(interval);
  }, [dispatchGetNotifications, isNotificationDesktopVisible, isNotificationsMobileVisible, status]);

  const handleClose = useCallback(() => {
    if (!isMobile()) {
      dispatchSetMenuMobile({
        response: { isNotificationDesktopVisible: false },
      });
    }
  }, [dispatchSetMenuMobile]);

  return (
    <>
      <div
        onClick={() => {
          dispatchSetMenuMobile({
            response: {
              menuMobile: {
                isNotificationsMobileVisible: !isNotificationsMobileVisible,
              },
            },
          });
        }}
        className={classNames({ [styles['active-notification']]: isNotificationsMobileVisible }, 'notification', 'd-flex-for-mobile')}
      >
        <BellIcon />
        {!!totalUnread && <span className="notification-count">{totalUnread}</span>}
      </div>
      <Dropdown
        className="hide-for-mobile"
        trigger={['click']}
        overlay={<NotificationList onClose={handleClose} />}
        overlayClassName={styles['custom-scrollbar']}
        visible={isNotificationDesktopVisible}
        onVisibleChange={visible =>
          dispatchSetMenuMobile({
            response: { isNotificationDesktopVisible: visible },
          })
        }
      >
        <div className="notification hide-for-mobile">
          <BellIcon />
          {!!totalUnread && <span className="notification-count">{totalUnread}</span>}
        </div>
      </Dropdown>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const { notificationLoadingStatus, paging, menuMobile, isNotificationDesktopVisible, notifications, status } = state.notificationReducer;
  return { notificationLoadingStatus, paging, menuMobile, isNotificationDesktopVisible, notifications, status };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetNotifications: (payload: Payload) => dispatch(getNotifications(payload)),
  dispatchSetMenuMobile: (payload: Payload) => dispatch(setMenuMobile(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
