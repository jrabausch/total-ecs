const { Manager, ComponentEnterEvent } = require('../dist');

class PositionComponent {
	x = 12;
	y = 14;
}

const world = new Manager();

world.on(ComponentEnterEvent, (e) => {
	if (e.component instanceof PositionComponent) {
		console.log(e.component.x);
	}
});

const entity = world.createEntity(
	new PositionComponent()
);
