import React from 'react';
import { Auth } from 'aws-amplify';
import { useDispatch } from 'react-redux';

import { clearUser } from '@/redux/actions';
import { paths } from '@/shared/paths';

import Layout, { PropsType as LayoutProps } from './Layout';

type PropsType = Pick<LayoutProps, 'children' | 'title' | 'isContentFullWidth' | 'hasSidebar' | 'headerBottom'>;

export const WithAuth = (props: PropsType) => {
  const dispatch = useDispatch();

  const onPressLogout = async () => {
    if (window.confirm('本当にログアウトしますか？')) {
      try {
        dispatch(clearUser());
        await Auth.signOut();
        localStorage.clear();
        window.location.replace(paths.home);
      } catch (error) {
        console.error('error signing out: ', error);
      }
    }
  };

  return <Layout {...props} onPressLogout={onPressLogout} />;
};
