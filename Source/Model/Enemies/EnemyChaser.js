"use strict";
class EnemyChaser extends Enemy {
    constructor(pos, vel) {
        super(EnemyChaser.name, pos, [
            Actor.fromActivityDefnName(EnemyChaser.activityDefnBuild().name),
            Device.fromNameTicksToChargeAndUse("Gun", 60, // 3 seconds
            // 3 seconds
            uwpe => ProjectileShooter.of(uwpe.entity).generatorDefault().fire(uwpe) // use
            ),
            Drawable.fromVisual(EnemyChaser.visualBuild()),
            Enemy.killableBuild(),
            Enemy.projectileShooterBuild(),
            Movable.fromAccelerationPerTickAndSpeedMax(2, 1),
            Scorable.fromPoints(150)
        ]);
        Locatable.of(this).loc.vel.overwriteWith(vel);
    }
    static fromPosAndVel(pos, vel) {
        return new EnemyChaser(pos, vel);
    }
    static activityDefnBuild() {
        return new ActivityDefn(EnemyChaser.name, EnemyChaser.activityDefnPerform);
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
        Enemy.activityDefnPerform_MoveTowardTarget(uwpe, EnemyChaser.activityDefnPerform_MoveTowardTarget_TargetHasBeenReached);
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
    static visualBuild() {
        var colors = Color.Instances();
        var color = colors.Red;
        var dimension = 6;
        var visualBuilder = VisualBuilder.Instance();
        var visual = visualBuilder.rhombusOfColor(color).transform(Transform_Scale.fromScaleFactor(dimension));
        return visual;
    }
}
