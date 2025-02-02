import addParser from '../utils/addParser';
import { setProcessor } from '../utils/setProcessor';
import {
    COMMENT_HIGHLIGHT_CLASS,
    COMMENT_HIGHLIGHT_CLICKED_CLASS,
    LIST_CONTAINER_ELEMENT_CLASS_NAME,
    TEMP_ELEMENTS_CLASSES,
    WAC_IDENTIFY_SELECTOR,
} from './constants';
import type {
    ContentModelBeforePasteEvent,
    ContentModelBlockFormat,
    ContentModelBlockGroup,
    ContentModelListItemLevelFormat,
    ContentModelSegmentFormat,
    DomToModelContext,
    ElementProcessor,
    FormatParser,
} from 'roosterjs-content-model-types';

const LIST_ELEMENT_TAGS = ['UL', 'OL', 'LI'];
const LIST_ELEMENT_SELECTOR = LIST_ELEMENT_TAGS.join(',');

const COMMENT_BG_COLOR_REST = 'rgba(209, 209, 209, 0.5)';
const COMMENTS_TEXT_HIGHLIGHT_CLICKED = 'rgba(197, 139, 204, 0.5)';

/**
 * Wac components do not use sub and super tags, instead only add vertical align to a span.
 * This parser normalize the content for content model
 */
const wacSubSuperParser: FormatParser<ContentModelSegmentFormat> = (
    format: ContentModelSegmentFormat,
    element: HTMLElement
): void => {
    const verticalAlign = element.style.verticalAlign;
    if (verticalAlign === 'super') {
        format.superOrSubScriptSequence = 'super';
    }
    if (verticalAlign === 'sub') {
        format.superOrSubScriptSequence = 'sub';
    }
};

/**
 * This processor does:
 * 1) Remove the display and margin of the element.
 * 2) When an element should be ignored but should handle the child elements call the default child processor.
 * 3) Removes the End of Paragraph element to avoid empty lines, we should only remove this if the previous element of the EOP is an EmptyTextRun
 * 4) Finally call the default processor.
 * @returns
 */
const wacElementProcessor: ElementProcessor<HTMLElement> = (
    group: ContentModelBlockGroup,
    element: HTMLElement,
    context: DomToModelContext
): void => {
    const elementTag = element.tagName;

    if (element.matches(WAC_IDENTIFY_SELECTOR)) {
        element.style.removeProperty('display');
        element.style.removeProperty('margin');
    }

    if (element.classList.contains(LIST_CONTAINER_ELEMENT_CLASS_NAME)) {
        context.elementProcessors.child(group, element, context);
        return;
    }

    if (TEMP_ELEMENTS_CLASSES.some(className => element.classList.contains(className))) {
        return;
    } else if (shouldClearListContext(elementTag, element, context)) {
        const { listFormat } = context;
        listFormat.levels = [];
        listFormat.listParent = undefined;
    }

    context.defaultElementProcessors.element(group, element, context);
};

/**
 * This processor calls the default list processor and then sets the correct list level and list bullet.
 */
const wacLiElementProcessor: ElementProcessor<HTMLLIElement> = (
    group: ContentModelBlockGroup,
    element: HTMLLIElement,
    context: DomToModelContext
): void => {
    context.defaultElementProcessors.li?.(group, element, context);
    const { listFormat } = context;
    const listParent = listFormat.listParent;
    if (listParent) {
        const lastblock = listParent.blocks[listParent.blocks.length - 1];
        if (
            lastblock.blockType == 'BlockGroup' &&
            lastblock.blockGroupType == 'ListItem' &&
            context.listFormat.listParent !== lastblock
        ) {
            const currentLevel = lastblock.levels[lastblock.levels.length - 1];

            // Get item level from 'data-aria-level' attribute
            const level = parseInt(element.getAttribute('data-aria-level') ?? '');
            if (level > 0) {
                if (level > lastblock.levels.length) {
                    while (level != lastblock.levels.length) {
                        lastblock.levels.push(currentLevel);
                    }
                } else {
                    lastblock.levels.splice(level, lastblock.levels.length - 1);
                    lastblock.levels[level - 1] = currentLevel;
                }
            }
        }
    }
};

/**
 * This parsers does:
 * 1) Sets the display for dummy item to undefined when the current style is block.
 * 2) Removes the Margin Left
 */
const wacListItemParser: FormatParser<ContentModelListItemLevelFormat> = (
    format: ContentModelListItemLevelFormat,
    element: HTMLElement
): void => {
    if (element.style.display === 'block') {
        format.displayForDummyItem = undefined;
    }

    format.marginLeft = undefined;
};

