import { EventEmitter } from '@jrabausch/event-emitter';
import { ComponentEnterEvent, ComponentLeaveEvent } from './events';
import { Component, ComponentClass, ComponentPool, Entity } from './interfaces';
import { IndexPool } from './IndexPool';
import { EntityQuery } from './EntityQuery';

export class EntityManager extends EventEmitter {
  protected count: Entity = 0;
  protected readonly indexPool: IndexPool;
  protected readonly entities: { [index: number]: Entity } = {};
  protected readonly indexes: { [entity: Entity]: number } = {};
  protected readonly components: { [type: string]: ComponentPool<Component> } = {};
  protected readonly queries: Map<string, EntityQuery<any>> = new Map();

  constructor(
    protected readonly emitEvents: boolean = true,
    sortIndexes: boolean = false
  ) {
    super();
    this.indexPool = new IndexPool(sortIndexes);
  }

  createEntity(...components: Component[]): Entity {

    const entity: Entity = ++this.count;
    const index = this.indexPool.get();

    this.entities[index] = entity;
    this.indexes[entity] = index;

    if (components.length) {
      this.addComponent(entity, ...components);
    }

    return entity;
  }

  destroyEntity(entity: Entity): void {

    const index = this.indexes[entity];

    if (index === undefined) {
      return;
    }

    delete this.indexes[entity];

    for (const type in this.components) {

      const component = this.components[type][index];

      if (component !== undefined) {
        this.components[type][index] = undefined;
        this.emitEvents && this.emit(new ComponentLeaveEvent(component, entity));
      }
    }

    delete this.entities[index];

    this.indexPool.free(index);
  }

  hasEntity(entity: Entity): boolean {
    return this.indexes[entity] !== undefined;
  }

  hasComponent(entity: Entity, componentClass: ComponentClass<Component>): boolean {

    const index = this.indexes[entity];

    if (index === undefined) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }

    const componentPool = this.components[componentClass.name];

    return componentPool ? componentPool[index] !== undefined : false;
  }

  getComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): T | undefined {

    const index = this.indexes[entity];

    if (index === undefined) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }

    const componentPool = this.components[componentClass.name];

    return componentPool ? componentPool[index] as T : undefined;
  }

  addComponent(entity: Entity, ...components: Component[]): void {

    const index = this.indexes[entity];

    if (index === undefined) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }

    for (let i = 0; i < components.length; i++) {

      const component = components[i];
      const componentClassName = component.constructor.name;
      let componentPool = this.components[componentClassName];

      if (componentPool === undefined) {
        componentPool = this.components[componentClassName] = [];
      }

      const currentComponent = componentPool[index];
      componentPool[index] = component;

      if (this.emitEvents) {
        if (currentComponent !== undefined) {
          this.emit(new ComponentLeaveEvent(currentComponent, entity));
        }

        this.emit(new ComponentEnterEvent(component, entity));
      }
    }
  }

  removeComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): T | undefined {

    const index = this.indexes[entity];

    if (index === undefined) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }

    const componentPool = this.components[componentClass.name];

    if (componentPool === undefined) {
      return undefined;
    }

    const component = componentPool[index];

    if (component === undefined) {
      return undefined;
    }

    componentPool[index] = undefined;
    this.emitEvents && this.emit(new ComponentLeaveEvent(component, entity));
    return component as T;
  }

  createQuery<T extends ComponentClass<Component>, A extends T, B extends T[]>(
    componentClass: A, ...componentClasses: B
  ): EntityQuery<[A, ...B]> {

    const componentClassNames = [componentClass, ...componentClasses].map(c => c.name);
    const queryName = componentClassNames.join('-');

    let query = this.queries.get(queryName);

    if (query !== undefined) {
      return query;
    }

    const componentPools = componentClassNames.map(className => {
      let componentPool = this.components[className];

      if (componentPool === undefined) {
        componentPool = this.components[className] = [];
      }

      return componentPool;
    });

    query = new EntityQuery(componentPools, this.entities);
    this.queries.set(queryName, query);

    return query;
  }
}
