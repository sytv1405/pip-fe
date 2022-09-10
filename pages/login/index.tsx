// import { WithAuth } from '@/components/Roots/WithAuth'
import { Input, Button } from 'antd';
import Link from 'next/link';

const Login = () => {
  return (
    <>
      <section
        className="section ant-card ant-card-bordered"
        role="application"
        style={{
          width: 400,
          marginTop: 80,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div className="ant-card-body">
          <div className="form-section-header">
            <h1 className="logo logo-login">ヤルコト</h1>
            <h3 className="header" data-test="sign-in-header-section">
              ログイン
            </h3>
          </div>
          <div className="auth-fields">
            <div className="form-field" style={{ marginBottom: 16 }}>
              <div className="form-field-label">
                <label className="label" htmlFor="username">
                  メールアドレス *
                </label>
              </div>
              <div>
                <Input
                  placeholder="メールアドレスを入力"
                  id="username"
                  name="username"
                  className="input"
                  data-test="sign-in-username-input"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <div className="form-field-label">
                <label className="label" htmlFor="password">
                  パスワード *
                </label>
              </div>
              <div>
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを入力"
                  name="password"
                  className="input"
                  data-test="sign-in-password-input"
                />
              </div>
              <div>
                パスワードをお忘れですか？
                <Link href="/">
                  <a className="btn-link">パスワードをリセット</a>
                </Link>
              </div>
            </div>
          </div>
          <div>
            <div slot="amplify-form-section-footer" className="sign-in-form-footer">
              <div className="full-width-footer-content">
                <Button type="primary" style={{ width: '100%', display: 'block' }}>
                  ログイン
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
