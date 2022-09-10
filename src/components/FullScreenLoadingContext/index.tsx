import React, { useContext, createContext, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

export const FullScreenLoadingContext = createContext<{
  setVisible: (visible: boolean) => void;
}>({} as any);

export const FullScreenLoadingProvider: React.FC = ({ children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <FullScreenLoadingContext.Provider value={{ setVisible }}>
      {children}
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingOutlined spin style={{ color: 'white', fontSize: 40 }} />
        </div>
      )}
    </FullScreenLoadingContext.Provider>
  );
};

export const useFullScreenLoading = () => {
  return useContext(FullScreenLoadingContext);
};
