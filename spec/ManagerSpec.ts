import { ComponentEnterEvent, ComponentLeaveEvent, Manager } from '../src';

class PositionComponent {
  x: number = 10;
  y: number = 20;
}

class TagComponent {
  name: string = 'tag';
}

describe('Manager', () => {

  let world: Manager;

  beforeEach(() => {
    world = new Manager();
  });

  it('should be self', () => {
    expect(world).toBeInstanceOf(Manager);
  });

  it('should create entities', () => {

    const entity1 = world.createEntity();
    expect(entity1).toBeInstanceOf(Number);

    expect(world.hasEntity(entity1)).toBeTrue();
    const entity2 = world.createEntity();
    expect(world.hasEntity(entity2)).toBeTrue();
  });

  it('should create entities with components', () => {

    const entity1 = world.createEntity(
      new PositionComponent(),
      new TagComponent()
    );

    expect(world.hasEntity(entity1)).toBeTrue();
    expect(world.entityHasComponent(entity1, PositionComponent)).toBeTrue();
    expect(world.entityHasComponent(entity1, TagComponent)).toBeTrue();
  });

  it('should create entities with components and emit', () => {

    spyOn(world, 'emit');

    const posComponent = new PositionComponent();
    const tagComponent = new TagComponent();

    const entity1 = world.createEntity(
      posComponent,
      tagComponent
    );

    expect(world.emit).toHaveBeenCalledTimes(2);
    expect(world.emit).toHaveBeenCalledWith(new ComponentEnterEvent(posComponent, entity1));
    expect(world.emit).toHaveBeenCalledWith(new ComponentEnterEvent(tagComponent, entity1));
  });

  it('should destroy entities', () => {

    const entity1 = world.createEntity();
    expect(world.hasEntity(entity1)).toBeTrue();

    world.destroyEntity(entity1);

    expect(world.hasEntity(entity1)).toBeFalse();
  });

  it('should destroy entities and emit', () => {

    const posComponent = new PositionComponent();
    const tagComponent = new TagComponent();

    const entity1 = world.createEntity(
      posComponent,
      tagComponent
    );

    spyOn(world, 'emit');

    world.destroyEntity(entity1);

    expect(world.hasEntity(entity1)).toBeFalse();
    expect(world.emit).toHaveBeenCalledTimes(2);
    expect(world.emit).toHaveBeenCalledWith(new ComponentLeaveEvent(posComponent, entity1));
    expect(world.emit).toHaveBeenCalledWith(new ComponentLeaveEvent(tagComponent, entity1));
  });

  it('should add components and emit', () => {

    spyOn(world, 'emit');

    const posComponent = new PositionComponent();
    const entity1 = world.createEntity();

    expect(world.entityHasComponent(entity1, PositionComponent)).toBeFalse();
    world.entityAddComponent(entity1, posComponent);
    expect(world.entityHasComponent(entity1, PositionComponent)).toBeTrue();
    expect(world.emit).toHaveBeenCalledOnceWith(new ComponentEnterEvent(posComponent, entity1));
  });

  it('should remove components and emit', () => {

    const posComponent = new PositionComponent();
    const entity1 = world.createEntity(posComponent);

    spyOn(world, 'emit');

    expect(world.entityHasComponent(entity1, PositionComponent)).toBeTrue();
    world.entityRemoveComponent(entity1, PositionComponent);
    expect(world.entityHasComponent(entity1, PositionComponent)).toBeFalse();
    expect(world.emit).toHaveBeenCalledOnceWith(new ComponentLeaveEvent(posComponent, entity1));
  });
});
