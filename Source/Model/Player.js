"use strict";
class Player extends Entity {
    constructor(pos) {
        super(Player.name, [
            Actor.fromActivityDefnName(UserInputListener.activityDefn().name),
            Constrainable.fromConstraints([
                Constraint_WrapToPlaceSizeXTrimY.create(),
                Constraint_ContainInHemispace.fromHemispace(Hemispace.fromPlane(Plane.fromNormalAndDistanceFromOrigin(Coords.fromXY(0, 1), 250))),
                Constraint_OrientationRound.fromHeadingsCount(2)
            ]),
            Controllable.fromToControl(uwpe => Player.toControl(uwpe)),
            Drawable.fromVisual(Player.visualBuild()),
            Locatable.fromDisposition(Disposition.fromPosAndVel(Coords.fromXY(100, 100), // pos
            Coords.fromXY(1, 0) // vel
            )),
            Movable.fromAccelerationAndSpeedMax(0.2, 2),
            Playable.create(),
            ProjectileGenerator.fromNameAndGenerations("Bullet", [
                ProjectileGeneration.fromRadiusDistanceSpeedTicksDamageVisualAndInit(2, // radius
                5, // distanceInitial
                4, // speed
                32, // ticksToLive
                Damage.fromAmount(1), VisualGroup.fromChildren([
                    VisualSound.default(),
                    VisualCircle.fromRadiusAndColorFill(2, Color.Instances().Yellow)
                ]), (entity) => {
                    entity.propertyAdd(Constrainable.fromConstraint(Constraint_WrapToPlaceSizeXTrimY.create()));
                    Drawable.of(entity).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1));
                })
            ])
        ]);
        this.shipsInReserve = 0;
    }
    static fromPos(pos) {
        return new Player(pos);
    }
    static toControl(uwpe) {
        return ControlContainer.fromPosSizeAndChildren(Coords.fromXY(0, 0), // pos
        Coords.fromXY(40, 50), // size
        [
            ControlVisual.fromPosAndVisual(Coords.fromXY(8, 10), DataBinding.fromContext(Player.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(20, 4), DataBinding.fromGet(() => "" + uwpe.entity.shipsInReserve)),
            ControlVisual.fromPosAndVisual(Coords.fromXY(8, 30), DataBinding.fromContext(Habitat.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(20, 20), DataBinding.fromGet(() => "" + uwpe.place.habitats().length)),
            ControlVisual.fromPosAndVisual(Coords.fromXY(8, 42), DataBinding.fromContext(Raider.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(20, 35), DataBinding.fromGet(() => "" + uwpe.place.raiders().length))
        ]).toControlContainerTransparent();
    }
    static visualBuild() {
        return VisualPolygon.fromVerticesAndColorFill([
            Coords.fromXY(-5, -5),
            Coords.fromXY(5, 0),
            Coords.fromXY(-5, 5),
        ], Color.Instances().Gray);
    }
}
