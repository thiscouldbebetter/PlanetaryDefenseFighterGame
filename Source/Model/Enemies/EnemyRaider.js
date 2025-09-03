"use strict";
class EnemyRaider extends Enemy {
    constructor(pos) {
        super(EnemyRaider.name, pos, [
            Actor.fromActivityDefnName(EnemyRaider.activityDefnBuild().name),
            Carrier.create(),
            Device.fromNameTicksToChargeAndUse("Gun", 100, // 5 seconds
            // 5 seconds
            uwpe => ProjectileGenerator.of(uwpe.entity).fire(uwpe) // use
            ),
            Drawable.fromVisual(EnemyRaider.visualBuild()),
            Killable.fromDie(EnemyRaider.killableDie),
            Enemy.projectileGeneratorBuild(),
            Movable.fromAccelerationPerTickAndSpeedMax(2, 1),
            Scorable.fromPoints(100)
        ]);
    }
    static fromPos(pos) {
        return new EnemyRaider(pos);
    }
    static activityDefnBuild() {
        return new ActivityDefn(EnemyRaider.name, EnemyRaider.activityDefnPerform);
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
            targetEntity =
                EnemyRaider.activityDefnPerform_ChooseTargetEntity(uwpe);
        }
        enemyActivity.targetEntitySet(targetEntity);
        Enemy.activityDefnPerform_MoveTowardTarget(uwpe, EnemyRaider.activityDefnPerform_MoveTowardTarget_TargetHasBeenReached);
    }
    static activityDefnPerform_ChooseTargetEntity(uwpe) {
        var place = uwpe.place;
        var placePlanet = place;
        var habitats = placePlanet.habitats();
        var enemies = placePlanet.enemies();
        var habitatsNotAlreadyCapturedOrTargeted = habitats.filter(h => (enemies.some(e => Carrier.of(e).habitatCarried == h) == false)
            &&
                (enemies.some(e => Actor.of(e).activity.targetEntity() == h) == false));
        var targetEntity;
        if (habitatsNotAlreadyCapturedOrTargeted.length == 0) {
            targetEntity =
                Enemy.activityDefnPerform_ChooseTargetEntity_RandomPoint(uwpe);
        }
        else {
            var randomizer = uwpe.universe.randomizer;
            targetEntity = ArrayHelper.random(habitatsNotAlreadyCapturedOrTargeted, randomizer);
        }
        return targetEntity;
    }
    static activityDefnPerform_MoveTowardTarget_TargetHasBeenReached(uwpe) {
        var enemy = uwpe.entity;
        var enemyActivity = Actor.of(enemy).activity;
        var targetEntity = enemyActivity.targetEntity();
        var targetPos = Locatable.of(targetEntity).pos();
        var enemyPos = Locatable.of(enemy).pos();
        enemyPos.overwriteWith(targetPos);
        var targetIsHabitat = (targetEntity.constructor.name == Habitat.name);
        if (targetIsHabitat) {
            EnemyRaider
                .activityDefnPerform_TargetHasBeenReached_CaptureHabitatAndTargetUpgradePoint(uwpe);
        }
        else if (enemyPos.y >= 0) {
            // Choose another random point to wander to.
            enemyActivity.targetEntityClear();
        }
        else // Above the screen.
         {
            // Destroy the carried habitat and upgrade the enemy.
            var place = uwpe.place;
            var carrier = Carrier.of(enemy);
            place.entityToRemoveAdd(carrier.habitatCarried);
            place.entityToRemoveAdd(enemy);
            var enemyUpgraded = EnemyMarauder.fromPos(enemyPos);
            place.entityToSpawnAdd(enemyUpgraded);
            var universe = uwpe.universe;
            var soundOfTransformation = universe.mediaLibrary.soundGetByName("Effects_Organ");
            universe
                .soundHelper
                .soundPlaybackCreateFromSound(soundOfTransformation)
                .startIfNotStartedAlready(universe);
        }
    }
    static activityDefnPerform_TargetHasBeenReached_CaptureHabitatAndTargetUpgradePoint(uwpe) {
        var enemy = uwpe.entity;
        var enemyActor = Actor.of(enemy);
        var enemyActivity = enemyActor.activity;
        var targetEntity = enemyActivity.targetEntity();
        var targetHabitat = targetEntity;
        var carrier = Carrier.of(enemy);
        carrier.habitatCarried = targetHabitat;
        var universe = uwpe.universe;
        var soundOfCapture = universe.mediaLibrary.soundGetByName("Effects_Buzz");
        universe
            .soundHelper
            .soundPlaybackCreateFromSound(soundOfCapture)
            .startIfNotStartedAlready(universe);
        var targetConstrainable = Constrainable.of(targetEntity);
        var constraintToAddToTarget = Constraint_Multiple.fromChildren([
            Constraint_AttachToEntityWithId
                .fromTargetEntityId(enemy.id),
            Constraint_Transform.fromTransform(Transform_Translate.fromDisplacement(Coords.fromXY(0, 10)))
        ]).nameSet(EnemyRaider.ConstraintCarryHabitatName);
        targetConstrainable
            .constraintAdd(constraintToAddToTarget);
        var place = uwpe.place;
        var enemyPos = Locatable.of(enemy).pos();
        var targetEntity = Entity.fromNameAndProperty("UpgradePoint", Locatable.fromPos(enemyPos.clone().addXY(0, 0 - place.size().y)));
        enemyActivity.targetEntitySet(targetEntity);
    }
    static killableDie(uwpe) {
        Enemy.killableDie(uwpe);
        var enemy = uwpe.entity;
        var enemyCarrier = Carrier.of(enemy);
        if (enemyCarrier != null) {
            var habitatCaptured = enemyCarrier.habitatCarried;
            if (habitatCaptured != null) {
                var constrainable = Constrainable.of(habitatCaptured);
                constrainable.constraintRemoveByName(EnemyRaider.ConstraintCarryHabitatName);
                var universe = uwpe.universe;
                var soundOfRelease = universe.mediaLibrary.soundGetByName("Effects_Chirp-Reversed");
                universe
                    .soundHelper
                    .soundPlaybackCreateFromSound(soundOfRelease)
                    .startIfNotStartedAlready(universe);
            }
        }
    }
    static visualBuild() {
        var colors = Color.Instances();
        return VisualGroup.fromChildren([
            VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill(6, 4, colors.Green),
            VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill(4, 3, colors.Red),
            VisualFan.fromRadiusAnglesStartAndSpannedAndColorsFillAndBorder(4, // radius
            .5, .5, // angleStart-, angleSpannedInTurns
            colors.Red, null // colorFill, colorBorder
            ),
            VisualOffset.fromOffsetAndChild(Coords.fromXY(-1, -1), VisualCircle.fromRadiusAndColorFill(1, colors.White))
        ]);
    }
}
EnemyRaider.ConstraintCarryHabitatName = "CarryHabitat";
