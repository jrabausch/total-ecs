import type { Component, ComponentClass, ComponentPool, Entity, QueryCallback } from './interfaces';

export class EntityQuery<T extends ComponentClass<Component>[]> {
  protected readonly execute: (cb: QueryCallback<T>) => any;

  constructor(componentPools: ComponentPool<Component>[], entityMap: { [index: number]: Entity }) {
    const variables: string[] = [];
    let pools = '';
    let conditions = '';

    for (let i = 0; i < componentPools.length; i++) {
      pools += `var pool${i} = pools[${i}];\n`;

      const component = `component${i}`;
      conditions += `var ${component} = pool${i}[index];\n`;
      conditions += `if(${component} === undefined) continue;\n`;
      variables.push(component);
    }

    const func = `
      ${pools}
      return function(callback){
        var length = pool0.length;
        var index, result;
        for(index = 0; index < length; index++){
          ${conditions}
          result = callback(entities[index], ${variables.join(',')});
          if(result !== undefined){
            return result;
          }
        }
      }
    `;

    // eslint-disable-next-line no-new-func
    this.execute = new Function('pools', 'entities', func)(componentPools, entityMap);
  }

  run<C extends QueryCallback<T>>(callback: C): ReturnType<C> | void {
    return this.execute(callback);
  }
}
