import { useSelector } from 'react-redux';

import { RootState } from '@/redux/rootReducer';
import { Organization } from '@/types';

export default function useIsOrganizationDeleted() {
  const organization = useSelector<RootState>(state => state.authReducer.user?.organization);

  return !!(organization as Organization)?.deletedAt;
}
