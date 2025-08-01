import { createDefaultDomToModelContext } from '../../testUtils';
import { generatePasteOptionFromPlugins } from '../../../lib/command/paste/generatePasteOptionFromPlugins';
import { IEditor } from 'roosterjs-content-model-types';

describe('generatePasteOptionFromPlugins', () => {
    let editor: IEditor;
    let triggerPluginEventSpy: jasmine.Spy;
    let getEnvironmentSpy: jasmine.Spy;

    const mockedClipboardData = 'CLIPBOARDDATA' as any;
    const mockedFragment = 'FRAGMENT' as any;
    const htmlBefore = 'HTMLBEFORE';
    const htmlAfter = 'HTMLAFTER';
    const mockedMetadata = 'METADATA' as any;
    const mockedCssRule = 'CSSRULE' as any;
    const mockedResult = {
        fragment: 'FragmentResult',
        domToModelOption: 'OptionResult',
        pasteType: 'TypeResult',
    } as any;

    beforeEach(() => {
        triggerPluginEventSpy = jasmine.createSpy('triggerEvent');
        getEnvironmentSpy = jasmine.createSpy('getEnvironment').and.returnValue({
            domToModelSettings: {
                customized: {
                    processNonVisibleElements: false,
                },
            },
        });
        editor = {
            triggerEvent: triggerPluginEventSpy,
            getEnvironment: getEnvironmentSpy,
        } as any;
    });

    it('PasteType=Normal', () => {
        let originalEvent: any;

        triggerPluginEventSpy.and.callFake((core, event) => {
            originalEvent = { ...event };
            Object.assign(event, mockedResult);

            return event;
        });
        const result = generatePasteOptionFromPlugins(
            editor,
            mockedClipboardData,
            mockedFragment,
            {
                htmlAfter,
                htmlBefore,
                metadata: mockedMetadata,
                globalCssRules: mockedCssRule,
            },
            'normal'
        );

        expect(result).toEqual({
            fragment: 'FragmentResult',
            domToModelOption: 'OptionResult',
            pasteType: 'TypeResult',
            eventType: 'beforePaste',
            clipboardData: mockedClipboardData,
            htmlBefore,
            htmlAfter,
            htmlAttributes: mockedMetadata,
            containsBlockElements: false,
        } as any);
        expect(triggerPluginEventSpy).toHaveBeenCalledTimes(1);
        expect(originalEvent).toEqual({
            eventType: 'beforePaste',
            clipboardData: mockedClipboardData,
            fragment: mockedFragment,
            htmlBefore: htmlBefore,
            htmlAfter: htmlAfter,
            htmlAttributes: mockedMetadata,
            pasteType: 'normal',
            domToModelOption: createDefaultDomToModelContext(),
            containsBlockElements: false,
        });
        expect(triggerPluginEventSpy).toHaveBeenCalledWith(
            'beforePaste',
            {
                eventType: 'beforePaste',
                clipboardData: mockedClipboardData,
                fragment: 'FragmentResult',
                htmlBefore: htmlBefore,
                htmlAfter: htmlAfter,
                htmlAttributes: mockedMetadata,
                pasteType: 'TypeResult',
                domToModelOption: 'OptionResult',
                containsBlockElements: false,
            },
            true
        );
    });

    it('PasteType=asImage, return customizedMerge', () => {
        const mockedCustomizedMerge = 'MERGE' as any;

        triggerPluginEventSpy.and.callFake((core, event) => {
            event.fragment = 'FragmentResult';
            event.domToModelOption = 'OptionResult';
            event.pasteType = 'TypeResult';
            event.customizedMerge = mockedCustomizedMerge;

            return event;
        });

        const result = generatePasteOptionFromPlugins(
            editor,
            mockedClipboardData,
            mockedFragment,
            {
                htmlAfter,
                htmlBefore,
                metadata: mockedMetadata,
                globalCssRules: mockedCssRule,
            },
            'asImage'
        );

        expect(result).toEqual({
            fragment: 'FragmentResult',
            domToModelOption: 'OptionResult',
            pasteType: 'TypeResult',
            customizedMerge: mockedCustomizedMerge,
            eventType: 'beforePaste',
            clipboardData: mockedClipboardData,
            htmlBefore,
            htmlAfter,
            htmlAttributes: mockedMetadata,
            containsBlockElements: false,
        } as any);
        expect(triggerPluginEventSpy).toHaveBeenCalledTimes(1);
        expect(triggerPluginEventSpy).toHaveBeenCalledWith(
            'beforePaste',
            {
                eventType: 'beforePaste',
                clipboardData: mockedClipboardData,
                fragment: 'FragmentResult',
                htmlBefore: htmlBefore,
                htmlAfter: htmlAfter,
                htmlAttributes: mockedMetadata,
                pasteType: 'TypeResult',
                domToModelOption: 'OptionResult',
                customizedMerge: mockedCustomizedMerge,
                containsBlockElements: false,
            },
            true
        );
    });

    it('PasteType=mergeFormat, no htmlBefore and htmlAfter', () => {
        let originalEvent: any;

        triggerPluginEventSpy.and.callFake((core, event) => {
            originalEvent = { ...event };
            Object.assign(event, mockedResult);

            return event;
        });
        const result = generatePasteOptionFromPlugins(
            editor,
            mockedClipboardData,
            mockedFragment,
            {
                metadata: mockedMetadata,
                globalCssRules: mockedCssRule,
            },
            'mergeFormat'
        );

        expect(result).toEqual({
            fragment: 'FragmentResult',
            domToModelOption: 'OptionResult',
            pasteType: 'TypeResult',
            eventType: 'beforePaste',
            clipboardData: mockedClipboardData,
            htmlBefore: '',
            htmlAfter: '',
            htmlAttributes: mockedMetadata,
            containsBlockElements: false,
        } as any);
        expect(triggerPluginEventSpy).toHaveBeenCalledTimes(1);
        expect(triggerPluginEventSpy).toHaveBeenCalledWith(
            'beforePaste',
            {
                eventType: 'beforePaste',
                clipboardData: mockedClipboardData,
                fragment: 'FragmentResult',
                htmlBefore: '',
                htmlAfter: '',
                htmlAttributes: mockedMetadata,
                pasteType: 'TypeResult',
                domToModelOption: 'OptionResult',
                containsBlockElements: false,
            },
            true
        );
        expect(originalEvent).toEqual({
            eventType: 'beforePaste',
            clipboardData: mockedClipboardData,
            fragment: mockedFragment,
            htmlBefore: '',
            htmlAfter: '',
            htmlAttributes: mockedMetadata,
            pasteType: 'mergeFormat',
            domToModelOption: createDefaultDomToModelContext(),
            containsBlockElements: false,
        });
    });

    it('PasteType=asPlainText', () => {
        triggerPluginEventSpy.and.callFake((core, event) => {
            Object.assign(event, mockedResult);

            return event;
        });
        const result = generatePasteOptionFromPlugins(
            editor,
            mockedClipboardData,
            mockedFragment,
            {
                htmlAfter,
                htmlBefore,
                metadata: mockedMetadata,
                globalCssRules: mockedCssRule,
            },
            'asPlainText'
        );

        expect(result).toEqual({
            eventType: 'beforePaste',
            clipboardData: 'CLIPBOARDDATA' as any,
            fragment: 'FragmentResult' as any,
            htmlBefore: 'HTMLBEFORE',
            htmlAfter: 'HTMLAFTER',
            htmlAttributes: 'METADATA' as any,
            pasteType: 'TypeResult' as any,
            domToModelOption: 'OptionResult' as any,
            containsBlockElements: false,
        });
        expect(triggerPluginEventSpy).toHaveBeenCalledTimes(1);
    });
});
