import * as cloneModel from '../../lib/publicApi/model/cloneModel';
import * as createDomToModelContext from 'roosterjs-content-model-dom/lib/domToModel/context/createDomToModelContext';
import * as domToContentModel from 'roosterjs-content-model-dom/lib/domToModel/domToContentModel';
import { createContentModel } from '../../lib/coreApi/createContentModel';
import { EditorCore } from 'roosterjs-editor-types';
import { StandaloneEditorCore } from 'roosterjs-content-model-types';

const mockedEditorContext = 'EDITORCONTEXT' as any;
const mockedContext = 'CONTEXT' as any;
const mockedModel = 'MODEL' as any;
const mockedDiv = 'DIV' as any;
const mockedCachedMode = 'CACHEDMODEL' as any;
const mockedClonedModel = 'CLONEDMODEL' as any;

describe('createContentModel', () => {
    let core: StandaloneEditorCore & EditorCore;
    let createEditorContext: jasmine.Spy;
    let getDOMSelection: jasmine.Spy;
    let domToContentModelSpy: jasmine.Spy;
    let cloneModelSpy: jasmine.Spy;

    beforeEach(() => {
        createEditorContext = jasmine
            .createSpy('createEditorContext')
            .and.returnValue(mockedEditorContext);
        getDOMSelection = jasmine.createSpy('getDOMSelection').and.returnValue(null);

        domToContentModelSpy = spyOn(domToContentModel, 'domToContentModel').and.returnValue(
            mockedModel
        );
        cloneModelSpy = spyOn(cloneModel, 'cloneModel').and.returnValue(mockedClonedModel);

        spyOn(createDomToModelContext, 'createDomToModelContextWithConfig').and.returnValue(
            mockedContext
        );

        core = ({
            contentDiv: mockedDiv,
            api: {
                createEditorContext,
                getDOMSelection,
            },
            cache: {
                cachedModel: mockedCachedMode,
            },
            lifecycle: {},
            domToModelSettings: {},
        } as any) as StandaloneEditorCore & EditorCore;
    });

    it('Reuse model, no cache, no shadow edit', () => {
        core.cache.cachedModel = undefined;

        const model = createContentModel(core);

        expect(createEditorContext).toHaveBeenCalledWith(core);
        expect(getDOMSelection).toHaveBeenCalledWith(core);
        expect(domToContentModelSpy).toHaveBeenCalledWith(mockedDiv, mockedContext, undefined);
        expect(model).toBe(mockedModel);
    });

    it('Reuse model, no shadow edit', () => {
        const model = createContentModel(core);

        expect(createEditorContext).not.toHaveBeenCalled();
        expect(getDOMSelection).not.toHaveBeenCalled();
        expect(domToContentModelSpy).not.toHaveBeenCalled();
        expect(model).toBe(mockedCachedMode);
    });

    it('Reuse model, with cache, with shadow edit', () => {
        core.lifecycle.shadowEditFragment = {} as any;

        const model = createContentModel(core);

        expect(cloneModelSpy).toHaveBeenCalledWith(mockedCachedMode, {
            includeCachedElement: true,
        });
        expect(createEditorContext).not.toHaveBeenCalled();
        expect(getDOMSelection).not.toHaveBeenCalled();
        expect(domToContentModelSpy).not.toHaveBeenCalled();
        expect(model).toBe(mockedClonedModel);
    });
});

describe('createContentModel with selection', () => {
    let getDOMSelectionSpy: jasmine.Spy;
    let domToContentModelSpy: jasmine.Spy;
    let createEditorContextSpy: jasmine.Spy;
    let core: any;
    const MockedDiv = 'CONTENT_DIV' as any;

    beforeEach(() => {
        getDOMSelectionSpy = jasmine.createSpy('getDOMSelection');
        domToContentModelSpy = spyOn(domToContentModel, 'domToContentModel');
        createEditorContextSpy = jasmine.createSpy('createEditorContext');

        spyOn(createDomToModelContext, 'createDomToModelContextWithConfig').and.returnValue(
            mockedContext
        );

        core = {
            contentDiv: MockedDiv,
            api: {
                getDOMSelection: getDOMSelectionSpy,
                createEditorContext: createEditorContextSpy,
            },
            cache: {},
            domToModelSettings: {},
        };
    });

    it('Regular selection', () => {
        const MockedContainer = 'MockedContainer';
        const MockedRange = {
            name: 'MockedRange',
            commonAncestorContainer: MockedContainer,
        } as any;

        getDOMSelectionSpy.and.returnValue({
            type: 'range',
            range: MockedRange,
        });

        createContentModel(core);

        expect(domToContentModelSpy).toHaveBeenCalledTimes(1);
        expect(domToContentModelSpy).toHaveBeenCalledWith(MockedDiv, mockedContext, {
            type: 'range',
            range: MockedRange,
        } as any);
    });

    it('Table selection', () => {
        const MockedContainer = 'MockedContainer';
        const MockedFirstCell = { name: 'FirstCell' };
        const MockedLastCell = { name: 'LastCell' };

        getDOMSelectionSpy.and.returnValue({
            type: 'table',
            table: MockedContainer,
            coordinates: {
                firstCell: MockedFirstCell,
                lastCell: MockedLastCell,
            },
        });

        createContentModel(core);

        expect(domToContentModelSpy).toHaveBeenCalledTimes(1);
        expect(domToContentModelSpy).toHaveBeenCalledWith(MockedDiv, mockedContext, {
            type: 'table',
            table: MockedContainer,
            coordinates: {
                firstCell: MockedFirstCell,
                lastCell: MockedLastCell,
            },
        } as any);
    });

    it('Image selection', () => {
        const MockedContainer = 'MockedContainer';

        getDOMSelectionSpy.and.returnValue({
            type: 'image',
            image: MockedContainer,
        });

        createContentModel(core);

        expect(domToContentModelSpy).toHaveBeenCalledTimes(1);
        expect(domToContentModelSpy).toHaveBeenCalledWith(MockedDiv, mockedContext, {
            type: 'image',
            image: MockedContainer,
        } as any);
    });

    it('Incorrect regular selection', () => {
        getDOMSelectionSpy.and.returnValue({
            type: 'range',
            range: null!,
        });

        createContentModel(core);

        expect(domToContentModelSpy).toHaveBeenCalledTimes(1);
        expect(domToContentModelSpy).toHaveBeenCalledWith(MockedDiv, mockedContext, {
            type: 'range',
            range: null!,
        } as any);
    });

    it('Incorrect table selection', () => {
        getDOMSelectionSpy.and.returnValue({
            type: 'table',
        });

        createContentModel(core);

        expect(domToContentModelSpy).toHaveBeenCalledTimes(1);
        expect(domToContentModelSpy).toHaveBeenCalledWith(MockedDiv, mockedContext, {
            type: 'table',
        } as any);
    });
});
