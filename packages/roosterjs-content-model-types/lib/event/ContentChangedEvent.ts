import type { AnnounceData } from '../parameter/AnnounceData';
import type { BasePluginEvent } from './BasePluginEvent';
import type { EntityState } from '../parameter/FormatContentModelContext';
import type { ContentModelEntity } from '../contentModel/entity/ContentModelEntity';
import type { EntityRemovalOperation } from '../enum/EntityOperation';
import type { ContentModelDocument } from '../contentModel/blockGroup/ContentModelDocument';
import type { DOMSelection } from '../selection/DOMSelection';

/**
 * Represents an entity that has been changed during a content change process
 */
export interface ChangedEntity {
    /**
     * The changed entity
     */
    entity: ContentModelEntity;

    /**
     * Operation that causes the change
     */
    operation: EntityRemovalOperation | 'newEntity';

    /**
     * @optional Raw DOM event that causes the change
     */
    rawEvent?: Event;
}

/**
 * Represents a change to the editor made by another plugin with content model inside
 */
export interface ContentChangedEvent extends BasePluginEvent<'contentChanged'> {
    /**
     * The content model that is applied which causes this content changed event
     */
    readonly contentModel?: ContentModelDocument;

    /**
     * Selection range applied to the document
     */
    readonly selection?: DOMSelection;

    /**
     * Entities got changed (added or removed) during the content change process
     */
    readonly changedEntities?: ChangedEntity[];

    /**
     * Additional state added to the snapshot by plugins
     */
    readonly additionalState?: { [key: string]: string };

    /**
     * Entity states related to this event
     */
    readonly entityStates?: EntityState[];

    /**
     * Source of the change
     */
    readonly source: string;

    /**
     * Optional related data
     */
    readonly data?: any;

    /**
     * Optional property to store the format api name when using ChangeSource.Format
     */
    readonly formatApiName?: string;

    /**
     * @deprecated Call editor.announce(announceData) directly insteaad
     */
    readonly announceData?: AnnounceData;
}
