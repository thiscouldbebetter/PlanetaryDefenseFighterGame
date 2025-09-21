"use strict";
class EnemyObstructor extends Enemy {
    constructor(pos) {
        super(EnemyObstructor.name, pos, [
            Actor.fromActivityDefnName(EnemyObstructor.activityDefnBuild().name),
            Drawable.fromVisual(EnemyObstructor.visualBuild()),
            Enemy.killableBuild(),
            Scorable.fromPoints(100)
        ]);
    }
    static fromPos(pos) {
        return new EnemyObstructor(pos);
    }
    static activityDefnBuild() {
        return new ActivityDefn(EnemyObstructor.name, EnemyObstructor.activityDefnPerform);
    }
    static activityDefnPerform(uwpe) {
        // Do nothing.
    }
    static visualBuild() {
        var dimension = 8;
        var visualBuilder = VisualBuilder.Instance();
        var visual = visualBuilder.archeryTarget(dimension);
        return visual;
    }
}
