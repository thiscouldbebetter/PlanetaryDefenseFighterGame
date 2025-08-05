"use strict";
class Habitat extends Entity {
    constructor(pos) {
        super(Habitat.name, [
            Constrainable.fromConstraints([
                Constraint_Gravity.fromAccelerationPerTick(Coords.fromXY(0, .03)),
                Constraint_ContainInHemispace.fromHemispace(Hemispace.fromPlane(Plane.fromNormalAndDistanceFromOrigin(Coords.fromXY(0, 1), 250)))
            ]),
            Drawable.fromVisual(Habitat.visualBuild()).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1)),
            HabitatProperty.create(),
            Locatable.fromPos(pos)
        ]);
    }
    static fromPos(pos) {
        return new Habitat(pos);
    }
    static visualBuild() {
        return VisualPolygon.fromVerticesAndColorFill([
            Coords.fromXY(4, 0),
            Coords.fromXY(-4, 0),
            Coords.fromXY(-4, -4),
            Coords.fromXY(0, -8),
            Coords.fromXY(4, -4)
        ], Color.byName("Brown"));
    }
}
class HabitatProperty extends EntityPropertyBase {
    static create() {
        return new HabitatProperty();
    }
}
