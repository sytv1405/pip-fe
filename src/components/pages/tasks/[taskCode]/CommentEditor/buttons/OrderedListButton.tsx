import { createBlockStyleButton } from '@draft-js-plugins/buttons';

import { EditorOrderListIcon } from '@/assets/images';

export default createBlockStyleButton({
  blockType: 'ordered-list-item',
  children: <EditorOrderListIcon />,
});
