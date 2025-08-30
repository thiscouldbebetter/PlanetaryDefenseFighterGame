"use strict";
class Enemy extends Entity {
    constructor(name, pos, properties) {
        var propertyDrawable = properties.find(x => x.propertyName() == Drawable.name);
        propertyDrawable.sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1));
        var propertiesCommonToAllEnemies = [
            Enemy.collidableBuild(),
            Enemy.constrainableBuild(),
            EnemyProperty.create(),
            Locatable.fromPos(pos)
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
        var deviceGun = Device.of(enemy);
        uwpe.entity2Set(enemy); // For Device.
        var deviceGunCanBeUsed = deviceGun.canUse(uwpe);
        if (deviceGunCanBeUsed) {
            var playerPos = Locatable.of(player).pos();
            var displacementToPlayer = playerPos.clone().subtract(enemyPos);
            var distanceToPlayer = displacementToPlayer.magnitude();
            var projectileGenerator = ProjectileGenerator.of(enemy);
            var projectileRange = projectileGenerator.range();
            if (distanceToPlayer < projectileRange) {
                var directionToPlayer = displacementToPlayer.normalize();
                enemyDisp.orientation.forwardSet(directionToPlayer);
                deviceGun.use(uwpe);
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
        return Collidable.fromColliderPropertyNameAndCollide(Sphere.fromRadius(4), Player.name, (uwpe, c) => {
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
    static killableDie(uwpe) {
        var enemy = uwpe.entity;
        var entityExplosion = uwpe.universe.entityBuilder.explosion(Locatable.of(enemy).loc.pos, 10, // radius
        "Effects_Boom", 40, // ticksToLive
        (uwpe) => { });
        var place = uwpe.place;
        place.entityToSpawnAdd(entityExplosion);
        // Stats.
        var player = place.player();
        var playerStatsKeeper = StatsKeeper.of(player);
        playerStatsKeeper.killsIncrement();
        var scorable = Scorable.of(enemy);
        var scoreForKillingEnemy = scorable.scoreGet(uwpe);
        playerStatsKeeper.scoreAdd(scoreForKillingEnemy);
    }
    static projectileGeneratorBuild() {
        return ProjectileGenerator.default();
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
