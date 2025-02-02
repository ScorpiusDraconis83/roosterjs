import { createDomToModelConfig, createModelToDomConfig } from 'roosterjs-content-model-dom';
import { listItemMetadataApplier, listLevelMetadataApplier } from '../metadata/updateListMetadata';
import { tablePreProcessor } from '../override/tablePreProcessor';
import type {
    ContentModelSettings,
    DomToModelOption,
    DomToModelSettings,
    ModelToDomOption,
    ModelToDomSettings,
    StandaloneEditorOptions,
} from 'roosterjs-content-model-types';

/**
 * @internal
 * Create default DOM to Content Model conversion settings for a standalone editor
 * @param options The editor options
 */
export function createDomToModelSettings(
    options: StandaloneEditorOptions
): ContentModelSettings<DomToModelOption, DomToModelSettings> {
    const builtIn: DomToModelOption = {
        processorOverride: {
            table: tablePreProcessor,
        },
    };
    const customized: DomToModelOption = options.defaultDomToModelOptions ?? {};

    return {
        builtIn,
        customized,
        calculated: createDomToModelConfig([builtIn, customized]),
    };
}

/**
 * @internal
 * Create default Content Model to DOM conversion settings for a standalone editor
 * @param options The editor options
 */
export function createModelToDomSettings(
    options: StandaloneEditorOptions
): ContentModelSettings<ModelToDomOption, ModelToDomSettings> {
    const builtIn: ModelToDomOption = {
        metadataAppliers: {
            listItem: listItemMetadataApplier,
            listLevel: listLevelMetadataApplier,
        },
    };
    const customized: ModelToDomOption = options.defaultModelToDomOptions ?? {};

    return {
        builtIn,
        customized,
        calculated: createModelToDomConfig([builtIn, customized]),
    };
}
