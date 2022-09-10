import { FC } from 'react';

type PropsType = {
  height?: string;
  width?: string;
  className?: string;
};

/**
 * スペースをdivブロックで空けるコンポーネント
 * @param width
 * @param height
 */
export const Spacer: FC<PropsType> = props => {
  return (
    <div
      style={{
        width: props.width,
        height: props.height,
      }}
      className={props.className}
    />
  );
};
