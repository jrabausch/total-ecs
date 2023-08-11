import { EventEmitter } from '@jrabausch/event-emitter';
import { Component, ComponentClass, ComponentPool, Entity } from './interfaces';
import { IndexPool } from './IndexPool';
import { EntityQuery } from './EntityQuery';
export declare class EntityManager extends EventEmitter {
    protected readonly emitEvents: boolean;
    protected count: Entity;
    protected readonly indexPool: IndexPool;
    protected readonly entities: {
        [index: number]: Entity;
    };
    protected readonly indexes: {
        [entity: Entity]: number;
    };
    protected readonly components: {
        [type: string]: ComponentPool<Component>;
    };
    protected readonly queries: Map<string, EntityQuery<any>>;
    constructor(emitEvents?: boolean, sortIndexes?: boolean);
    createEntity(...components: Component[]): Entity;
    destroyEntity(entity: Entity): void;
    hasEntity(entity: Entity): boolean;
    hasComponent(entity: Entity, componentClass: ComponentClass<Component>): boolean;
    getComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): T | undefined;
    addComponent(entity: Entity, ...components: Component[]): void;
    removeComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): T | undefined;
    createQuery<T extends ComponentClass<Component>, A extends T, B extends T[]>(componentClass: A, ...componentClasses: B): EntityQuery<[A, ...B]>;
}
