import type { AppProps } from 'next/app';
import { ConfigProvider, Modal, ModalProps, Row } from 'antd';
import { Amplify, Auth, Hub, I18n } from 'aws-amplify';
import { Authenticator, View, Image, AmplifyProvider, useAuthenticator, Alert } from '@aws-amplify/ui-react';
import { translate } from '@aws-amplify/ui';
import jaJP from 'antd/lib/locale/ja_JP';
import { connect, ConnectedProps } from 'react-redux';
import '@aws-amplify/ui-react/styles.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import 'moment/locale/ja';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { appWithTranslation, i18n, useTranslation } from 'i18next-config';
import { FullScreenLoadingProvider } from '@/components/FullScreenLoadingContext';
import { amplifyVocabularies } from '@/assets/amplify';
import { wrapper } from '@/redux/store';
import '@/assets/scss/app.scss';
import { getUser } from '@/redux/actions';
import LoadingScreen from '@/components/LoadingScreen';
import { client } from '@/api/client';
import { URL_GET_USER } from '@/shared/endpoints';
import { ROLES } from '@/shared/permissions';
import { paths } from '@/shared/paths';
import { setMode } from '@/utils/storage';
import { MODES } from '@/shared/mode';

Amplify.configure({
  Auth: {
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_WEB_CLIENT_ID,
  },
  Storage: {
    AWSS3: {
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
      region: process.env.NEXT_PUBLIC_AWS_REGION,
    },
  },
  ssr: false,
});

Auth.configure({
  authenticationFlowType: 'USER_PASSWORD_AUTH',
});

// for checking new password !== temporary password
let cachedPassword;

const completeNewPasswordBase = Auth.completeNewPassword.bind(Auth);

Auth.completeNewPassword = (user, password, requiredAttributes, clientMetadata) => {
  if (cachedPassword === password) {
    return Promise.reject(new Error(i18n.t('message_new_password_same_as_temporary_password')));
  }

  return completeNewPasswordBase(user, password, requiredAttributes, clientMetadata);
};

I18n.putVocabularies(amplifyVocabularies);
I18n.setLanguage('ja');

const Logo = () => (
  <View textAlign="center" className="authenticator-logo">
    <Image alt="logo" src="/logo-transparent.png" />
  </View>
);

const Footer = () => (
  <View textAlign="center" className="authenticator-footer">
    © Shift-Seven Consulting Inc.
  </View>
);