/**
 * Wac usually adds padding to lists which is unwanted so remove it.
 */
const wacListLevelParser: FormatParser<ContentModelListItemLevelFormat> = (
    format: ContentModelListItemLevelFormat
): void => {
    format.marginLeft = undefined;
    format.paddingLeft = undefined;
};

/**
 * This function returns whether we need to clear the list format.
 * Word Online wraps lists inside divs to have this structure:
 *
 *  <div class='ListContainerWrapper'>
 *      <ol>...</ol>
 *  </div>
 *  <div>
 *      <p>...</p>
 *  <div>
 *  <div class='ListContainerWrapper'>
 *      <ol>...</ol>
 *  </div>
 *
 *  So if a elements is not contained inside of a list we should clear the list context to prevent normal text to be
 *  transformed into list
 *  For the above scenario, if we do not clear the format, the content inside of the second div would be transformed to a list too.
 */
function shouldClearListContext(
    elementTag: string,
    element: HTMLElement,
    context: DomToModelContext
) {
    return (
        context.listFormat.levels.length > 0 &&
        LIST_ELEMENT_TAGS.every(tag => tag != elementTag) &&
        !element.closest(LIST_ELEMENT_SELECTOR)
    );
}

const wacCommentParser: FormatParser<ContentModelSegmentFormat> = (
    format: ContentModelSegmentFormat,
    element: HTMLElement
): void => {
    if (
        (element.className.includes(COMMENT_HIGHLIGHT_CLASS) &&
            element.style.backgroundColor == COMMENT_BG_COLOR_REST) ||
        (element.className.includes(COMMENT_HIGHLIGHT_CLICKED_CLASS) &&
            element.style.backgroundColor == COMMENTS_TEXT_HIGHLIGHT_CLICKED)
    ) {
        delete format.backgroundColor;
    }
};
/**
 * @internal
 * Convert pasted content from Office Online
 * Once it is known that the document is from WAC
 * We need to remove the display property and margin from all the list item
 * @param ev ContentModelBeforePasteEvent
 */
export function processPastedContentWacComponents(ev: ContentModelBeforePasteEvent) {
    addParser(ev.domToModelOption, 'segment', wacSubSuperParser);
    addParser(ev.domToModelOption, 'listItemThread', wacListItemParser);
    addParser(ev.domToModelOption, 'listLevel', wacListLevelParser);
    addParser(ev.domToModelOption, 'container', wacContainerParser);
    addParser(ev.domToModelOption, 'table', wacContainerParser);
    addParser(ev.domToModelOption, 'segment', wacCommentParser);

    setProcessor(ev.domToModelOption, 'element', wacElementProcessor);
    setProcessor(ev.domToModelOption, 'li', wacLiElementProcessor);
    setProcessor(ev.domToModelOption, 'ol', wacListProcessor);
    setProcessor(ev.domToModelOption, 'ul', wacListProcessor);
}

/**
 * List items from word have this format when using List items:
 * @example
        <div>
           <ol></ol>
        </div>
        <div>
           <ol></ol>
        </div>
        <div>
           <ol></ol>
        </div>
 *  Due to this the div between each of the lists we need to restore the list context to use the previous list,
 *  otherwise it could create a new list instead under the same list element
 */
const wacListProcessor: ElementProcessor<HTMLOListElement | HTMLUListElement> = (
    group: ContentModelBlockGroup,
    element: HTMLOListElement | HTMLUListElement,
    context: DomToModelContext
): void => {
    const lastBlock = group.blocks[group.blocks.length - 1];
    const isWrappedInContainer = element.closest(`.${LIST_CONTAINER_ELEMENT_CLASS_NAME}`);
    if (
        isWrappedInContainer?.previousElementSibling?.classList.contains(
            LIST_CONTAINER_ELEMENT_CLASS_NAME
        )
    ) {
        if (lastBlock?.blockType === 'BlockGroup' && lastBlock.blockGroupType == 'ListItem') {
            context.listFormat = {
                threadItemCounts: [],
                levels: lastBlock.levels,
                listParent: group,
            };
        }
    }
    if (element.tagName.toUpperCase() === 'OL') {
        context.defaultElementProcessors.ol?.(group, element as HTMLOListElement, context);
    } else {
        context.defaultElementProcessors.ul?.(group, element as HTMLUListElement, context);
    }
};

const wacContainerParser: FormatParser<ContentModelBlockFormat> = (
    format: ContentModelBlockFormat,
    element: HTMLElement
) => {
    if (element.style.marginLeft.startsWith('-')) {
        delete format.marginLeft;
    }
};
