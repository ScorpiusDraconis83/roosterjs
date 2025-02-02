import type { FormatParser, SizeFormat } from 'roosterjs-content-model-types';

/**
 * @internal Do not paste width for Format Containers since it may be generated by browser according to temp div width
 */
export const containerWidthFormatParser: FormatParser<SizeFormat> = (format, element) => {
    // For pasted content, there may be existing width generated by browser from the temp DIV. So we need to remove it.
    if (element.tagName == 'DIV') {
        delete format.width;
    }
};
