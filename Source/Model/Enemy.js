"use strict";
class Enemy extends Entity {
    constructor(name, pos, properties) {
        var propertiesCommonToAllEnemies = [
            Enemy.collidableBuild(),
            Enemy.constrainableBuild(),
            EnemyProperty.create(),
            Enemy.killableBuild(),
            Locatable.fromPos(pos),
            PlacePlanet.wrappableBuild()
        ];
        properties.push(...propertiesCommonToAllEnemies);
        super(name, properties);
    }
    static activityDefnPerform_ChooseTargetEntity_RandomPoint(uwpe) {
        var place = uwpe.place;
        var planet = place.planet();
        var placeSize = place.size();
        var placeSizeMinusGround = placeSize
            .clone()
            .subtract(Coords.fromXY(0, planet.horizonHeight));
        var randomizer = uwpe.universe.randomizer;
        var posRandom = Coords.random(randomizer).multiply(placeSizeMinusGround);
        var targetEntity = Entity.fromNameAndProperty("RandomPoint", Locatable.fromPos(posRandom));
        return targetEntity;
    }
    static activityDefnPerform_FireGunAtPlayerIfCharged(uwpe) {
        var enemy = uwpe.entity;
        var enemyDisp = Locatable.of(enemy).loc;
        var enemyPos = enemyDisp.pos;
        var place = uwpe.place;
        var player = place.player();
        if (player != null) {
            var deviceGun = Device.of(enemy);
            uwpe.entity2Set(enemy); // For Device.
            var deviceGunCanBeUsed = deviceGun.canUse(uwpe);
            if (deviceGunCanBeUsed) {
                var playerPos = Locatable.of(player).pos();
                var displacementToPlayer = playerPos.clone().subtract(enemyPos);
                var distanceToPlayer = displacementToPlayer.magnitude();
                var projectileShooter = ProjectileShooter.of(enemy);
                var projectileGenerator = projectileShooter.generatorDefault();
                var projectileRange = projectileGenerator.range();
                if (distanceToPlayer < projectileRange) {
                    var directionToPlayer = displacementToPlayer.normalize();
                    enemyDisp.orientation.forwardSet(directionToPlayer);
                    deviceGun.use(uwpe);
                }
            }
        }
    }
    static activityDefnPerform_MoveTowardTarget(uwpe, targetHasBeenReached) {
        var enemy = uwpe.entity;
        var enemyPos = Locatable.of(enemy).pos();
        var enemyActor = Actor.of(enemy);
        var enemyActivity = enemyActor.activity;
        var targetEntity = enemyActivity.targetEntity();
        var targetPos = Locatable.of(targetEntity).loc.pos;
        var displacementToTarget = Enemy
            .displacement()
            .overwriteWith(targetPos)
            .subtract(enemyPos);
        var distanceToTarget = displacementToTarget.magnitude();
        var directionToTarget = displacementToTarget.clone().divideScalar(distanceToTarget);
        var enemyMovable = Movable.of(enemy);
        var enemyAccelerationPerTick = enemyMovable.accelerationPerTickInDirection(uwpe, directionToTarget);
        if (distanceToTarget >= enemyAccelerationPerTick) {
            var enemySpeedMax = enemyMovable.speedMax(uwpe);
            var displacementToMove = displacementToTarget
                .divideScalar(distanceToTarget)
                .multiplyScalar(enemySpeedMax);
            enemyPos.add(displacementToMove);
        }
        else {
            targetHasBeenReached(uwpe);
        }
    }
    static activityDefnPerform_TargetClear(uwpe) {
        var enemy = uwpe.entity;
        var enemyActivity = Actor.of(enemy).activity;
        enemyActivity.targetEntityClear();
    }
    static collidableBuild() {
        var collider = Sphere.fromRadius(4);
        return Collidable.fromColliderPropertyNameAndCollide(collider, Player.name, (uwpe, c) => {
            var entityOther = uwpe.entity2;
            if (entityOther.name == Player.name) {
                var playerEntity = entityOther;
                var playerKillable = Killable.of(playerEntity);
                playerKillable.kill();
                var enemyEntity = uwpe.entity;
                var enemyKillable = Killable.of(enemyEntity);
                enemyKillable.kill();
            }
        });
    }
    static constrainableBuild() {
        return Constrainable.fromConstraint(Constraint_WrapToPlaceSizeX.create());
    }
    static killableBuild() {
        return Killable.fromDie(this.killableDie);
    }
    static killableDie(uwpe) {
        var place = uwpe.place;
        var enemy = uwpe.entity;
        var entityExplosion = uwpe.universe.entityBuilder.explosion(Locatable.of(enemy).loc.pos, 10, // radius
        "Effects_Boom", 40, // ticksToLive
        (uwpe) => { });
        entityExplosion
            .propertyAdd(EnemyProperty.create())
            .propertyAdd(PlacePlanet.wrappableBuild());
        place.entityToSpawnAdd(entityExplosion);
        // Stats.
        var player = place.player();
        var playerStatsKeeper = StatsKeeper.of(player);
        playerStatsKeeper.killsIncrement();
        var scorable = Scorable.of(enemy);
        var scoreForKillingEnemy = scorable.scoreGet(uwpe);
        playerStatsKeeper.scoreAdd(scoreForKillingEnemy);
    }
    static projectileShooterBuild() {
        var propertyNames = [Playable.name];
        var shooter = ProjectileShooter.default()
            .collideOnlyWithEntitiesHavingPropertiesNamedSet(propertyNames);
        return shooter;
    }
    static displacement() {
        if (this._displacement == null) {
            this._displacement = Coords.create();
        }
        return this._displacement;
    }
}
class EnemyProperty extends EntityPropertyBase {
    static create() {
        return new EnemyProperty();
    }
    static of(entity) {
        return entity.propertyByName(EnemyProperty.name);
    }
    // Clonable.
    clone() {
        return new EnemyProperty();
    }
}
