import { ContentModelEditor } from 'roosterjs-content-model-editor';
import {
    ContentModelEditPlugin,
    ContentModelPastePlugin,
    EntityDelimiterPlugin,
} from 'roosterjs-content-model-plugins';
import type { EditorPlugin } from 'roosterjs-editor-types';
import type {
    ContentModelEditorOptions,
    IContentModelEditor,
} from 'roosterjs-content-model-editor';

/**
 * Create a Content Model Editor using the given options
 * @param contentDiv The html div element needed for creating the editor
 * @param additionalPlugins The additional user defined plugins. Currently the default plugins that are already included are
 * ContentEdit, HyperLink and Paste, user don't need to add those.
 * @param initialContent The initial content to show in editor. It can't be removed by undo, user need to manually remove it if needed.
 * @returns The ContentModelEditor instance
 */
export function createContentModelEditor(
    contentDiv: HTMLDivElement,
    additionalPlugins?: EditorPlugin[],
    initialContent?: string
): IContentModelEditor {
    const plugins = additionalPlugins ? [...additionalPlugins] : [];
    plugins.push(
        new ContentModelPastePlugin(),
        new ContentModelEditPlugin(),
        new EntityDelimiterPlugin()
    );

    const options: ContentModelEditorOptions = {
        legacyPlugins: plugins,
        initialContent: initialContent,
        defaultSegmentFormat: {
            fontFamily: 'Calibri,Arial,Helvetica,sans-serif',
            fontSize: '11pt',
            textColor: '#000000',
        },
    };
    return new ContentModelEditor(contentDiv, options);
}
