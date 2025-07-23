"use strict";
class Player extends Entity {
    constructor(pos) {
        super(Player.name, [
            Actor.fromActivityDefnName(UserInputListener.activityDefn().name),
            Collidable.fromCollider(Sphere.fromRadius(4)),
            Constrainable.fromConstraints([
                Constraint_WrapToPlaceSizeXTrimY.create(),
                Constraint_ContainInHemispace.fromHemispace(Hemispace.fromPlane(Plane.fromNormalAndDistanceFromOrigin(Coords.fromXY(0, 1), 250))),
                Constraint_OrientationRound.fromHeadingsCount(2)
            ]),
            Controllable.fromToControl(uwpe => Player.toControl(uwpe)),
            Drawable.fromVisual(Player.visualBuild()),
            Killable.fromTicksOfImmunityDieAndLives(40, Player.killableDie, 2),
            Locatable.fromDisposition(Disposition.fromPosAndVel(Coords.fromXY(100, 100), // pos
            Coords.fromXY(1, 0) // vel
            )),
            Movable.fromAccelerationAndSpeedMax(0.2, 8),
            Playable.create(),
            ProjectileGenerator.fromNameAndGenerations("Bullet", [
                ProjectileGeneration.fromRadiusDistanceSpeedTicksDamageVisualAndInit(2, // radius
                5, // distanceInitial
                16, // speed
                8, // ticksToLive
                Damage.fromAmount(1), VisualGroup.fromChildren([
                    VisualSound.default(),
                    VisualCircle.fromRadiusAndColorFill(2, Color.Instances().Yellow)
                ]), (entity) => {
                    entity.propertyAdd(Constrainable.fromConstraint(Constraint_WrapToPlaceSizeXTrimY.create()));
                    Drawable.of(entity).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1));
                })
            ])
        ]);
    }
    static fromPos(pos) {
        return new Player(pos);
    }
    static killableDie(uwpe) {
        var playerEntity = uwpe.entity;
        var playerLoc = Locatable.of(playerEntity).loc;
        var playerPos = playerLoc.pos;
        var place = uwpe.place;
        var playerExplosionAndRespawner = Entity.fromNameAndProperties("PlayerExplosionAndRespawner", [
            Drawable.fromVisual(VisualGroup.fromChildren([
                VisualSound.default(),
                VisualCircle.fromRadiusAndColorFill(10, Color.Instances().Yellow)
            ])),
            Ephemeral.fromTicksAndExpire(60, // 3 seconds.
            // 3 seconds.
            uwpe => {
                var playerKillable = Killable.of(playerEntity);
                if (playerKillable.livesInReserve > 0) {
                    playerKillable.livesInReserve--;
                    playerLoc.clear();
                    var placeSizeHalf = place.size().clone().half();
                    playerPos.overwriteWith(placeSizeHalf);
                    playerKillable.integritySetToMax();
                    place.entityToSpawnAdd(playerEntity);
                }
            }),
            Locatable.fromPos(playerPos.clone()),
            Playable.create()
        ]);
        place.entityToSpawnAdd(playerExplosionAndRespawner);
    }
    static toControl(uwpe) {
        return ControlContainer.fromPosSizeAndChildren(Coords.fromXY(0, 0), // pos
        Coords.fromXY(40, 50), // size
        [
            ControlVisual.fromPosAndVisual(Coords.fromXY(8, 10), DataBinding.fromContext(Player.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(20, 4), DataBinding.fromGet(() => "" + Killable.of(uwpe.entity).livesInReserve)),
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
