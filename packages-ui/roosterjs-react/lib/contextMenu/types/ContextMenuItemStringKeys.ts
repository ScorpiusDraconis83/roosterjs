import {
    CancelButtonStringKey,
    MenuItemSplitterKey0,
    OkButtonStringKey,
} from '../../common/type/LocalizedStrings';

/**
 * Key of localized strings of List Number menu items and its dialog.
 * Including:
 * - Menu item "Set numbering value"
 * - Menu item "Restart at 1"
 * - Dialog text "Set value to"
 * - Ok button
 * - Cancel button
 */
export type ListNumberMenuItemStringKey =
    | 'menuNameListNumberEdit'
    | 'menuNameListNumberReset'
    | 'dialogTextSetListNumber'
    | OkButtonStringKey
    | CancelButtonStringKey;

/**
 * Key of localized strings of Image Alt Text menu item.
 * Including:
 * - Menu item "Add alternate text"
 * - Menu item "Size" and sub menus"
 * - Menu item "Crop image"
 * - Menu item "Remove image"
 * - Ok button
 * - Cancel button
 */
export type ImageEditMenuItemStringKey =
    | 'menuNameImageAltText'
    | 'menuNameImageResize'
    | 'menuNameImageCrop'
    | 'menuNameImageRemove'
    | 'menuNameImageSizeBestFit'
    | 'menuNameImageSizeSmall'
    | 'menuNameImageSizeMedium'
    | 'menuNameImageSizeOriginal'
    | OkButtonStringKey
    | CancelButtonStringKey;

/**
 * Key of localized strings of Table Edit menu item.
 * Including:
 * - Menu item "Insert"
 * - Menu item "Delete"
 * - Menu item "Merge"
 * - Menu item "Split"
 * - Menu item "Align cell"
 */
export type TableEditMenuItemStringKey =
    | 'menuNameTableInsert'
    | 'menuNameTableInsertAbove'
    | 'menuNameTableInsertBelow'
    | 'menuNameTableInsertLeft'
    | 'menuNameTableInsertRight'
    | 'menuNameTableDelete'
    | 'menuNameTableDeleteTable'
    | 'menuNameTableDeleteColumn'
    | 'menuNameTableDeleteRow'
    | 'menuNameTableMerge'
    | 'menuNameTableMergeAbove'
    | 'menuNameTableMergeBelow'
    | 'menuNameTableMergeLeft'
    | 'menuNameTableMergeRight'
    | 'menuNameTableMergeCells'
    | 'menuNameTableSplit'
    | 'menuNameTableSplitHorizontally'
    | 'menuNameTableSplitVertically'
    | 'menuNameTableAlign'
    | 'menuNameTableAlignLeft'
    | 'menuNameTableAlignCenter'
    | 'menuNameTableAlignRight'
    | 'menuNameTableAlignTop'
    | 'menuNameTableAlignMiddle'
    | 'menuNameTableAlignBottom'
    | MenuItemSplitterKey0;