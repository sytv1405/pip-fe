import { connect, ConnectedProps } from 'react-redux';

import { ROLES } from '@/shared/permissions';
import LoadingScreen from '@/components/LoadingScreen';

import EditUserOrganization from './edit-admin-organization';
import EditUserService from './edit-admin-service';

const EditUser = ({ user, isLoading }: PropsFromRedux) => {
  const { userRole } = user;
  if (isLoading) return <LoadingScreen />;
  if (userRole === ROLES.ORGANIZATION_ADMIN) return <EditUserOrganization />;
  if (userRole === ROLES.SERVICE_ADMIN) return <EditUserService />;

  return null;
};

const mapStateToProps = (state: any) => {
  const { isLoading, user } = state.authReducer;
  return { isLoading, user };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
export default connector(EditUser);
