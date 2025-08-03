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
            Player.projectileGenerator(),
            StatsKeeper.create()
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
    static projectileGenerator() {
        return ProjectileGenerator.fromNameFireAndGenerations("Bullet", uwpe => {
            var place = uwpe.place;
            var player = place.player();
            var playerStatsKeeper = StatsKeeper.of(player);
            playerStatsKeeper.shotsIncrement();
            ProjectileGenerator.fireDefault(uwpe);
        }, [
            ProjectileGeneration.fromRadiusDistanceSpeedTicksHitDamageVisualAndInit(2, // radius
            5, // distanceInitial
            16, // speed
            8, // ticksToLive
            // ticksToLive
            uwpe => // hit
             {
                var place = uwpe.place;
                var player = place.player();
                var playerStatsKeeper = StatsKeeper.of(player);
                playerStatsKeeper.hitsIncrement();
            }, Damage.fromAmount(1), VisualGroup.fromChildren([
                VisualSound.fromSoundName("Effects_Blip"),
                VisualCircle.fromRadiusAndColorFill(2, Color.Instances().Yellow)
            ]), (entity) => {
                entity.propertyAdd(Constrainable.fromConstraint(Constraint_WrapToPlaceSizeXTrimY.create()));
                Drawable.of(entity).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1));
            })
        ]);
    }
    static toControl(uwpe) {
        var place = uwpe.place;
        var player = place.player();
        var placeSize = place.size();
        var playerStatsKeeper = StatsKeeper.of(player);
        var visualBuilder = VisualBuilder.Instance();
        var visualKills = visualBuilder.explosionStarburstOfRadius(8);
        var visualScore = visualBuilder.starburstWithPointsRatioRadiusAndColor(5, // points
        .5, // radiusInnerAsFractionOfOuter
        6, // radiusOuter
        Color.Instances().Yellow);
        return ControlContainer.fromPosSizeAndChildren(Coords.fromXY(0, placeSize.y - 20), // pos
        Coords.fromXY(40, 50), // size
        [
            ControlVisual.fromPosAndVisual(Coords.fromXY(10, 10), DataBinding.fromContext(Player.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(20, 4), DataBinding.fromGet(() => "" + Killable.of(uwpe.entity).livesInReserve)),
            ControlVisual.fromPosAndVisual(Coords.fromXY(40, 15), DataBinding.fromContext(Habitat.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(50, 4), DataBinding.fromGet(() => "" + place.habitats().length)),
            ControlVisual.fromPosAndVisual(Coords.fromXY(70, 10), DataBinding.fromContext(Enemy.visualBuild())),
            ControlLabel.fromPosAndText(Coords.fromXY(80, 4), DataBinding.fromGet(() => "" + place.enemies().length)),
            ControlVisual.fromPosAndVisual(Coords.fromXY(100, 10), DataBinding.fromContext(visualKills)),
            ControlLabel.fromPosAndText(Coords.fromXY(110, 4), DataBinding.fromGet(() => "" + playerStatsKeeper.kills())),
            ControlVisual.fromPosAndVisual(Coords.fromXY(130, 10), DataBinding.fromContext(visualScore)),
            ControlLabel.fromPosAndText(Coords.fromXY(140, 4), DataBinding.fromGet(() => "" + playerStatsKeeper.score()))
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
