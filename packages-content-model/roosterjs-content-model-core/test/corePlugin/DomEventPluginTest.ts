import * as eventUtils from '../../lib/publicApi/domUtils/eventUtils';
import { ChangeSource, PluginEventType } from 'roosterjs-editor-types';
import { createDOMEventPlugin } from '../../lib/corePlugin/DOMEventPlugin';
import {
    DOMEventPluginState,
    IStandaloneEditor,
    PluginWithState,
} from 'roosterjs-content-model-types';

const getDocument = () => document;

describe('DOMEventPlugin', () => {
    it('init and dispose', () => {
        const addEventListener = jasmine.createSpy('addEventListener');
        const removeEventListener = jasmine.createSpy('removeEventListener');
        const div = <any>{
            addEventListener,
            removeEventListener,
        };
        const plugin = createDOMEventPlugin({}, div);
        const disposer = jasmine.createSpy('disposer');
        const attachDomEvent = jasmine.createSpy('attachDomEvent').and.returnValue(disposer);
        const state = plugin.getState();
        const editor = ({
            getDocument,
            attachDomEvent,
            getEnvironment: () => ({}),
        } as any) as IStandaloneEditor;

        plugin.initialize(editor);

        expect(addEventListener).toHaveBeenCalledTimes(1);
        expect(addEventListener.calls.argsFor(0)[0]).toBe('scroll');

        expect(state).toEqual({
            isInIME: false,
            scrollContainer: div,
            mouseDownX: null,
            mouseDownY: null,
            mouseUpEventListerAdded: false,
        });
        expect(attachDomEvent).toHaveBeenCalled();
        expect(removeEventListener).not.toHaveBeenCalled();
        expect(disposer).not.toHaveBeenCalled();

        plugin.dispose();

        expect(removeEventListener).toHaveBeenCalled();
        expect(disposer).toHaveBeenCalled();
    });

    it('init with different options', () => {
        const addEventListener1 = jasmine.createSpy('addEventListener1');
        const addEventListener2 = jasmine.createSpy('addEventListener2');
        const div = <any>{
            addEventListener: addEventListener1,
        };
        const divScrollContainer = <any>{
            addEventListener: addEventListener2,
            removeEventListener: jasmine.createSpy('removeEventListener'),
        };
        const plugin = createDOMEventPlugin(
            {
                scrollContainer: divScrollContainer,
            },
            div
        );
        const state = plugin.getState();

        const attachDomEvent = jasmine
            .createSpy('attachDomEvent')
            .and.returnValue(jasmine.createSpy('disposer'));
        plugin.initialize(<IStandaloneEditor>(<any>{
            getDocument,
            attachDomEvent,
            getEnvironment: () => ({}),
        }));

        expect(addEventListener1).not.toHaveBeenCalledTimes(1);
        expect(addEventListener2).toHaveBeenCalledTimes(1);
        expect(addEventListener2.calls.argsFor(0)[0]).toBe('scroll');

        expect(state).toEqual({
            isInIME: false,
            scrollContainer: divScrollContainer,
            mouseDownX: null,
            mouseDownY: null,
            mouseUpEventListerAdded: false,
        });

        expect(attachDomEvent).toHaveBeenCalled();

        plugin.dispose();
    });
});

