import { AddTaskIcon, HomeIcon, SearchTaskIcon, SettingIcon, TreeIcon } from '@/assets/images';
import { paths } from '@/shared/paths';

export const SIDEBAR_MENU = [
  {
    title: 'page_home',
    href: paths.home,
    icon: <HomeIcon />,
    className: 'hide-for-mobile',
  },
  {
    title: 'page_business_unit_search',
    href: paths.businessUnitSearch,
    icon: <TreeIcon />,
  },
  {
    title: 'page_task_search',
    href: paths.tasks.search,
    icon: <SearchTaskIcon />,
    subPathnames: [paths.tasks.selection, paths.tasks.bulkUpdate],
  },
  {
    title: 'page_task_add',
    href: paths.tasks.new,
    icon: <AddTaskIcon />,
  },
  {
    title: 'page_setting',
    key: 'masters',
    icon: <SettingIcon />,
    subMenu: [
      {
        title: 'page_department',
        href: paths.master.departments.index,
        subPathnames: [paths.master.departments.edit],
      },
      {
        title: 'page_business_unit',
        href: paths.master.businessUnit.index,
        subPathnames: [paths.master.businessUnit.largeEdit, paths.master.businessUnit.mediumEdit, paths.master.businessUnit.smallEdit],
      },
      {
        title: 'page_regulation',
        href: paths.master.regulations.index,
        subPathnames: [paths.master.regulations.edit],
      },
      {
        title: 'page_regulation_type',
        href: paths.master.regulationTypes.index,
      },
      {
        title: 'page_task_batch_registration',
        href: paths.master.tasksBatchRegistration,
      },
      {
        title: 'page_user_organization',
        href: paths.master.userOrganizations.index,
        subPathnames: [paths.master.userOrganizations.edit],
      },
      {
        title: 'page_user',
        href: paths.master.users.index,
        subPathnames: [paths.master.users.edit],
      },
      {
        title: 'page_transaction_batch_registration',
        href: paths.master.transactionBatchRegistration,
      },
    ],
  },
];
