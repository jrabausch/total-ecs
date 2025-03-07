// src/entity-manager.ts
import { EventEmitter } from "@jrabausch/event-emitter";

// src/entity-query.ts
var EntityQuery = class {
  constructor(componentPools, entityMap) {
    const variables = [];
    let pools = "";
    let conditions = "";
    for (let i = 0; i < componentPools.length; i++) {
      pools += `var pool${i} = pools[${i}];
`;
      const component = `component${i}`;
      conditions += `var ${component} = pool${i}[index];
`;
      conditions += `if(${component} === undefined) continue;
`;
      variables.push(component);
    }
    const func = `
      ${pools}
      return function(callback){
        var length = pool0.length;
        var index, result;
        for(index = 0; index < length; index++){
          ${conditions}
          result = callback(entities[index], ${variables.join(",")});
          if(result !== undefined){
            return result;
          }
        }
      }
    `;
    this.execute = new Function("pools", "entities", func)(componentPools, entityMap);
  }
  run(callback) {
    return this.execute(callback);
  }
};

// src/events.ts
var ComponentEvent = class {
  constructor(component, entity) {
    this.component = component;
    this.entity = entity;
  }
};
var ComponentEnterEvent = class extends ComponentEvent {
};
var ComponentLeaveEvent = class extends ComponentEvent {
};

// src/index-pool.ts
var IndexPool = class {
  constructor(sort = false) {
    this.sort = sort;
    this.count = 0;
    this.pending = [];
  }
  get() {
    if (this.pending.length) {
      return this.pending.pop();
    }
    return this.count++;
  }
  free(index) {
    this.pending.push(index);
    this.sort && this.pending.sort((a, b) => b - a);
  }
  get size() {
    return this.count;
  }
};

// src/entity-manager.ts
var EntityManager = class extends EventEmitter {
  constructor(emitEvents = true, sortIndexes = false) {
    super();
    this.emitEvents = emitEvents;
    this.count = 0;
    this.entities = {};
    this.indexes = {};
    this.components = {};
    this.queries = /* @__PURE__ */ new Map();
    this.indexPool = new IndexPool(sortIndexes);
  }
  createEntity(...components) {
    const entity = ++this.count;
    const index = this.indexPool.get();
    this.entities[index] = entity;
    this.indexes[entity] = index;
    if (components.length) {
      this.addComponent(entity, ...components);
    }
    return entity;
  }
  destroyEntity(entity) {
    const index = this.indexes[entity];
    if (index === void 0) {
      return;
    }
    delete this.indexes[entity];
    for (const type in this.components) {
      const component = this.components[type][index];
      if (component !== void 0) {
        this.components[type][index] = void 0;
        this.emitEvents && this.emit(new ComponentLeaveEvent(component, entity));
      }
    }
    delete this.entities[index];
    this.indexPool.free(index);
  }
  hasEntity(entity) {
    return this.indexes[entity] !== void 0;
  }
  hasComponent(entity, componentClass) {
    const index = this.indexes[entity];
    if (index === void 0) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }
    const componentPool = this.components[componentClass.name];
    return componentPool ? componentPool[index] !== void 0 : false;
  }
  getComponent(entity, componentClass) {
    const index = this.indexes[entity];
    if (index === void 0) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }
    const componentPool = this.components[componentClass.name];
    return componentPool ? componentPool[index] : void 0;
  }
  addComponent(entity, ...components) {
    const index = this.indexes[entity];
    if (index === void 0) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const componentClassName = component.constructor.name;
      let componentPool = this.components[componentClassName];
      if (componentPool === void 0) {
        componentPool = this.components[componentClassName] = [];
      }
      const currentComponent = componentPool[index];
      componentPool[index] = component;
      if (this.emitEvents) {
        if (currentComponent !== void 0) {
          this.emit(new ComponentLeaveEvent(currentComponent, entity));
        }
        this.emit(new ComponentEnterEvent(component, entity));
      }
    }
  }
  removeComponent(entity, componentClass) {
    const index = this.indexes[entity];
    if (index === void 0) {
      throw new ReferenceError(`Entity "${entity}" does not exist`);
    }
    const componentPool = this.components[componentClass.name];
    if (componentPool === void 0) {
      return void 0;
    }
    const component = componentPool[index];
    if (component === void 0) {
      return void 0;
    }
    componentPool[index] = void 0;
    this.emitEvents && this.emit(new ComponentLeaveEvent(component, entity));
    return component;
  }
  createQuery(componentClass, ...componentClasses) {
    const componentClassNames = [componentClass, ...componentClasses].map((c) => c.name);
    const queryName = componentClassNames.join("-");
    let query = this.queries.get(queryName);
    if (query !== void 0) {
      return query;
    }
    const componentPools = componentClassNames.map((className) => {
      let componentPool = this.components[className];
      if (componentPool === void 0) {
        componentPool = this.components[className] = [];
      }
      return componentPool;
    });
    query = new EntityQuery(componentPools, this.entities);
    this.queries.set(queryName, query);
    return query;
  }
};
export {
  ComponentEnterEvent,
  ComponentEvent,
  ComponentLeaveEvent,
  EntityManager,
  EntityQuery,
  IndexPool
};
//# sourceMappingURL=index.mjs.map