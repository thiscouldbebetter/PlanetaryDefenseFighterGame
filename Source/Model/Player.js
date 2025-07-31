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
                    VisualSound.fromSoundName("Effects_Blip"),
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
        var playerExplosionAndRespawner = uwpe.universe.entityBuilder.explosion(playerPos.clone(), 10, "Effects_Boom", 60, // 3 seconds.
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
        });
        playerExplosionAndRespawner.propertyAdd(Playable.create());
        place.entityToSpawnAdd(playerExplosionAndRespawner);
    }
    static toControl(uwpe) {
        var place = uwpe.place;
        var placeSize = place.size();
        return ControlContainer.fromPosSizeAndChildren(Coords.fromXY(0, placeSize.y - 20), // pos
        Coords.fromXY(40, 50), // size
        [
            ControlVisual.fromPosAndVisual(Coords.fromXY(10, 10), DataBinding.fromContext(Player.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(20, 4), DataBinding.fromGet(() => "" + Killable.of(uwpe.entity).livesInReserve)),
            ControlVisual.fromPosAndVisual(Coords.fromXY(40, 15), DataBinding.fromContext(Habitat.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(50, 4), DataBinding.fromGet(() => "" + place.habitats().length)),
            ControlVisual.fromPosAndVisual(Coords.fromXY(70, 10), DataBinding.fromContext(Enemy.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(80, 4), DataBinding.fromGet(() => "" + place.enemies().length)),
            ControlVisual.fromPosAndVisual(Coords.fromXY(100, 10), DataBinding.fromContext(VisualBuilder.Instance().archeryTarget(6))),
            ControlLabel.fromPosAndText(Coords.fromXY(110, 4), DataBinding.fromGet(() => "" + uwpe.world.statsKeeper.kills()))
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