function App({ Component, pageProps, dispatchGetUser, user, isLoading }: AppProps & PropsFromRedux) {
  const [modal, setModal] = useState<ModalProps>(null);
  const [t] = useTranslation();
  const isForceChangePasswordRef = useRef(false);

  const router = useRouter();

  const siteTitle = useMemo(() => (process.env.NEXT_PUBLIC_ENV === 'staging' ? `[Staging] ${t('site_title')}` : t('site_title')), [t]);

  const handleSignIn = useCallback(
    async ({ username, password }) => {
      cachedPassword = password;

      try {
        isForceChangePasswordRef.current = false;
        const response = await Auth.signIn(username, password);

        try {
          try {
            await Auth.currentSession();
          } catch (error) {
            isForceChangePasswordRef.current = true;
            return response;
          }

          const {
            data: { organization, userRole },
          } = await client.get(URL_GET_USER, { skip401: true });

          // get user success but organization isDeleted
          if (userRole === ROLES.USER && (!organization || organization?.isDeleted)) {
            await Auth.signOut();

            return Promise.reject(new Error(t('message_user_or_organization_was_deleted')));
          }
        } catch (error) {
          // get user failed => was deleted
          await Auth.signOut();

          return Promise.reject(new Error(t('message_user_or_organization_was_deleted')));
        }

        dispatchGetUser();
        return response;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    [dispatchGetUser, t]
  );

  const handleForgotPassword = useCallback(username => {
    return Auth.forgotPassword(username?.trim());
  }, []);

  const handleForgotPasswordSubmit = useCallback(
    async ({ username, code, password }) => {
      try {
        if (password.length > 99) {
          return Promise.reject(new Error(t('common:message_max_length', { max: 99 })));
        }
        await Auth.forgotPasswordSubmit(username, code, password);
        setModal({
          visible: true,
          onOk: () => {
            // this trigger browser go back to login page
            window.location.reload();
          },
          onCancel: () => window.location.reload(),
        });
        // This error will not show on screen
        return Promise.reject(new Error(t('fake_error_to_stay_on_screen')));
      } catch (error) {
        return Promise.reject(error);
      }
    },
    [t]
  );

  useEffect(() => {
    const fetchUserFirstRender = async () => {
      const currentUser = await Auth.currentUserInfo();

      if (currentUser) {
        dispatchGetUser();
      } else {
        setMode(MODES.BASIC);

        if (router.asPath !== paths.home) {
          router.replace(paths.home);
        }
      }
    };

    if (router.pathname !== paths.forgotPassword) {
      fetchUserFirstRender();
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    Hub.listen('auth', data => {
      if (data.payload.event === 'signIn' && isForceChangePasswordRef.current) {
        dispatchGetUser();
      }
    });
  }, [dispatchGetUser]);

  const page = useMemo(
    () => (
      <ConfigProvider locale={jaJP} autoInsertSpaceInButton={false}>
        <FullScreenLoadingProvider>
          <Component {...pageProps} />
        </FullScreenLoadingProvider>
      </ConfigProvider>
    ),
    [Component, pageProps]
  );

  if (router.pathname === paths.forgotPassword) {
    return (
      <Row align="middle" justify="center" style={{ height: '100vh' }} className="smt-auth-container">
        {page}
      </Row>
    );
  }

  return (
    <AmplifyProvider
      theme={{
        name: 'my-theme',
        tokens: {
          colors: {
            blue: {
              80: { value: '#16962b' },
            },
            font: {
              primary: { value: '#16962b' },
            },
            brand: {
              primary: {
                60: { value: '#16962b' },
                80: { value: '#16962b' },
                90: { value: '#16962b' },
                100: { value: '#16962b' },
              },
            },
          },
        },
      }}
    >
      <Row align="middle" justify="center" style={{ height: '100vh' }} className="smt-auth-container">
        <Authenticator
          loginMechanisms={['email']}
          hideSignUp
          formFields={{
            signIn: {
              username: {
                labelHidden: false,
                placeholder: t('email_placeholder'),
              },
              password: {
                labelHidden: false,
                placeholder: t('password_placeholder'),
              },
            },
            resetPassword: {
              username: {
                label: t('email'),
                labelHidden: false,
              },
            },
            confirmResetPassword: {
              confirmation_code: {
                label: t('enter_code'),
                labelHidden: false,
                placeholder: t('enter_code_placeholder'),
              },
              password: {
                labelHidden: false,
                isRequired: true,
                label: t('enter_newpass'),
                placeholder: t('enter_newpass_placeholder'),
              },
              confirm_password: {
                labelHidden: false,
                label: t('enter_newpass_confirm'),
                placeholder: t('enter_newpass_confirm_placeholder'),
              },
            },
            forceNewPassword: {
              password: {
                labelHidden: false,
                isRequired: true,
                label: t('enter_newpass'),
                placeholder: t('enter_newpass_placeholder'),
              },
              confirm_password: {
                labelHidden: false,
                label: t('enter_newpass_confirm'),
                placeholder: t('enter_newpass_confirm_placeholder'),
              },
            },
          }}
          components={{
            Footer,
            SignIn: {
              Header: () => (
                <>
                  <Head>
                    <title>{`${t('title_login')} | ${siteTitle}`}</title>
                  </Head>
                  <Logo />
                  <h2 className="authenticator-title mb-0 pt-5 mt-2">{t('title_login')}</h2>
                </>
              ),
            },
            ResetPassword: {
              Header: () => (
                <>
                  <Head>
                    <title>{`${t('title_reset_password')} | ${siteTitle}`}</title>
                  </Head>
                  <Logo />
                  <h2 className="authenticator-title">{t('title_reset_password')}</h2>
                </>
              ),
            },
            ConfirmResetPassword: {
              Header: () => (
                <>
                  <Head>
                    <title>{`${t('title_reset_password')} | ${siteTitle}`}</title>
                  </Head>
                  <Logo />
                  <h2 className="authenticator-title">{t('title_reset_password')}</h2>
                  <style>
                    {`.amplify-passwordfield:nth-child(2):after {
                        content: '${t('password_note')}';
                        font-size: 12px;
                        color: $text-color;
                      }
                    `}
                  </style>
                </>
              ),
            },
            ForceNewPassword: {
              FormFields() {
                const { error } = useAuthenticator();

                return (
                  <>
                    <Head>
                      <title>{`${t('enter_newpass')} | ${siteTitle}`}</title>
                    </Head>
                    <Logo />
                    <Authenticator.ForceNewPassword.FormFields />
                    {/* Hide non-translated error message */}
                    <style>
                      {`.forceNewPasswordErrorText, 
                        .amplify-heading {
                          display: none;
                        }
                        .amplify-passwordfield:first-child:after {
                          content: '${t('password_note')}';
                          font-size: 12px;
                          color: $text-color;
                        }
                      `}
                    </style>
                    {/* Show translated error message  */}
                    {error ? (
                      <Alert variation="error" isDismissible={true}>
                        {translate(error)}
                      </Alert>
                    ) : null}
                  </>
                );
              },
            },
          }}
          services={{
            handleSignIn,
            handleForgotPassword,
            handleForgotPasswordSubmit,
          }}
        >
          {() => (isLoading || isEmpty(user) ? <LoadingScreen /> : <>{page}</>)}
        </Authenticator>
      </Row>
      <Modal
        centered
        title={t('reset_password_success_title')}
        cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: 'block' }, className: 'mn-w180p mx-auto mb-2' }}
        okText={t('reset_password_success_submit')}
        className="text-center amplify-modal-reset-password-success"
        width={600}
        {...modal}
      >
        {/* This style to hide Fake Error */}
        <style>
          {`.amplify-alert {
            display: none;
          }`}
        </style>
        <p className="text-pre-line mb-0">{t('reset_password_success_message')}</p>
      </Modal>
    </AmplifyProvider>
  );
}

const mapStateToProps = state => {
  const { user, isLoading } = state.authReducer;
  return { user, isLoading };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetUser: () => dispatch(getUser()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default wrapper.withRedux(connector(appWithTranslation(App)));
