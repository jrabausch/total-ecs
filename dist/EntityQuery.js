"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityQuery = void 0;
class EntityQuery {
    constructor(componentPools, entityMap) {
        const variables = [];
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
						if((result = callback(entities[index], ${variables.join(',')})) !== undefined){
							return result;
						}
					}
				}
			`;
        this.execute = new Function('pools', 'entities', func)(componentPools, entityMap);
    }
    run(callback) {
        return this.execute(callback);
    }
}
exports.EntityQuery = EntityQuery;
