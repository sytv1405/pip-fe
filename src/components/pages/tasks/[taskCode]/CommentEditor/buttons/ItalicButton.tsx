import { createInlineStyleButton } from '@draft-js-plugins/buttons';

import { EditorItalicIcon } from '@/assets/images';

export default createInlineStyleButton({
  style: 'ITALIC',
  children: <EditorItalicIcon />,
});
