import { message } from 'antd';

import { CustomErrorIcon, CustomSuccessIcon } from '@/assets/images';

message.config({ duration: 1 });

export default {
  success(content) {
    return message.success({
      content,
      icon: <CustomSuccessIcon className="mr-3" />,
      className: 'custom-status',
    });
  },
  error(content) {
    return message.error({
      content,
      icon: <CustomErrorIcon className="mr-3" />,
      className: 'custom-status',
    });
  },
};
