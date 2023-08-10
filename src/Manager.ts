import { IndexPool } from './IndexPool';
import { EventEmitter } from '@jrabausch/event-emitter';
import { ComponentEnterEvent, ComponentLeaveEvent } from './events';

export type Entity = number;

export interface Component {
  [key: string]: any;
  [key: number]: any;
}

export type ComponentClass<T extends Component> = new (...args: any[]) => T;

export type InstanceTypeTuple<T extends any[]> = {
  [K in keyof T]: T[K] extends ComponentClass<infer U> ? U : never;
}

export type QueryCallback<T extends ComponentClass<Component>[]> = (entity: Entity, ...components: InstanceTypeTuple<T>) => any | void;
export type Query<T extends ComponentClass<Component>[]> = (callback: QueryCallback<T>) => ReturnType<QueryCallback<T>>;

type ComponentPool<T extends Component> = (T | undefined)[];

export class Manager extends EventEmitter {

  protected count: Entity = 0;

  protected indexPool: IndexPool = new IndexPool();

  protected entities: { [index: number]: Entity } = {};

  protected indexes: { [entity: Entity]: number } = {};

  protected components: { [type: string]: ComponentPool<Component> } = {};

  protected queries: Map<string, Query<any>> = new Map();

  createEntity<T extends Component[]>(...components: T): Entity {

    const entity: Entity = ++this.count;
    const index = this.indexPool.get();

    this.entities[index] = entity;
    this.indexes[entity] = index;

    if (components.length) {
      this.entityAddComponent(entity, ...components);
    }

    return entity;
  }

  destroyEntity(entity: Entity): void {

    const index = this.indexes[entity];

    if (index !== undefined) {

      delete this.indexes[entity];

      for (const type in this.components) {

        const component = this.components[type][index];

        if (component !== undefined) {
          this.components[type][index] = undefined;
          this.emit(new ComponentLeaveEvent(component, entity));
        }
      }

      delete this.entities[index];

      this.indexPool.free(index);
    }
  }

  hasEntity(entity: Entity): boolean {
    return this.indexes[entity] !== undefined;
  }

  entityHasComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): boolean {

    const index = this.indexes[entity];

    if (index === undefined) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }

    const componentPool = this.components[componentClass.name];

    return componentPool ? componentPool[index] !== undefined : false;
  }

  entityGetComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): T | undefined {

    const index = this.indexes[entity];

    if (index === undefined) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }

    const componentPool = this.components[componentClass.name];

    return componentPool ? componentPool[index] as T : undefined;
  }

  entityAddComponent<T extends Component>(entity: Entity, ...components: T[]): void {

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

      if (currentComponent !== undefined) {
        this.emit(new ComponentLeaveEvent(currentComponent, entity));
      }

      // trigger component enter event
      this.emit(new ComponentEnterEvent(component, entity));
    }
  }

  entityRemoveComponent<T extends Component>(entity: Entity, componentClass: ComponentClass<T>): T | undefined {

    const index = this.indexes[entity];

    if (index === undefined) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }

    const componentPool = this.components[componentClass.name];

    if (componentPool !== undefined) {

      const component = componentPool[index];

      if (component !== undefined) {

        componentPool[index] = undefined;
        this.emit(new ComponentLeaveEvent(component, entity));
        return component as T;
      }
    }

    return undefined;
  }

  protected buildQuery<T extends ComponentClass<Component>[]>(componentPools: ComponentPool<Component>[]): Query<T> {

    const poolCount = componentPools.length;

    const variables: string[] = [];
    for (let i = 0; i < poolCount; i++) {
      variables.push(`co${i}`);
    }

    let pools = '';
    for (let i = 0; i < poolCount; i++) {
      pools += `const po${i} = pools[${i}];\n`;
    }

    let conditions = '';
    for (let i = 0; i < poolCount; i++) {
      conditions += `const ${variables[i]} = po${i}[index];\n`;
      conditions += `if(${variables[i]} === undefined) continue;\n`;
    }

    const func = `
				${pools}
				return function(cb){
					let length = po0.length;
					let res;
					for(let index = 0; index < length; index++){
						${conditions}
						if((res = cb(entities[index], ${variables.join(',')})) !== undefined){
							return res;
						}
					}
				}
			`;

    return new Function('pools', 'entities', func)(componentPools, this.entities) as Query<T>;
  }

  createQuery<T extends ComponentClass<Component>>(componentClass: T, ...componentClasses: T[]): Query<T[]> {

    const componentClassNames = [componentClass, ...componentClasses].map(c => c.name);
    const queryName = componentClassNames.join('-');

    let query = this.queries.get(queryName);

    if (query === undefined) {

      const componentPools: ComponentPool<Component>[] = [];

      for (let i = 0; i < componentClassNames.length; i++) {
        const className = componentClassNames[i];

        let componentPool = this.components[className];

        if (componentPool === undefined) {
          componentPool = this.components[className] = [];
        }

        componentPools.push(componentPool);
      }

      query = this.buildQuery(componentPools);

      this.queries.set(queryName, query);
    }

    return query;
  }
}
