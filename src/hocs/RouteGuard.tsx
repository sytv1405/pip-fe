import React from 'react';
import { connect } from 'react-redux';
import { useRouter } from 'next/router';

import { isPermitted } from '@/utils/permissionUtils';
import { ALL_MODES_PATHNAMES, BASIC_MODE_ONLY_PATHNAMES, paths } from '@/shared/paths';
import LoadingScreen from '@/components/LoadingScreen';
import { getMode, setMode } from '@/utils/storage';
import { MODES } from '@/shared/mode';
import { isMobile } from '@/utils/breakpointUtils';
import PageNotAllowedOnMobile from '@/components/PageNotAllowedOnMobile';

interface WrappedComponentProps {
  user: Record<string, any>;
  isLoading: boolean;
}

const RouteGuard = (Component: React.FC<any>) => {
  const WrappedComponent = ({ user }: WrappedComponentProps) => {
    const router = useRouter();
    const { pathname } = router;
    const mode = getMode();

    if (!isPermitted({ role: user.userRole, pathname: router.pathname, organization: user.organization })) {
      router.replace(paths.home);
      return <LoadingScreen />;
    }

    if (isMobile() && !([...BASIC_MODE_ONLY_PATHNAMES, ...ALL_MODES_PATHNAMES] as string[]).includes(pathname)) {
      setMode(MODES.BASIC);
      return <PageNotAllowedOnMobile />;
    }

    if (mode === MODES.BASIC && !([...BASIC_MODE_ONLY_PATHNAMES, ...ALL_MODES_PATHNAMES] as string[]).includes(pathname)) {
      setMode(MODES.MANAGEMENT);
    }

    if (mode === MODES.MANAGEMENT && (BASIC_MODE_ONLY_PATHNAMES as string[]).includes(pathname)) {
      setMode(MODES.BASIC);
    }

    return <Component />;
  };

  const mapStateToProps = (state: any) => ({
    user: state.authReducer.user,
  });

  return connect(mapStateToProps)(WrappedComponent);
};

export default RouteGuard;
