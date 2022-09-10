import { combineReducers } from 'redux';

import authReducer from './reducers/authReducer';
import departmentReducer from './reducers/departmentReducer';
import organizationReducer from './reducers/organizationReducer';
import userManagementReducer from './reducers/userManagementReducer';
import businessUnitReducer from './reducers/businessUnitReducer';
import businessUnitSearchReducer from './reducers/businessUnitSearchReducer';
import regulationReducer from './reducers/regulationReducer';
import regulationTypeReducer from './reducers/regulationTypeReducer';
import taskReducer from './reducers/taskReducer';
import notificationReducer from './reducers/notificationReducer';

const rootReducers = combineReducers({
  authReducer,
  departmentReducer,
  organizationReducer,
  userManagementReducer,
  businessUnitReducer,
  businessUnitSearchReducer,
  regulationReducer,
  regulationTypeReducer,
  taskReducer,
  notificationReducer,
});

export default rootReducers;

export type RootState = ReturnType<typeof rootReducers>;
