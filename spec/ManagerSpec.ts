import { ComponentEnterEvent, ComponentLeaveEvent, Entity, EntityManager } from '../src';

class PositionComponent {
  x: number = 10;
  y: number = 20;
}

class TagComponent {
  name: string = 'tag';
}

describe('Manager', () => {

  let world: EntityManager;

  beforeEach(() => {
    world = new EntityManager();
  });

  it('should be self', () => {
    expect(world).toBeInstanceOf(EntityManager);
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
    expect(world.hasComponent(entity1, PositionComponent)).toBeTrue();
    expect(world.hasComponent(entity1, TagComponent)).toBeTrue();
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

    expect(world.hasComponent(entity1, PositionComponent)).toBeFalse();
    world.addComponent(entity1, posComponent);
    expect(world.hasComponent(entity1, PositionComponent)).toBeTrue();
    expect(world.emit).toHaveBeenCalledOnceWith(new ComponentEnterEvent(posComponent, entity1));
  });

  it('should remove components and emit', () => {

    const posComponent = new PositionComponent();
    const entity1 = world.createEntity(posComponent);

    spyOn(world, 'emit');

    expect(world.hasComponent(entity1, PositionComponent)).toBeTrue();
    expect(world.removeComponent(entity1, PositionComponent)).toBe(posComponent);
    expect(world.removeComponent(entity1, PositionComponent)).toBeUndefined();
    expect(world.hasComponent(entity1, PositionComponent)).toBeFalse();
    expect(world.emit).toHaveBeenCalledOnceWith(new ComponentLeaveEvent(posComponent, entity1));
  });

  it('should get components', () => {

    const posComponent = new PositionComponent();
    const entity1 = world.createEntity(posComponent);

    expect(world.hasComponent(entity1, PositionComponent)).toBeTrue();
    expect(world.getComponent(entity1, PositionComponent)).toBe(posComponent);
    world.removeComponent(entity1, PositionComponent);
    expect(world.getComponent(entity1, PositionComponent)).toBeUndefined();
  });

  it('should query entities', () => {

    const system = {
      update: (entity: any, pos: any, tag: any) => { }
    };

    spyOn(system, 'update');

    const query = world.createQuery(PositionComponent, TagComponent);
    const entity1 = world.createEntity(new TagComponent(), new PositionComponent());

    query.run(system.update);

    expect(system.update).toHaveBeenCalledTimes(1);

    const entity2 = world.createEntity(new TagComponent(), new PositionComponent());
    query.run(system.update);

    expect(system.update).toHaveBeenCalledTimes(3);

    world.destroyEntity(entity1);
    world.destroyEntity(entity2);

    query.run(system.update);

    expect(system.update).toHaveBeenCalledTimes(3);
  });

  it('should return from query', () => {

    const cbs = {
      cb1(_e: Entity, tag: TagComponent) {
        return tag;
      },
      cb2(_e: Entity, _tag: TagComponent) {
        return;
      }
    };

    spyOn(cbs, 'cb1').and.callThrough();
    spyOn(cbs, 'cb2').and.callThrough();

    const query = world.createQuery(TagComponent);
    const result1 = query.run(cbs.cb1);

    expect(result1).toBeUndefined();
    expect(cbs.cb1).toHaveBeenCalledTimes(0);

    world.createEntity(new TagComponent());
    world.createEntity(new TagComponent());

    const result2 = query.run(cbs.cb2);

    expect(result2).toBeUndefined();
    expect(cbs.cb2).toHaveBeenCalledTimes(2);

    const result3 = query.run(cbs.cb1);

    expect(result3).toBeInstanceOf(TagComponent);
    expect(cbs.cb1).toHaveBeenCalledTimes(1);
  });
});
