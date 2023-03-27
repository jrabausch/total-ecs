"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentLeaveEvent = exports.ComponentEnterEvent = exports.ComponentEvent = void 0;
class ComponentEvent {
    constructor(component, entity) {
        this.component = component;
        this.entity = entity;
    }
}
exports.ComponentEvent = ComponentEvent;
;
class ComponentEnterEvent extends ComponentEvent {
}
exports.ComponentEnterEvent = ComponentEnterEvent;
;
class ComponentLeaveEvent extends ComponentEvent {
}
exports.ComponentLeaveEvent = ComponentLeaveEvent;
;
