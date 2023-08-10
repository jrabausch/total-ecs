export class ComponentEvent {
    constructor(component, entity) {
        this.component = component;
        this.entity = entity;
    }
}
export class ComponentEnterEvent extends ComponentEvent {
}
;
export class ComponentLeaveEvent extends ComponentEvent {
}
;
