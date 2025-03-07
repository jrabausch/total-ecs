export type Entity = number;

export type Component = {
  [key: string]: any;
  [key: number]: any;
};

export type ComponentClass<T extends Component> = new (...args: any[]) => T;
export type ComponentPool<T extends Component> = (T | undefined)[];

type InstanceTypeTuple<T extends any[]> = {
  [K in keyof T]: T[K] extends ComponentClass<infer U> ? U : never;
};

export type QueryCallback<T extends ComponentClass<Component>[]> = (entity: Entity, ...components: InstanceTypeTuple<T>) => unknown;
