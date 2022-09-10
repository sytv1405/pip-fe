import { Spin } from 'antd';
import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingScreen = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgb(240, 242, 245, 0.6)',
        fontSize: '18px',
        zIndex: 10,
      }}
    >
      <Spin indicator={<LoadingOutlined spin />} />
    </div>
  );
};
export default LoadingScreen;
