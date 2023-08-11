export class EntityQuery {
    constructor(componentPools, entityMap) {
        const variables = [];
        let pools = '';
        let conditions = '';
        const poolCount = componentPools.length;
        for (let i = 0; i < poolCount; i++) {
            pools += `var pool${i} = pools[${i}];\n`;
            const component = `component${i}`;
            conditions += `var ${component} = pool${i}[index];\n`;
            conditions += `if(${component} === undefined) continue;\n`;
            variables.push(component);
        }
        const func = `
        "use strict";
				${pools}
				return function(callback){
					var length = pool0.length;
					var result;
					for(var index = 0; index < length; index++){
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
