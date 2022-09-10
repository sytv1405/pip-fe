import axiosBase, { AxiosRequestConfig } from 'axios';
import { Auth } from 'aws-amplify';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

import { i18n } from 'i18next-config';
import message from '@/utils/message';

const axios = axiosBase.create();

const makeUrl = (endpoint: string) => {
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}`;
};

const makeHeaders = (idToken: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${idToken}`,
});

const handleErrorStatus = (error: any) => {
  const status = error?.status || error?.response?.status || null;

  switch (status) {
    case 401:
      if (!error?.config?.skip401) {
        Auth.signOut();
        message.error(i18n.t('message_unauthorized'));
      }
      return error?.response;
    case 403:
      message.error(i18n.t('message_unauthorized'));
      return error?.response;
    case 400:
    case 422:
      return error?.response?.data;
    default:
      return error?.response;
  }
};

const getSession = async (): Promise<CognitoUserSession> => {
  try {
    const session = await Auth.currentSession();
    return session;
  } catch (error) {
    return null;
  }
};

axios.interceptors.response.use(
  response => response?.data,
  error => Promise.reject(handleErrorStatus(error))
);

type RequestConfig = AxiosRequestConfig & { skip401?: boolean };

export const client = {
  get: async <T = any>(endPoint: string, config?: RequestConfig): Promise<T> => {
    const session = await getSession();
    if (!session) {
      Auth.signOut();
      message.error(i18n.t('message_unauthorized'));
    }

    const idToken = session.getIdToken().getJwtToken();
    return axios.get<T, T>(makeUrl(endPoint), {
      headers: makeHeaders(idToken),
      ...config,
    });
  },

  post: async <T = any>(endPoint: string, data?: any, config?: RequestConfig): Promise<T> => {
    const session = await getSession();
    if (!session) {
      Auth.signOut();
      message.error(i18n.t('message_unauthorized'));
    }

    const idToken = session.getIdToken().getJwtToken();
    return axios.post<T, T>(makeUrl(endPoint), data, {
      headers: makeHeaders(idToken),
      ...config,
    });
  },

  patch: async <T = any>(endPoint: string, data?: any, config?: RequestConfig): Promise<T> => {
    const session = await getSession();
    if (!session) {
      Auth.signOut();
      message.error(i18n.t('message_unauthorized'));
    }

    const idToken = session.getIdToken().getJwtToken();
    return axios.patch<T, T>(makeUrl(endPoint), data, {
      headers: makeHeaders(idToken),
      ...config,
    });
  },

  put: async <T = any>(endPoint: string, data?: any, config?: RequestConfig): Promise<T> => {
    const session = await getSession();
    if (!session) {
      Auth.signOut();
      message.error(i18n.t('message_unauthorized'));
    }

    const idToken = session.getIdToken().getJwtToken();
    return axios.put<T, T>(makeUrl(endPoint), data, {
      headers: makeHeaders(idToken),
      ...config,
    });
  },

  delete: async <T = any>(endPoint: string, config?: RequestConfig): Promise<T> => {
    const session = await getSession();
    if (!session) {
      Auth.signOut();
      message.error(i18n.t('message_unauthorized'));
    }

    const idToken = session.getIdToken().getJwtToken();
    return axios.delete<T, T>(makeUrl(endPoint), {
      headers: makeHeaders(idToken),
      ...config,
    });
  },
};
