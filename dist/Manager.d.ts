import { IndexPool } from './IndexPool';
import { EventEmitter } from '@jrabausch/event-emitter';
export type Entity = number;
export interface Component {
    [key: string]: any;
    [key: number]: any;
}
export type ComponentClass<T extends Component> = new (...args: any[]) => T;
export type InstanceTypeTuple<T extends any[]> = {
    [K in keyof T]: T[K] extends ComponentClass<infer U> ? U : never;
};
export type QueryCallback<T extends ComponentClass<Component>[]> = (entity: Entity, ...components: InstanceTypeTuple<T>) => any | void;
export type Query<T extends ComponentClass<Component>[]> = (callback: QueryCallback<T>) => ReturnType<QueryCallback<T>>;
type ComponentPool<T extends Component> = (T | undefined)[];
export declare class Manager extends EventEmitter {
    protected count: Entity;
    protected indexPool: IndexPool;
    protected entities: {
        [index: number]: Entity;
    };
    protected indexes: {
        [entity: Entity]: number;
    };
    protected components: {
        [type: string]: ComponentPool<Component>;
    };
    protected queries: Map<string, Query<any>>;
    createEntity<T extends Component[]>(...components: T): Entity;
    destroyEntity(entity: Entity): void;
    hasEntity(entity: Entity): boolean;
    entityHasComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): boolean;
    entityGetComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): T | undefined;
    entityAddComponent<T extends Component>(entity: Entity, ...components: T[]): void;
    entityRemoveComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): T | undefined;
    protected buildQuery<T extends ComponentClass<Component>[]>(componentPools: ComponentPool<Component>[]): Query<T>;
    createQuery<T extends ComponentClass<Component>>(componentClass: T, ...componentClasses: T[]): Query<T[]>;
}
export {};
