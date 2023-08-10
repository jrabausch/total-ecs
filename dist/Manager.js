"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const IndexPool_1 = require("./IndexPool");
const event_emitter_1 = require("@jrabausch/event-emitter");
const events_1 = require("./events");
class Manager extends event_emitter_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.count = 0;
        this.indexPool = new IndexPool_1.IndexPool();
        this.entities = {};
        this.indexes = {};
        this.components = {};
        this.queries = new Map();
    }
    createEntity(...components) {
        const entity = ++this.count;
        const index = this.indexPool.get();
        this.entities[index] = entity;
        this.indexes[entity] = index;
        if (components.length) {
            this.addComponents(entity, ...components);
        }
        return entity;
    }
    destroyEntity(entity) {
        const index = this.indexes[entity];
        if (index !== undefined) {
            delete this.indexes[entity];
            for (const type in this.components) {
                const component = this.components[type][index];
                if (component !== undefined) {
                    this.components[type][index] = undefined;
                    this.emit(new events_1.ComponentLeaveEvent(component, entity));
                }
            }
            delete this.entities[index];
            this.indexPool.free(index);
        }
    }
    hasEntity(entity) {
        return this.indexes[entity] !== undefined;
    }
    hasComponent(entity, componentClass) {
        const index = this.indexes[entity];
        if (index === undefined) {
            throw new ReferenceError(`Entity "${entity}" does not exist`);
        }
        const componentClassName = componentClass.name;
        const componentPool = this.components[componentClassName];
        if (componentPool === undefined) {
            throw new ReferenceError(`Component pool "${componentClassName}" does not exist`);
        }
        return componentPool[index] !== undefined;
    }
    getComponent(entity, componentClass) {
        const index = this.indexes[entity];
        if (index === undefined) {
            throw new ReferenceError(`Entity "${entity}" does not exist`);
        }
        const componentClassName = componentClass.name;
        const componentPool = this.components[componentClassName];
        if (componentPool === undefined) {
            throw new ReferenceError(`Component pool "${componentClassName}" does not exist`);
        }
        return componentPool[index];
    }
    addComponents(entity, ...components) {
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
                this.emit(new events_1.ComponentLeaveEvent(currentComponent, entity));
            }
            // trigger component enter event
            this.emit(new events_1.ComponentEnterEvent(component, entity));
        }
    }
    removeComponent(entity, componentClass) {
        const index = this.indexes[entity];
        if (index === undefined) {
            throw new ReferenceError(`Entity "${entity}" does not exist`);
        }
        const componentPool = this.components[componentClass.name];
        if (componentPool === undefined) {
            throw new ReferenceError(`Component pool "${componentClass.name}" does not exist`);
        }
        const component = componentPool[index];
        if (component !== undefined) {
            componentPool[index] = undefined;
            this.emit(new events_1.ComponentLeaveEvent(component, entity));
            return component;
        }
        return component;
    }
    buildQuery(componentPools) {
        const poolCount = componentPools.length;
        const variables = [];
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
        return new Function('pools', 'entities', func)(componentPools, this.entities);
    }
    createQuery(...componentClasses) {
        const componentClassNames = componentClasses.map(c => c.name);
        const queryName = componentClassNames.join('-');
        let query = this.queries.get(queryName);
        if (query === undefined) {
            if (!componentClasses.length) {
                throw new Error('No arguments passed');
            }
            const componentPools = [];
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
exports.Manager = Manager;
