"use strict";
class Enemy extends Entity {
    constructor(pos) {
        super(Enemy.name, [
            Actor.fromActivityDefnName(Enemy.activityDefnBuild().name),
            Collidable.fromColliderPropertyNameAndCollide(Sphere.fromRadius(4), Player.name, (uwpe, c) => {
                var entityOther = uwpe.entity2;
                if (entityOther.name == Player.name) {
                    var playerEntity = entityOther;
                    var playerKillable = Killable.of(playerEntity);
                    playerKillable.kill();
                }
            }),
            Constrainable.fromConstraint(Constraint_WrapToPlaceSizeX.create()),
            Drawable.fromVisual(Enemy.visualBuild()).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1)),
            EnemyProperty.create(),
            Killable.fromDie(Enemy.killableDie),
            Locatable.fromPos(pos),
            Movable.fromAccelerationAndSpeedMax(2, 1),
            Scorable.fromPoints(100)
        ]);
    }
    static fromPos(pos) {
        return new Enemy(pos);
    }
    static activityDefnBuild() {
        return new ActivityDefn(Enemy.name, Enemy.activityDefnPerform);
    }
    static activityDefnPerform(uwpe) {
        var universe = uwpe.universe;
        var randomizer = universe.randomizer;
        var place = uwpe.place;
        var entity = uwpe.entity;
        var enemy = entity;
        var enemyPos = Locatable.of(enemy).loc.pos;
        var enemyActor = Actor.of(enemy);
        var enemyActivity = enemyActor.activity;
        var targetEntity = enemyActivity.targetEntity();
        if (targetEntity == null) {
            var placePlanet = place;
            var habitats = placePlanet.habitats();
            var enemies = placePlanet.enemies();
            var habitatsNotAlreadyCapturedOrTargeted = habitats.filter(h => (enemies.some(e => EnemyProperty.of(e).habitatCaptured == h) == false)
                &&
                    (enemies.some(e => Actor.of(e).activity.targetEntity() == h) == false));
            if (habitatsNotAlreadyCapturedOrTargeted.length == 0) {
                var planet = place.planet();
                var placeSize = place.size();
                var placeSizeMinusGround = placeSize.clone().subtract(Coords.fromXY(0, planet.horizonHeight));
                var posRandom = Coords.random(randomizer).multiply(placeSizeMinusGround);
                targetEntity = Entity.fromNameAndProperty("RandomPoint", Locatable.fromPos(posRandom));
            }
            else {
                targetEntity = ArrayHelper.random(habitatsNotAlreadyCapturedOrTargeted, randomizer);
            }
        }
        enemyActivity.targetEntitySet(targetEntity);
        var targetPos = Locatable.of(targetEntity).loc.pos;
        var displacementToTarget = Enemy.displacement()
            .overwriteWith(targetPos)
            .subtract(enemyPos);
        var distanceToTarget = displacementToTarget.magnitude();
        var enemyMovable = Movable.of(enemy);
        var enemyAccelerationPerTick = enemyMovable.accelerationPerTick(uwpe);
        if (distanceToTarget >= enemyAccelerationPerTick) {
            var enemySpeedMax = enemyMovable.speedMax(uwpe);
            var displacementToMove = displacementToTarget
                .divideScalar(distanceToTarget)
                .multiplyScalar(enemySpeedMax);
            enemyPos.add(displacementToMove);
        }
        else {
            enemyPos.overwriteWith(targetPos);
            var enemyProperty = EnemyProperty.of(enemy);
            var targetIsHabitat = (targetEntity.constructor.name == Habitat.name);
            if (targetIsHabitat) {
                var targetHabitat = targetEntity;
                enemyProperty.habitatCaptured = targetHabitat;
                var targetConstrainable = Constrainable.of(targetEntity);
                var constraintToAddToTarget = Constraint_Multiple.fromChildren([
                    Constraint_AttachToEntityWithId
                        .fromTargetEntityId(enemy.id),
                    Constraint_Transform.fromTransform(Transform_Translate.fromDisplacement(Coords.fromXY(0, 10)))
                ]);
                targetConstrainable
                    .constraintAdd(constraintToAddToTarget);
                targetEntity = Entity.fromNameAndProperty("EscapePoint", Locatable.fromPos(enemyPos.clone().addXY(0, 0 - place.size().y)));
                enemyActivity.targetEntitySet(targetEntity);
            }
            else if (enemyPos.y >= 0) {
                // Choose another random point to wander to.
                enemyActivity.targetEntityClear();
            }
            else {
                // Escape.
                place.entityToRemoveAdd(enemyProperty.habitatCaptured);
                place.entityToRemoveAdd(enemy);
            }
        }
    }
    static displacement() {
        if (this._displacement == null) {
            this._displacement = Coords.create();
        }
        return this._displacement;
    }
    static killableDie(uwpe) {
        var enemy = uwpe.entity;
        var enemyProperty = EnemyProperty.of(enemy);
        var habitatCaptured = enemyProperty.habitatCaptured;
        if (habitatCaptured != null) {
            var constrainable = Constrainable.of(habitatCaptured);
            constrainable.constraintRemoveFinal();
        }
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
    static visualBuild() {
        var colors = Color.Instances();
        return VisualGroup.fromChildren([
            VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill(6, 4, colors.Green),
            VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill(4, 3, colors.Red),
            VisualFan.fromRadiusAnglesStartAndSpannedAndColorsFillAndBorder(4, // radius
            .5, .5, // angleStart-, angleSpannedInTurns
            colors.Red, null // colorFill, colorBorder
            )
        ]);
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
