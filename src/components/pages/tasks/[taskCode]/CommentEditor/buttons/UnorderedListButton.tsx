import { createBlockStyleButton } from '@draft-js-plugins/buttons';

import { EditorUnorderListIcon } from '@/assets/images';

export default createBlockStyleButton({
  blockType: 'unordered-list-item',
  children: <EditorUnorderListIcon />,
});
