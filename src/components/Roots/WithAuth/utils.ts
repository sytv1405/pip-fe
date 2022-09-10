import { transform, isEmpty, forEach, isEqual } from 'lodash';

import { isPermitted } from '@/utils/permissionUtils';
import { Organization } from '@/types';

import { SIDEBAR_MENU } from './constants';

export const getDefaultOpenSubMenu = (pathname: string): string | null => {
  const matchedMenuItem = SIDEBAR_MENU.find(
    menuItem =>
      menuItem.href === pathname ||
      menuItem.subMenu?.some(subMenuItem => subMenuItem.href === pathname || (subMenuItem.subPathnames as string[])?.includes(pathname))
  );

  return matchedMenuItem?.subMenu ? matchedMenuItem.key : null;
};

type GetDefaultOpenSubMenusBasicModeParams = {
  menu: any[];
  pathname: string;
  query: Record<string, any>;
};

export const getDefaultOpenSubMenusBasicMode = ({ menu, pathname, query }: GetDefaultOpenSubMenusBasicModeParams): string[] => {
  const openSubMenus = [];

  const getSelectedKeys = (menuItems, parentKeys) => {
    forEach(menuItems, menuItem => {
      if (menuItem.subMenu) {
        getSelectedKeys(menuItem.subMenu, [...(parentKeys || []), menuItem.key]);
      }

      try {
        if (isEqual(JSON.parse(menuItem.key), { pathname, ...(isEmpty(query) ? {} : { query }) })) {
          if (parentKeys) openSubMenus.push(...parentKeys);

          return false;
        }
      } catch (error) {
        return true;
      }

      return true;
    });
  };

  getSelectedKeys(menu, undefined);

  return openSubMenus;
};

export const getPermittedSidebarMenu = ({ role, organization }: { role: string; organization: Organization }) =>
  transform(
    SIDEBAR_MENU,
    (result, menuItem) => {
      if (!menuItem.subMenu) {
        if (isPermitted({ pathname: menuItem.href, role, organization })) {
          result.push(menuItem);
        }
      } else {
        const permittedSubMenu = menuItem.subMenu.filter(subMenuItem => isPermitted({ pathname: subMenuItem.href, role, organization }));

        if (!isEmpty(permittedSubMenu)) {
          result.push({
            ...menuItem,
            subMenu: permittedSubMenu,
          });
        }
      }
    },
    []
  );

export const getDefaultSelectedMenu = (pathname: string): string | null => {
  let selectedMenu = null;

  forEach(SIDEBAR_MENU, menuItem => {
    if (menuItem.href === pathname || (menuItem.subPathnames as string[])?.includes(pathname)) {
      selectedMenu = menuItem.href;
      return false;
    }

    if (menuItem.subMenu) {
      forEach(menuItem.subMenu, subMenuItem => {
        if (subMenuItem.href === pathname || (subMenuItem.subPathnames as string[])?.includes(pathname)) {
          selectedMenu = subMenuItem.href;
          return false;
        }

        return true;
      });
    }

    return true;
  });

  return selectedMenu;
};

type GenerateBasicMenuItemKeyParams = {
  pathname: string;
  query?: Record<string, any>;
};

export const generateBasicMenuItemKey = ({ pathname, query }: GenerateBasicMenuItemKeyParams): string => {
  if (isEmpty(query)) return JSON.stringify({ pathname });

  return JSON.stringify({
    pathname,
    query: transform(
      Object.keys(query).sort(),
      (acc, key) => {
        acc[key] = query[key];
      },
      {}
    ),
  });
};
