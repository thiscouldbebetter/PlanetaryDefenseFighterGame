"use strict";
class EnemyBurster extends Enemy {
    constructor(pos) {
        super(EnemyBurster.name, pos, [
            Actor.fromActivityDefnName(EnemyBurster.activityDefnBuild().name),
            Carrier.create(),
            Drawable.fromVisual(EnemyBurster.visualBuild()),
            Killable.fromDie(EnemyBurster.killableDie),
            Movable.fromAccelerationPerTickAndSpeedMax(2, 1),
            Enemy.projectileShooterBuild(),
            Scorable.fromPoints(1000)
        ]);
    }
    static fromPos(pos) {
        return new EnemyBurster(pos);
    }
    static activityDefnBuild() {
        return new ActivityDefn(EnemyBurster.name, EnemyBurster.activityDefnPerform);
    }
    static activityDefnPerform(uwpe) {
        var place = uwpe.place;
        var enemy = uwpe.entity;
        var player = place.player();
        if (player != null) {
            var enemyActor = Actor.of(enemy);
            var enemyActivity = enemyActor.activity;
            var targetEntity = enemyActivity.targetEntity();
            if (targetEntity == null) {
                targetEntity = place.player();
            }
            enemyActivity.targetEntitySet(targetEntity);
            Enemy.activityDefnPerform_MoveTowardTarget(uwpe, EnemyBurster.activityDefnPerform_MoveTowardTarget_TargetHasBeenReached);
        }
    }
    static activityDefnPerform_MoveTowardTarget_TargetHasBeenReached(uwpe) {
        var enemy = uwpe.entity;
        var enemyActivity = Actor.of(enemy).activity;
        var targetEntity = enemyActivity.targetEntity();
        var targetPos = Locatable.of(targetEntity).pos();
        var enemyPos = Locatable.of(enemy).pos();
        enemyPos.overwriteWith(targetPos);
        enemyActivity.targetEntityClear();
    }
    static generatorBuildForBoxAndLevelIndex(enemyGenerationZone, levelIndex) {
        var levelOfFirstAppearanceIndex = 2;
        var enemiesAdditionalPerLevel = 1;
        var enemiesCount = enemiesAdditionalPerLevel * (levelIndex - levelOfFirstAppearanceIndex);
        var enemyBursterGenerator = EntityGenerator.fromNameEntityTicksBatchMaxesAndPosBox(EntityGenerator.name + EnemyBurster.name, EnemyBurster.fromPos(Coords.create()), 0, // ticksPerGeneration
        enemiesCount, // entitiesPerGeneration
        enemiesCount, // concurrent
        enemiesCount, // all-time
        enemyGenerationZone);
        return enemyBursterGenerator;
    }
    static killableDie(uwpe) {
        Enemy.killableDie(uwpe);
        var entityKilled = uwpe.entity;
        var entityKilledPos = Locatable.of(entityKilled).pos();
        var place = uwpe.place;
        var chasersToSpawnCount = 4;
        var distanceToGenerateChasersAt = 10;
        var polarForAngle = Polar.fromAzimuthInTurnsAndRadius(0, distanceToGenerateChasersAt);
        for (var i = 0; i < chasersToSpawnCount; i++) {
            var azimuthInTurns = i / chasersToSpawnCount;
            var chaserOffset = polarForAngle
                .azimuthInTurnsSet(azimuthInTurns)
                .toCoords();
            var chaserVel = chaserOffset.clone();
            var chaserPos = entityKilledPos.clone().add(chaserOffset);
            var entityChaser = EnemyChaser.fromPosAndVel(chaserPos, chaserVel);
            place.entityToSpawnAdd(entityChaser);
        }
    }
    static visualBuild() {
        var dimension = 16;
        var colors = Color.Instances();
        var colorBody = colors.Green;
        var colorHighlight = colors.Red;
        var visualBuilder = VisualBuilder.Instance();
        var visualBody = visualBuilder.crystal(dimension, colorBody, colorHighlight);
        var visualPreoriented = VisualPolygonPreoriented.fromVisualPolygonInner(visualBody);
        return visualPreoriented;
    }
}
