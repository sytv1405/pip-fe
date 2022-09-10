import { ReactNode, useRef, useLayoutEffect, useMemo, useState, useEffect, useCallback, Dispatch } from 'react';
import Head from 'next/head';
import { Button, Col, Collapse, Drawer, Dropdown, Input, Layout as AntdLayout, Menu, Row, Select, Typography } from 'antd';
import Link from 'next/link';
import 'antd/dist/antd.css';
import { useRouter } from 'next/dist/client/router';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { range } from 'lodash';
import moment from 'moment';

import {
  CalendarCheckIcon,
  DownIcon,
  HomeIcon,
  LineCaretDownIcon,
  LineCaretUpIcon,
  Logo,
  LogoMobile,
  MenuMobileCloseIcon,
  MenuMobileIcon,
  ScreenCheckIcon,
  SearchIcon,
  UpIcon,
} from '@/assets/images';
import { useTranslation } from 'i18next-config';
import { setMenuMobile } from '@/redux/actions';
import { Action, Payload } from '@/types';
import { normalizeSearchParams } from '@/components/pages/tasks/transformValue';
import { paths } from '@/shared/paths';
import { getMode, setMode, setTaskFilterParams } from '@/utils/storage';
import { convertToDateJP } from '@/shared/calendar';
import { MODES } from '@/shared/mode';
import { getBusinessUnitsRelative } from '@/redux/actions/businessUnitActions';
import LoadingScreen from '@/components/LoadingScreen';
import { LOADING_STATUSES } from '@/shared/loading';
import { Notifications } from '@/components/pages/home/Notifications';
import { monthYearFormat } from '@/shared/constants';
import NotificationList from '@/components/pages/home/Notifications/NotificationList';
import { RootState } from '@/redux/rootReducer';
import { isMobile } from '@/utils/breakpointUtils';

import {
  generateBasicMenuItemKey,
  getDefaultOpenSubMenu,
  getDefaultOpenSubMenusBasicMode,
  getDefaultSelectedMenu,
  getPermittedSidebarMenu,
} from './utils';
import styles from './styles.module.scss';

export type PropsType = PropsFromRedux & {
  children: ReactNode;
  title: string;
  onPressLogout: () => void;
  isContentFullWidth?: boolean;
  hasSidebar?: boolean;
  headerBottom?: ReactNode;
};

