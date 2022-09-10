const withTM = require('next-transpile-modules')(['@fullcalendar/common', '@fullcalendar/daygrid', '@fullcalendar/react']);

module.exports = withTM({
  reactStrictMode: true,
  eslint: {
    dirs: ['pages', 'src'],
  },
  env: {
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
    NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    NEXT_PUBLIC_COGNITO_WEB_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_WEB_CLIENT_ID,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_FRONT_BASE_URL: process.env.NEXT_PUBLIC_FRONT_BASE_URL,
    PORT: process.env.PORT,
    I18N_INPUT: './[ProjectName] Messages List.xlsx',
    I18N_SHEETS: 'Locale Messages,Server Error Messages',
    I18N_OUTPUT: './public/static/locales',
  },
  webpack: config => {
    config.module.rules.push(
      {
        test: /\.(jpe?g|png|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name]_[hash].[ext]',
          publicPath: `/_next/static/files`,
          outputPath: 'static/files',
        },
      },
      {
        test: /\.svg$/,
        loader: '@svgr/webpack',
        options: {
          name: '[name]_[hash].[ext]',
          publicPath: `/_next/static/files`,
          outputPath: 'static/files',
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
            ],
          },
        },
      }
    );
    return config;
  },
});
