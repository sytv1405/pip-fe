import { connect, ConnectedProps } from 'react-redux';

import UserManagementService from '@/components/pages/masters/users/admin-service';
import UserManagementOrganization from '@/components/pages/masters/users/admin-organization';
import { ROLES } from '@/shared/permissions';
import LoadingScreen from '@/components/LoadingScreen';

const UserManagement = ({ user, isLoading }: PropsFromRedux) => {
  const { userRole } = user;
  if (isLoading) return <LoadingScreen />;
  if (userRole === ROLES.ORGANIZATION_ADMIN) return <UserManagementOrganization />;
  if (userRole === ROLES.SERVICE_ADMIN) return <UserManagementService />;

  return null;
};

const mapStateToProps = (state: any) => {
  const { isLoading, user } = state.authReducer;
  return { isLoading, user };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
export default connector(UserManagement);
