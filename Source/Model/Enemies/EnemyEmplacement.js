"use strict";
class EnemyEmplacement extends Enemy {
    constructor(pos) {
        super(EnemyEmplacement.name, pos, [
            Actor.fromActivityDefnName(EnemyEmplacement.activityDefnBuild().name),
            Device.fromNameTicksToChargeAndUse("Gun", 60, // 3 seconds
            // 3 seconds
            uwpe => ProjectileShooter.of(uwpe.entity).generatorDefault().fire(uwpe) // use
            ),
            Drawable.fromVisual(EnemyEmplacement.visualBuild()),
            Enemy.killableBuild(),
            Enemy.projectileShooterBuild(),
            Scorable.fromPoints(200)
        ]);
    }
    static fromPos(pos) {
        return new EnemyEmplacement(pos);
    }
    static activityDefnBuild() {
        return new ActivityDefn(EnemyEmplacement.name, EnemyEmplacement.activityDefnPerform);
    }
    static activityDefnPerform(uwpe) {
        var place = uwpe.place;
        var player = place.player();
        if (player != null) {
            Enemy.activityDefnPerform_FireGunAtPlayerIfCharged(uwpe);
        }
    }
    static visualBuild() {
        var dimension = 4;
        var color = Color.Instances().Green;
        var visual = VisualCircle.fromRadiusAndColorFill(dimension, color);
        return visual;
    }
}
