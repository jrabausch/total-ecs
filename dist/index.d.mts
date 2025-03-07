import { EventEmitter } from '@jrabausch/event-emitter';

type Entity = number;
type Component = {
    [key: string]: any;
    [key: number]: any;
};
type ComponentClass<T extends Component> = new (...args: any[]) => T;
type ComponentPool<T extends Component> = (T | undefined)[];
type InstanceTypeTuple<T extends any[]> = {
    [K in keyof T]: T[K] extends ComponentClass<infer U> ? U : never;
};
type QueryCallback<T extends ComponentClass<Component>[]> = (entity: Entity, ...components: InstanceTypeTuple<T>) => unknown;

declare class EntityQuery<T extends ComponentClass<Component>[]> {
    protected readonly execute: (cb: QueryCallback<T>) => any;
    constructor(componentPools: ComponentPool<Component>[], entityMap: {
        [index: number]: Entity;
    });
    run<C extends QueryCallback<T>>(callback: C): ReturnType<C> | void;
}

declare class IndexPool {
    protected readonly sort: boolean;
    protected count: number;
    protected readonly pending: number[];
    constructor(sort?: boolean);
    get(): number;
    free(index: number): void;
    get size(): number;
}

declare class EntityManager extends EventEmitter {
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

declare abstract class ComponentEvent<T extends Component> {
    readonly component: T;
    readonly entity: Entity;
    constructor(component: T, entity: Entity);
}
declare class ComponentEnterEvent<T extends Component> extends ComponentEvent<T> {
}
declare class ComponentLeaveEvent<T extends Component> extends ComponentEvent<T> {
}

export { type Component, type ComponentClass, ComponentEnterEvent, ComponentEvent, ComponentLeaveEvent, type ComponentPool, type Entity, EntityManager, EntityQuery, IndexPool, type QueryCallback };