describe('DOMEventPlugin verify event handlers while disallow keyboard event propagation', () => {
    let eventMap: Record<string, any>;
    let plugin: PluginWithState<DOMEventPluginState>;

    beforeEach(() => {
        const div = <any>{
            addEventListener: jasmine.createSpy('addEventListener1'),
            removeEventListener: jasmine.createSpy('removeEventListener'),
        };

        plugin = createDOMEventPlugin({}, div);
        plugin.initialize(<IStandaloneEditor>(<any>{
            getDocument,
            attachDomEvent: (map: Record<string, any>) => {
                eventMap = map;
                return jasmine.createSpy('disposer');
            },
            getEnvironment: () => ({}),
        }));
    });

    afterEach(() => {
        plugin.dispose();
        eventMap = undefined!;
    });

    it('check events are mapped', () => {
        expect(eventMap).toBeDefined();
        expect(eventMap.keypress.pluginEventType).toBe(PluginEventType.KeyPress);
        expect(eventMap.keydown.pluginEventType).toBe(PluginEventType.KeyDown);
        expect(eventMap.keyup.pluginEventType).toBe(PluginEventType.KeyUp);
        expect(eventMap.input.pluginEventType).toBe(PluginEventType.Input);
        expect(eventMap.keypress.beforeDispatch).toBeDefined();
        expect(eventMap.keydown.beforeDispatch).toBeDefined();
        expect(eventMap.keyup.beforeDispatch).toBeDefined();
        expect(eventMap.input.beforeDispatch).toBeDefined();
        expect(eventMap.mousedown).toBeDefined();
        expect(eventMap.compositionstart).toBeDefined();
        expect(eventMap.compositionend).toBeDefined();
        expect(eventMap.dragstart).toBeDefined();
        expect(eventMap.drop).toBeDefined();
        expect(eventMap.mouseup).not.toBeDefined();
    });

    it('verify keydown event for non-character value', () => {
        spyOn(eventUtils, 'isCharacterValue').and.returnValue(false);
        const stopPropagation = jasmine.createSpy();
        eventMap.keydown.beforeDispatch(<Event>(<any>{
            stopPropagation,
        }));
        expect(stopPropagation).not.toHaveBeenCalled();
    });

    it('verify keydown event for character value', () => {
        spyOn(eventUtils, 'isCharacterValue').and.returnValue(true);
        const stopPropagation = jasmine.createSpy();
        eventMap.keydown.beforeDispatch(<Event>(<any>{
            stopPropagation,
        }));
        expect(stopPropagation).toHaveBeenCalled();
    });

    it('verify input event for non-character value', () => {
        spyOn(eventUtils, 'isCharacterValue').and.returnValue(false);
        const stopPropagation = jasmine.createSpy();
        eventMap.input.beforeDispatch(<Event>(<any>{
            stopPropagation,
        }));
        expect(stopPropagation).toHaveBeenCalled();
    });

    it('verify input event for character value', () => {
        spyOn(eventUtils, 'isCharacterValue').and.returnValue(true);
        const stopPropagation = jasmine.createSpy();
        eventMap.input.beforeDispatch(<Event>(<any>{
            stopPropagation,
        }));
        expect(stopPropagation).toHaveBeenCalled();
    });
});

describe('DOMEventPlugin handle mouse down and mouse up event', () => {
    let plugin: PluginWithState<DOMEventPluginState>;
    let addEventListener: jasmine.Spy;
    let removeEventListener: jasmine.Spy;
    let triggerPluginEvent: jasmine.Spy;
    let eventMap: Record<string, any>;
    let scrollContainer: HTMLElement;
    let onMouseUp: Function;

    beforeEach(() => {
        addEventListener = jasmine
            .createSpy('addEventListener')
            .and.callFake((eventName, handler, useCapture) => {
                expect(eventName).toBe('mouseup');
                expect(useCapture).toBe(true);

                onMouseUp = handler;
            });
        removeEventListener = jasmine.createSpy('.removeEventListener');
        triggerPluginEvent = jasmine.createSpy('triggerPluginEvent');
        scrollContainer = {
            addEventListener: () => {},
            removeEventListener: () => {},
        } as any;
        plugin = createDOMEventPlugin(
            {
                scrollContainer,
            },
            null!
        );
        plugin.initialize(<IStandaloneEditor>(<any>{
            getDocument: () => ({
                addEventListener,
                removeEventListener,
            }),
            triggerPluginEvent,
            getEnvironment: () => ({}),
            attachDomEvent: (map: Record<string, any>) => {
                eventMap = map;
                return jasmine.createSpy('disposer');
            },
        }));
    });

    afterEach(() => {
        plugin.dispose();
    });

    it('Trigger mouse down event', () => {
        const mockedEvent = {
            pageX: 100,
            pageY: 200,
        };
        eventMap.mousedown.beforeDispatch(mockedEvent);
        expect(addEventListener).toHaveBeenCalledTimes(1);
        expect(addEventListener.calls.argsFor(0)[0]).toBe('mouseup');
        expect(addEventListener.calls.argsFor(0)[2]).toBe(true);
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: 100,
            mouseDownY: 200,
            mouseUpEventListerAdded: true,
        });
    });

    it('Trigger mouse up event, isClicking', () => {
        expect(eventMap.mouseup).toBeUndefined();
        const mockedEvent = {
            pageX: 100,
            pageY: 200,
        };
        eventMap.mousedown.beforeDispatch(mockedEvent);

        expect(eventMap.mouseup).toBeUndefined();
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: 100,
            mouseDownY: 200,
            mouseUpEventListerAdded: true,
        });
        expect(addEventListener).toHaveBeenCalled();

        onMouseUp(mockedEvent);

        expect(removeEventListener).toHaveBeenCalled();
        expect(triggerPluginEvent).toHaveBeenCalledWith(PluginEventType.MouseUp, {
            rawEvent: mockedEvent,
            isClicking: true,
        });
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: 100,
            mouseDownY: 200,
            mouseUpEventListerAdded: false,
        });
    });

    it('Trigger mouse up event, isClicking = false', () => {
        expect(eventMap.mouseup).toBeUndefined();
        const mockedEvent1 = {
            pageX: 100,
            pageY: 200,
        };
        const mockedEvent2 = {
            pageX: 100,
            pageY: 300,
        };
        eventMap.mousedown.beforeDispatch(mockedEvent1);

        expect(eventMap.mouseup).toBeUndefined();
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: 100,
            mouseDownY: 200,
            mouseUpEventListerAdded: true,
        });
        expect(addEventListener).toHaveBeenCalled();

        onMouseUp(mockedEvent2);

        expect(removeEventListener).toHaveBeenCalled();
        expect(triggerPluginEvent).toHaveBeenCalledWith(PluginEventType.MouseUp, {
            rawEvent: mockedEvent2,
            isClicking: false,
        });
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: 100,
            mouseDownY: 200,
            mouseUpEventListerAdded: false,
        });
    });
});

