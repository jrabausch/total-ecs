import type { Component, Entity } from './interfaces';

export abstract class ComponentEvent<T extends Component> {
  readonly component: T;
  readonly entity: Entity;
  constructor(component: T, entity: Entity) {
    this.component = component;
    this.entity = entity;
  }
}

export class ComponentEnterEvent<T extends Component> extends ComponentEvent<T> { };
export class ComponentLeaveEvent<T extends Component> extends ComponentEvent<T> { };
