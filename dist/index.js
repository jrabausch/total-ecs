"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ComponentEnterEvent: () => ComponentEnterEvent,
  ComponentEvent: () => ComponentEvent,
  ComponentLeaveEvent: () => ComponentLeaveEvent,
  EntityManager: () => EntityManager,
  EntityQuery: () => EntityQuery,
  IndexPool: () => IndexPool
});
module.exports = __toCommonJS(index_exports);

// src/entity-manager.ts
var import_event_emitter = require("@jrabausch/event-emitter");

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
var EntityManager = class extends import_event_emitter.EventEmitter {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ComponentEnterEvent,
  ComponentEvent,
  ComponentLeaveEvent,
  EntityManager,
  EntityQuery,
  IndexPool
});
//# sourceMappingURL=index.js.map