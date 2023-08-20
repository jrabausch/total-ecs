import { Component, ComponentClass, ComponentPool, Entity, QueryCallback } from './interfaces';
export declare class EntityQuery<T extends ComponentClass<Component>[]> {
    protected readonly execute: Function;
    constructor(componentPools: ComponentPool<Component>[], entityMap: {
        [index: number]: Entity;
    });
    run<C extends QueryCallback<T>>(callback: C): ReturnType<C> | void;
}