const Layout = ({
  children,
  title,
  onPressLogout,
  isContentFullWidth = false,
  hasSidebar = true,
  headerBottom,
  user,
  businessUnitsRelativeLoadingStatus,
  businessUnitsRelative,
  dispatchGetBusinessUnitRelative,
  menuMobile: { isMenuMobileVisible, isNotificationsMobileVisible },
  dispatchSetMenuMobile,
}: PropsType) => {
  const [t] = useTranslation('common');
  const router = useRouter();
  const { pathname, query } = router;
  const headerBottomRef = useRef<HTMLDivElement>();
  const contentInnerRef = useRef<HTMLDivElement>();
  const mode = getMode() || MODES.BASIC;

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const siteTitle = process.env.NEXT_PUBLIC_ENV === 'staging' ? `[Staging] ${t('site_title')}` : t('site_title');

  const permittedSidebarMenu = useMemo(() => getPermittedSidebarMenu({ role: user.userRole, organization: user.organization }), [user]);

  const basicModeSidebarMenu = useMemo(
    () => [
      {
        title: 'page_home',
        href: paths.home,
        key: generateBasicMenuItemKey({ pathname: paths.home }),
        icon: <HomeIcon />,
      },
      {
        title: 'page_task_by_deadline',
        key: 'page_task_by_deadline',
        icon: <CalendarCheckIcon />,
        subMenu: [
          {
            title: 'page_monthly_task',
            key: 'page_monthly_task',
            subMenu: [
              ...range(12).map(num => {
                const displayMonth = moment().add(num, 'months');
                const monthYear = displayMonth.format(monthYearFormat);
                const urlObject = {
                  pathname: paths.tasks.monthly,
                  query: { date: monthYear },
                };
                return {
                  title: convertToDateJP(displayMonth, 'yearMonth'),
                  href: urlObject,
                  key: generateBasicMenuItemKey(urlObject),
                };
              }),
              {
                className: 'ant-menu-divider',
              },
              {
                title: 'page_task_one_year_later',
                key: 'page_task_one_year_later',
                subMenu: range(12).map(num => {
                  const displayMonth = moment().add(1, 'year').add(num, 'months');
                  const monthYear = displayMonth.format(monthYearFormat);
                  const urlObject = {
                    pathname: paths.tasks.monthly,
                    query: { date: monthYear },
                  };
                  return {
                    title: convertToDateJP(displayMonth, 'yearMonth'),
                    href: urlObject,
                    key: generateBasicMenuItemKey(urlObject),
                  };
                }),
              },
              {
                title: 'page_task_one_year_before',
                key: 'page_task_one_year_before',
                subMenu: range(12).map(num => {
                  const displayMonth = moment().subtract(1, 'year').add(num, 'months');
                  const monthYear = displayMonth.format(monthYearFormat);
                  const urlObject = {
                    pathname: paths.tasks.monthly,
                    query: { date: monthYear },
                  };
                  return {
                    title: convertToDateJP(displayMonth, 'yearMonth'),
                    href: urlObject,
                    key: generateBasicMenuItemKey(urlObject),
                  };
                }),
              },
            ],
          },
          {
            title: 'page_task_in_one_month',
            href: paths.tasks.businessInMonth,
            key: generateBasicMenuItemKey({ pathname: paths.tasks.businessInMonth }),
          },
          {
            title: 'page_task_in_one_year',
            href: paths.tasks.businessInYear,
            key: generateBasicMenuItemKey({ pathname: paths.tasks.businessInYear }),
          },
        ],
      },
      {
        title: t('page_view_task_by_business_unit'),
        key: 'page_view_task_by_business_unit',
        icon: <ScreenCheckIcon />,
        subMenu:
          businessUnitsRelative?.map(department => {
            const taskByDepartmentUrlObject = {
              pathname: paths.tasksByBusinessUnit,
              query: {
                departmentId: department.id.toString(),
              },
            };

            let taskNoUnitMenu;

            if (department.hasTaskNoUnit) {
              const taskNoUnitUrlObject = {
                pathname: paths.tasksByBusinessUnit,
                query: {
                  departmentId: department.id.toString(),
                  onlyBelongToDepartment: 'true',
                },
              };

              taskNoUnitMenu = {
                title: t('no_business_unit'),
                href: taskNoUnitUrlObject,
                key: generateBasicMenuItemKey(taskNoUnitUrlObject),
              };
            }

            return {
              title: department.name,
              key: `/departments/${department.id}`,
              subMenu: [
                {
                  title: t('all'),
                  href: taskByDepartmentUrlObject,
                  key: generateBasicMenuItemKey(taskByDepartmentUrlObject),
                },
                ...(taskNoUnitMenu ? [taskNoUnitMenu] : []),
                ...(department.majorCategories?.map(majorCategory => {
                  const taskByLargeBusinessUnitUrlObject = {
                    pathname: paths.tasksByBusinessUnit,
                    query: {
                      departmentId: department.id.toString(),
                      majorCategoryId: majorCategory.id.toString(),
                    },
                  };

                  let taskOnlyBelongMajor;

                  if (majorCategory.hasTaskNoUnit) {
                    const majorTaskUrlObject = {
                      pathname: paths.tasksByBusinessUnit,
                      query: {
                        departmentId: department.id.toString(),
                        majorCategoryId: majorCategory.id.toString(),
                        onlyBelongToMajor: 'true',
                      },
                    };

                    taskOnlyBelongMajor = {
                      title: t('belong_to_only_major', { majorName: majorCategory.name }),
                      href: majorTaskUrlObject,
                      key: generateBasicMenuItemKey(majorTaskUrlObject),
                    };
                  }

                  return {
                    title: majorCategory.name,
                    key: `/departments/${department.id}/largeBusinessUnits/${majorCategory.id}`,
                    subMenu: [
                      {
                        title: t('all'),
                        href: taskByLargeBusinessUnitUrlObject,
                        key: generateBasicMenuItemKey(taskByLargeBusinessUnitUrlObject),
                      },
                      ...(taskOnlyBelongMajor ? [taskOnlyBelongMajor] : []),
                      ...(majorCategory.middleCategories?.map(middleCategory => {
                        const taskByMediumBusinessUnitUrlObject = {
                          pathname: paths.tasksByBusinessUnit,
                          query: {
                            departmentId: department.id.toString(),
                            majorCategoryId: majorCategory.id.toString(),
                            middleCategoryId: middleCategory.id.toString(),
                          },
                        };

                        return {
                          title: middleCategory.name,
                          href: taskByMediumBusinessUnitUrlObject,
                          key: generateBasicMenuItemKey(taskByMediumBusinessUnitUrlObject),
                        };
                      }) || []),
                    ],
                  };
                }) || []),
              ],
            };
          }) || [],
      },
    ],
    [businessUnitsRelative, t]
  );

  const renderMenuItem = useCallback(
    menuItem => {
      if (menuItem.subMenu) {
        return (
          <Menu.SubMenu
            key={menuItem.key}
            title={menuItem.href ? <Link href={menuItem.href}>{t(menuItem.title)}</Link> : t(menuItem.title)}
            icon={menuItem.icon}
          >
            {menuItem.subMenu.map(subMenuItem => renderMenuItem(subMenuItem))}
          </Menu.SubMenu>
        );
      }

      return (
        <Menu.Item key={menuItem.key || menuItem.href} icon={menuItem.icon} className={menuItem.className}>
          {menuItem.href ? <Link href={menuItem.href}>{t(menuItem.title)}</Link> : t(menuItem.title)}
        </Menu.Item>
      );
    },
    [t]
  );

  const menu = useMemo(
    () => (
      <div>
        {mode === MODES.BASIC ? (
          <div className={classNames(styles.menu, styles['menu--basic'])}>
            <Menu
              mode="inline"
              defaultSelectedKeys={[generateBasicMenuItemKey({ pathname, query })]}
              defaultOpenKeys={getDefaultOpenSubMenusBasicMode({ menu: basicModeSidebarMenu, pathname, query })}
            >
              {basicModeSidebarMenu.map(menuItem => renderMenuItem(menuItem))}
            </Menu>
          </div>
        ) : (
          <div className={classNames(styles.menu, styles['menu--management'])}>
            <Menu
              defaultSelectedKeys={[getDefaultSelectedMenu(pathname)]}
              defaultOpenKeys={[getDefaultOpenSubMenu(pathname)]}
              mode="inline"
            >
              {permittedSidebarMenu.map(menuItem => renderMenuItem(menuItem))}
            </Menu>
          </div>
        )}
        <svg height={0} width={0}>
          <clipPath id="menu-active-before">
            <path
              d="M284.545,285.516h-10a10.075,10.075,0,0,0,2.014-.2,9.947,9.947,0,0,0,3.576-1.5,10.031,10.031,0,0,0,3.624-4.4,9.951,9.951,0,0,0,.583-1.877,10.078,10.078,0,0,0,.2-1.977v9.963Z"
              transform="translate(-274.545 -275.553)"
            />
          </clipPath>
          <clipPath id="menu-active-after">
            <path d="M10,0H0A10.075,10.075,0,0,1,2.014.2,9.95,9.95,0,0,1,3.891.786a10,10,0,0,1,1.7.922,10.073,10.073,0,0,1,1.48,1.221A10.073,10.073,0,0,1,8.292,4.41a10,10,0,0,1,.922,1.7A9.951,9.951,0,0,1,9.8,7.986,10.078,10.078,0,0,1,10,9.963V0Z" />
          </clipPath>
        </svg>
      </div>
    ),
    [basicModeSidebarMenu, mode, pathname, permittedSidebarMenu, query, renderMenuItem]
  );

  const handleSearchTask = (keyword: string): void => {
    setTaskFilterParams(normalizeSearchParams({ keyword }));
    router.push(paths.tasks.search);
  };

  const handleSwitchMode = (newMode: string) => {
    setMode(newMode);
    setTaskFilterParams(normalizeSearchParams({}));
    router.push(paths.home);
  };

  useLayoutEffect(() => {
    if (headerBottomRef.current && contentInnerRef.current) {
      contentInnerRef.current.style.marginTop = `${headerBottomRef.current.offsetHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (mode === MODES.BASIC) {
      dispatchGetBusinessUnitRelative();
    }
  }, [dispatchGetBusinessUnitRelative, mode]);

  useEffect(() => {
    const handleRouteCompleted = () => {
      if (isMobile()) {
        dispatchSetMenuMobile({ response: { isMenuMobileVisible: false, hasModalNotification: false } });
      } else {
        dispatchSetMenuMobile({ response: { isNotificationDesktopVisible: false } });
      }
    };

    router.events.on('routeChangeComplete', handleRouteCompleted);

    return () => {
      router.events.off('routeChangeComplete', handleRouteCompleted);
    };
  }, [dispatchSetMenuMobile, router.events]);

  return (
    <>
      {businessUnitsRelativeLoadingStatus === LOADING_STATUSES.LOADING && <LoadingScreen />}
      <Head>
        <title>{`${title} | ${siteTitle}`}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />{' '}
        <link rel="icon" type="image/vnd.microsoft.icon" href="images/favicon.ico" />
      </Head>
      <AntdLayout className={styles.layout}>
        <AntdLayout.Header className={styles.header}>
          <Row align="middle" className={styles['header-inner']}>
            <Col flex="0 0 240px" className={classNames(styles['logo-column'], 'hide-for-mobile')}>
              <Link href="/">
                <a className={styles['logo-container']}>
                  <Logo />
                </a>
              </Link>
              <div className={classNames(styles['company-name'], 'hide-for-mobile')}>{user?.organization?.name}</div>
            </Col>
            <Col className="d-flex-for-mobile align-items-center">
              <Link href="/">
                <a className={styles['logo-mobile']}>
                  <LogoMobile />
                </a>
              </Link>
            </Col>
            <Col>
              <h2 className={styles['page-title']}>{title}</h2>
            </Col>
            <Col className="d-flex ml-auto">
              <div className={styles['notification-wrapper']}>
                <Notifications />
              </div>
            </Col>
            <Col className="hide-for-mobile mr-3">
              <Dropdown
                trigger={['click']}
                overlayClassName={styles['user-dropdown']}
                overlay={
                  <Menu className={classNames(styles['user-dropdown-menu'], 'px-2')}>
                    <Menu.Item onClick={onPressLogout} className="text-common">
                      {t('logout')}
                    </Menu.Item>
                    {/* TODO: Implement display only logout */}
                    {/* <Divider className="m-0" /> */}
                    {/* <Menu.Item className="text-common">{t('edit_user_info')}</Menu.Item> */}
                  </Menu>
                }
              >
                <Button
                  type="text"
                  className={classNames(styles['user-dropdown-button'], 'px-0')}
                  onClick={() => setIsMenuVisible(!isMenuVisible)}
                >
                  {`${user?.name}${t('header_user_suffix')}`}
                  {isMenuVisible ? <LineCaretUpIcon className="ml-2" /> : <LineCaretDownIcon className="ml-2" />}
                </Button>
              </Dropdown>
            </Col>
            <Col flex="0 0 250px" className={classNames('hide-for-mobile', 'd-flex')}>
              <Input.Search
                className={styles['search-box']}
                placeholder={t('placeholder_search_task')}
                onSearch={handleSearchTask}
                enterButton={<SearchIcon />}
              />
            </Col>
            <Col className="px-0 d-flex-for-mobile">
              <button
                className={classNames(styles['button-menu-mobile'])}
                onClick={() => {
                  dispatchSetMenuMobile({
                    response: { menuMobile: { isMenuMobileVisible: !isMenuMobileVisible, isNotificationsMobileVisible: false } },
                  });
                }}
              >
                {isMenuMobileVisible ? <MenuMobileCloseIcon /> : <MenuMobileIcon />}
              </button>
            </Col>
          </Row>
        </AntdLayout.Header>
        {headerBottom && (
          <div className={styles['header-bottom']} ref={headerBottomRef}>
            {headerBottom}
          </div>
        )}
        {hasSidebar && (
          <AntdLayout.Sider theme="light" width={240} className={styles.sider}>
            <div className={classNames(styles['select-mode'], styles[`select-mode--${mode}`])}>
              <Select
                value={mode}
                options={[
                  { label: t('basic_mode'), value: MODES.BASIC },
                  { label: t('management_mode'), value: MODES.MANAGEMENT },
                ]}
                onChange={handleSwitchMode}
                suffixIcon={<DownIcon />}
                getPopupContainer={node => node.parentNode}
              />
            </div>
            {businessUnitsRelativeLoadingStatus !== LOADING_STATUSES.LOADING && menu}
          </AntdLayout.Sider>
        )}
        <Drawer
          visible={isMenuMobileVisible || isNotificationsMobileVisible}
          onClose={() => {
            dispatchSetMenuMobile({ response: { isMenuMobileVisible: false, hasModalNotification: false } });
          }}
          className={classNames(
            styles['menu-mobile-drawer'],
            { [styles['notification-mobile-drawer']]: isNotificationsMobileVisible },
            'd-block-for-mobile'
          )}
          closable={false}
        >
          {!!isNotificationsMobileVisible && <NotificationList />}
          {isMenuMobileVisible && (
            <>
              <Typography.Paragraph className="mb-0">{user?.organization?.name}</Typography.Paragraph>
              <Collapse
                ghost
                expandIconPosition="right"
                className={styles['user-collapse']}
                expandIcon={({ isActive }) => (isActive ? <UpIcon /> : <DownIcon />)}
              >
                <Collapse.Panel key={1} header={`${user?.name}${t('header_user_suffix')}`}>
                  <Menu>
                    <Menu.Item onClick={onPressLogout}>{t('logout')}</Menu.Item>
                    {/* TODO: Implement display only logout */}
                    {/* <Menu.Item className="text-common">{t('edit_user_info')}</Menu.Item> */}
                  </Menu>
                </Collapse.Panel>
              </Collapse>
              <Input.Search
                className={styles['search-box']}
                placeholder={t('placeholder_search_task')}
                onSearch={handleSearchTask}
                enterButton={<SearchIcon />}
              />
              <div className="mt-3">{businessUnitsRelativeLoadingStatus !== LOADING_STATUSES.LOADING && menu}</div>
            </>
          )}
        </Drawer>
        <AntdLayout
          className={classNames(styles.main, {
            [styles['main--has-sidebar']]: hasSidebar,
          })}
        >
          <AntdLayout.Content className={styles.content} style={{ maxWidth: isContentFullWidth ? null : 1000 }}>
            <div ref={contentInnerRef}>{children}</div>
          </AntdLayout.Content>
          <AntdLayout.Footer className="text-center text-minimum font-weight-medium">
            {user?.userRole === 'SERVICE_ADMIN' ? (
              <Link href="/admin">© Shift-Seven Consulting Inc.</Link>
            ) : (
              <div>© Shift-Seven Consulting Inc.</div>
            )}
          </AntdLayout.Footer>
        </AntdLayout>
      </AntdLayout>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const { user } = state.authReducer;
  const { businessUnitsRelative, businessUnitsRelativeLoadingStatus } = state.businessUnitReducer;
  const { menuMobile } = state.notificationReducer;
  return { user, businessUnitsRelative, businessUnitsRelativeLoadingStatus, menuMobile };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetBusinessUnitRelative: () => dispatch(getBusinessUnitsRelative()),
  dispatchSetMenuMobile: (payload: Payload) => dispatch(setMenuMobile(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