describe('DOMEventPlugin handle other event', () => {
    let plugin: PluginWithState<DOMEventPluginState>;
    let addEventListener: jasmine.Spy;
    let removeEventListener: jasmine.Spy;
    let triggerPluginEvent: jasmine.Spy;
    let eventMap: Record<string, any>;
    let scrollContainer: HTMLElement;
    let addEventListenerSpy: jasmine.Spy;
    let editor: IStandaloneEditor;

    beforeEach(() => {
        addEventListener = jasmine.createSpy('addEventListener');
        removeEventListener = jasmine.createSpy('.removeEventListener');
        triggerPluginEvent = jasmine.createSpy('triggerPluginEvent');
        addEventListenerSpy = jasmine.createSpy('addEventListener');

        scrollContainer = {
            addEventListener: () => {},
            removeEventListener: () => {},
        } as any;
        plugin = createDOMEventPlugin(
            {
                scrollContainer,
            },
            null!
        );

        editor = <IStandaloneEditor>(<any>{
            getDocument: () => ({
                addEventListener,
                removeEventListener,
                defaultView: {
                    requestAnimationFrame: (callback: Function) => {
                        callback();
                    },
                    addEventListener: addEventListenerSpy,
                    removeEventListener: () => {},
                },
            }),
            triggerPluginEvent,
            getEnvironment: () => ({}),
            attachDomEvent: (map: Record<string, any>) => {
                eventMap = map;
                return jasmine.createSpy('disposer');
            },
        });
        plugin.initialize(editor);
    });

    afterEach(() => {
        plugin.dispose();
    });

    it('Trigger compositionstart and compositionend event', () => {
        eventMap.compositionstart.beforeDispatch();
        expect(plugin.getState()).toEqual({
            isInIME: true,
            scrollContainer: scrollContainer,
            mouseDownX: null,
            mouseDownY: null,
            mouseUpEventListerAdded: false,
        });

        expect(triggerPluginEvent).not.toHaveBeenCalled();

        const mockedEvent = 'EVENT' as any;
        eventMap.compositionend.beforeDispatch(mockedEvent);
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: null,
            mouseDownY: null,
            mouseUpEventListerAdded: false,
        });
        expect(triggerPluginEvent).toHaveBeenCalledWith(PluginEventType.CompositionEnd, {
            rawEvent: mockedEvent,
        });
        expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });

    it('Trigger onDragStart event', () => {
        const preventDefaultSpy = jasmine.createSpy('preventDefault');
        const mockedEvent = {
            preventDefault: preventDefaultSpy,
            target: {
                nodeType: Node.ELEMENT_NODE,
                isContentEditable: true,
            },
        } as any;

        eventMap.dragstart.beforeDispatch(mockedEvent);
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: null,
            mouseDownY: null,
            mouseUpEventListerAdded: false,
        });

        expect(triggerPluginEvent).not.toHaveBeenCalled();
        expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('Trigger onDragStart event on readonly element', () => {
        const preventDefaultSpy = jasmine.createSpy('preventDefault');
        const mockedEvent = {
            preventDefault: preventDefaultSpy,
            target: {
                nodeType: Node.ELEMENT_NODE,
                isContentEditable: false,
            },
        } as any;

        eventMap.dragstart.beforeDispatch(mockedEvent);
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: null,
            mouseDownY: null,
            mouseUpEventListerAdded: false,
        });

        expect(triggerPluginEvent).not.toHaveBeenCalled();
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('Trigger onDrop event', () => {
        const takeSnapshotSpy = jasmine.createSpy('takeSnapshot');
        editor.takeSnapshot = takeSnapshotSpy;

        eventMap.drop.beforeDispatch();
        expect(plugin.getState()).toEqual({
            isInIME: false,
            scrollContainer: scrollContainer,
            mouseDownX: null,
            mouseDownY: null,
            mouseUpEventListerAdded: false,
        });
        expect(takeSnapshotSpy).toHaveBeenCalledWith();
        expect(triggerPluginEvent).toHaveBeenCalledWith(PluginEventType.ContentChanged, {
            source: ChangeSource.Drop,
        });
    });
});
