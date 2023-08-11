"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityManager = void 0;
const event_emitter_1 = require("@jrabausch/event-emitter");
const events_1 = require("./events");
const IndexPool_1 = require("./IndexPool");
const EntityQuery_1 = require("./EntityQuery");
class EntityManager extends event_emitter_1.EventEmitter {
    constructor(emitEvents = true, sortIndexes = false) {
        super();
        this.emitEvents = emitEvents;
        this.count = 0;
        this.entities = {};
        this.indexes = {};
        this.components = {};
        this.queries = new Map();
        this.indexPool = new IndexPool_1.IndexPool(sortIndexes);
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
        if (index === undefined) {
            return;
        }
        delete this.indexes[entity];
        for (const type in this.components) {
            const component = this.components[type][index];
            if (component !== undefined) {
                this.components[type][index] = undefined;
                this.emitEvents && this.emit(new events_1.ComponentLeaveEvent(component, entity));
            }
        }
        delete this.entities[index];
        this.indexPool.free(index);
    }
    hasEntity(entity) {
        return this.indexes[entity] !== undefined;
    }
    hasComponent(entity, componentClass) {
        const index = this.indexes[entity];
        if (index === undefined) {
            throw new ReferenceError(`Entity "${entity}" does not exist`);
        }
        const componentPool = this.components[componentClass.name];
        return componentPool ? componentPool[index] !== undefined : false;
    }
    getComponent(entity, componentClass) {
        const index = this.indexes[entity];
        if (index === undefined) {
            throw new ReferenceError(`Entity "${entity}" does not exist`);
        }
        const componentPool = this.components[componentClass.name];
        return componentPool ? componentPool[index] : undefined;
    }
    addComponent(entity, ...components) {
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
                    this.emit(new events_1.ComponentLeaveEvent(currentComponent, entity));
                }
                this.emit(new events_1.ComponentEnterEvent(component, entity));
            }
        }
    }
    removeComponent(entity, componentClass) {
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
        this.emitEvents && this.emit(new events_1.ComponentLeaveEvent(component, entity));
        return component;
    }
    createQuery(componentClass, ...componentClasses) {
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
        query = new EntityQuery_1.EntityQuery(componentPools, this.entities);
        this.queries.set(queryName, query);
        return query;
    }
}
exports.EntityManager = EntityManager;
