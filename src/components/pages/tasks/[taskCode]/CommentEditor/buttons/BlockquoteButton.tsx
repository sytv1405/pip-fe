import { createBlockStyleButton } from '@draft-js-plugins/buttons';

import { EditorBlockquoteIcon } from '@/assets/images';

export default createBlockStyleButton({
  blockType: 'blockquote',
  children: <EditorBlockquoteIcon />,
});
