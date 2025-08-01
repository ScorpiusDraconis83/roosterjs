import { isElementOfType } from '../../domUtils/isElementOfType';
import type { DirectionFormat } from 'roosterjs-content-model-types';
import type { FormatHandler } from '../FormatHandler';

/**
 * @internal
 */
export const directionFormatHandler: FormatHandler<DirectionFormat> = {
    parse: (format, element, _, defaultStyle) => {
        const dir = element.style.direction || element.dir || defaultStyle.direction;

        if (dir) {
            format.direction = dir == 'rtl' ? 'rtl' : 'ltr';
        }
    },
    apply: (format, element) => {
        if (format.direction) {
            element.style.direction = format.direction;
        }

        if (format.direction == 'rtl' && isElementOfType(element, 'table')) {
            element.style.justifySelf = 'flex-end';
        }
    },
};
