import { createInlineStyleButton } from '@draft-js-plugins/buttons';

import { EditorBoldIcon } from '@/assets/images';

export default createInlineStyleButton({
  style: 'BOLD',
  children: <EditorBoldIcon />,
});
