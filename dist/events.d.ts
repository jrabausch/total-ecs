import { Component, Entity } from './Manager';
export declare abstract class ComponentEvent<T extends Component> {
    readonly component: T;
    readonly entity: Entity;
    constructor(component: T, entity: Entity);
}
export declare class ComponentEnterEvent<T extends Component> extends ComponentEvent<T> {
}
export declare class ComponentLeaveEvent<T extends Component> extends ComponentEvent<T> {
}
