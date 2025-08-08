"use strict";
class Carrier extends EntityPropertyBase {
    static create() {
        return new Carrier();
    }
    static of(entity) {
        return entity.propertyByName(Carrier.name);
    }
    // Clonable.
    clone() {
        return new Carrier();
    }
}
