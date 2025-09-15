"use strict";
class EnemyBurster extends Enemy {
    constructor(pos) {
        super(EnemyBurster.name, pos, [
            Actor.fromActivityDefnName(EnemyBurster.activityDefnBuild().name),
            Carrier.create(),
            Device.fromNameTicksToChargeAndUse("Gun", 60, // 3 seconds
            // 3 seconds
            uwpe => ProjectileShooter.of(uwpe.entity).generatorDefault().fire(uwpe) // use
            ),
            Drawable.fromVisual(EnemyBurster.visualBuild()),
            Killable.fromDie(EnemyBurster.killableDie),
            Movable.fromAccelerationPerTickAndSpeedMax(2, 1),
            Enemy.projectileShooterBuild(),
            Scorable.fromPoints(100)
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
            Enemy.activityDefnPerform_FireGunAtPlayerIfCharged(uwpe);
        }
        var enemyActor = Actor.of(enemy);
        var enemyActivity = enemyActor.activity;
        var targetEntity = enemyActivity.targetEntity();
        if (targetEntity == null) {
            targetEntity = place.player();
        }
        enemyActivity.targetEntitySet(targetEntity);
        Enemy.activityDefnPerform_MoveTowardTarget(uwpe, EnemyBurster.activityDefnPerform_MoveTowardTarget_TargetHasBeenReached);
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
    static killableDie(uwpe) {
        Enemy.killableDie(uwpe);
        var entityKilled = uwpe.entity;
        var entityKilledPos = Locatable.of(entityKilled).pos();
        var place = uwpe.place;
        var chasersToSpawnCount = 4;
        var polar = Polar.fromAzimuthInTurnsAndRadius(0, 1);
        for (var i = 0; i < chasersToSpawnCount; i++) {
            var azimuthInTurns = i / chasersToSpawnCount;
            var chaserVel = polar
                .azimuthInTurnsSet(azimuthInTurns)
                .toCoords();
            var entityChaser = EnemyChaser.fromPosAndVel(entityKilledPos, chaserVel);
            place.entityToSpawnAdd(entityChaser);
        }
    }
    static visualBuild() {
        var dimension = 16;
        var colors = Color.Instances();
        var colorBody = colors.Green;
        var colorHighlight = colors.Red;
        var visualBuilder = VisualBuilder.Instance();
        var visual = visualBuilder.crystal(dimension, colorBody, colorHighlight);
        return visual;
    }
}
