import { convertToHTML as convertToHTMLBase } from 'draft-convert';
import { EditorState, ContentState, convertToRaw, convertFromRaw, RawDraftContentState } from 'draft-js';
import LinkifyIt from 'linkify-it';
import { transform } from 'lodash';
import { MentionData } from '@draft-js-plugins/mention';

import { TEL_REGEX } from '@/shared/regex';

export const formatRawDataBeforeConvert = (rawContent: RawDraftContentState): RawDraftContentState => {
  const formattedBlocks = rawContent.blocks;
  const formattedEntityMap = rawContent.entityMap;

  rawContent.blocks.forEach(block => {
    const isValidMatchRange = (index: number, lastIndex: number): boolean => {
      return block.entityRanges?.every(
        range =>
          (index > range.offset && lastIndex > range.offset) ||
          (index < range.offset + range.length && lastIndex < range.offset + range.length)
      );
    };

    const createLinkEntity = ({ offset, length, data }: { offset: number; length: number; data: Record<string, any> }): void => {
      const formattedEntityMapLength = Object.keys(formattedEntityMap).length;

      block.entityRanges.push({
        key: formattedEntityMapLength,
        offset,
        length,
      });

      formattedEntityMap[formattedEntityMapLength] = {
        data,
        mutability: 'MUTABLE',
        type: 'LINK',
      };
    };

    const matches = new LinkifyIt().match(block.text);

    if (matches) {
      matches.forEach(match => {
        if (isValidMatchRange(match.index, match.lastIndex)) {
          createLinkEntity({
            offset: match.index,
            length: match.lastIndex - match.index,
            data: {
              url: match.url,
            },
          });
        }
      });
      return;
    }

    // tel => use regex to verify pattern
    let match;
    do {
      match = TEL_REGEX.exec(block.text);

      if (match && isValidMatchRange(match.index, TEL_REGEX.lastIndex)) {
        createLinkEntity({
          offset: match.index,
          length: TEL_REGEX.lastIndex - match.index,
          data: {
            url: `tel:${match?.[0]?.replace(/-/g, '')}`,
          },
        });
      }
    } while (match);
  });

  return { blocks: formattedBlocks, entityMap: formattedEntityMap };
};

export const convertToHTML = (content: ContentState): string => {
  return convertToHTMLBase({
    entityToHTML: (entity, originalText) => {
      if (entity.type === 'mention') {
        return (
          <span className="mention" data-id={entity?.data?.mention?.id}>
            {originalText}
          </span>
        );
      }

      if (entity.type === 'LINK') {
        return (
          <a href={entity.data.url} target="_blank" rel="noreferrer">
            {originalText}
          </a>
        );
      }

      return originalText;
    },
  })(content);
};

export const stringifyEditorState = (editorState: EditorState): string => {
  return JSON.stringify(convertToRaw(editorState.getCurrentContent()));
};

export const parseStringifiedRawContentToHTML = (content: string): string => {
  try {
    const contentHTML = convertToHTML(convertFromRaw(formatRawDataBeforeConvert(JSON.parse(content))));

    return contentHTML;
  } catch {
    return content;
  }
};

export const parseStringifiedRawContentToEditorState = (content: string): EditorState => {
  try {
    const editorContent = convertFromRaw(JSON.parse(content));

    return EditorState.createWithContent(editorContent);
  } catch {
    return EditorState.createEmpty();
  }
};

export const getMentionsFromEditorState = (editorState: EditorState): MentionData[] => {
  const rawContent = convertToRaw(editorState.getCurrentContent());

  return transform(
    rawContent.entityMap,
    (acc, entity) => {
      if (entity.type === 'mention' && !acc.some(receiver => receiver.id === entity.data.mention.id)) {
        acc.push(entity.data.mention);
      }
    },
    []
  );
};

export const getMentionIdsFromEditorState = (editorState: EditorState): MentionData['id'][] => {
  const mentions = getMentionsFromEditorState(editorState);

  return mentions.map(mention => mention.id);
};
