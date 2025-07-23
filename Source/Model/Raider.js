"use strict";
class Raider extends Entity {
    constructor(pos) {
        super(Raider.name, [
            Actor.fromActivityDefnName(Raider.activityDefnBuild().name),
            Collidable.fromColliderPropertyNameToCollideWithAndCollide(Sphere.fromRadius(4), Player.name, (uwpe, c) => {
                var entityOther = uwpe.entity2;
                if (entityOther.name == Player.name) {
                    var playerEntity = entityOther;
                    var playerKillable = Killable.of(playerEntity);
                    playerKillable.kill();
                }
            }),
            Constrainable.fromConstraint(Constraint_WrapToPlaceSizeX.create()),
            Drawable.fromVisual(Raider.visualBuild()).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1)),
            Killable.fromDie(Raider.killableDie),
            Locatable.fromPos(pos),
            Movable.fromAccelerationAndSpeedMax(2, 1),
            RaiderProperty.create()
        ]);
    }
    static fromPos(pos) {
        return new Raider(pos);
    }
    static activityDefnBuild() {
        return new ActivityDefn(Raider.name, Raider.activityDefnPerform);
    }
    static activityDefnPerform(uwpe) {
        var universe = uwpe.universe;
        var place = uwpe.place;
        var entity = uwpe.entity;
        var raider = entity;
        var raiderPos = Locatable.of(raider).loc.pos;
        var raiderActor = Actor.of(raider);
        var raiderActivity = raiderActor.activity;
        var targetEntity = raiderActivity.targetEntity();
        if (targetEntity == null) {
            var placeDefault = place;
            var habitats = placeDefault.habitats();
            if (habitats.length == 0) {
                return; // todo
            }
            else {
                targetEntity = ArrayHelper.random(habitats, universe.randomizer);
                raiderActivity.targetEntitySet(targetEntity);
            }
        }
        var targetPos = Locatable.of(targetEntity).loc.pos;
        var displacementToTarget = Raider.displacement()
            .overwriteWith(targetPos)
            .subtract(raiderPos);
        var distanceToTarget = displacementToTarget.magnitude();
        var raiderMovable = Movable.of(raider);
        var raiderAccelerationPerTick = raiderMovable.accelerationPerTick(uwpe);
        if (distanceToTarget >= raiderAccelerationPerTick) {
            var raiderSpeedMax = raiderMovable.speedMax(uwpe);
            var displacementToMove = displacementToTarget
                .divideScalar(distanceToTarget)
                .multiplyScalar(raiderSpeedMax);
            raiderPos.add(displacementToMove);
        }
        else {
            raiderPos.overwriteWith(targetPos);
            var raiderProperty = RaiderProperty.of(raider);
            if (raiderProperty.habitatCaptured == null) {
                raiderProperty.habitatCaptured = targetEntity;
                var targetConstrainable = Constrainable.of(targetEntity);
                var constraintToAddToTarget = Constraint_Multiple.fromChildren([
                    Constraint_AttachToEntityWithId
                        .fromTargetEntityId(raider.id),
                    Constraint_Transform.fromTransform(Transform_Translate.fromDisplacement(Coords.fromXY(0, 10)))
                ]);
                targetConstrainable
                    .constraintAdd(constraintToAddToTarget);
                targetEntity = Entity.fromNameAndProperties("EscapePoint", [
                    Locatable.fromPos(raiderPos.clone().addXY(0, 0 - place.size().y))
                ]);
                raiderActivity.targetEntitySet(targetEntity);
            }
            else {
                place.entityToRemoveAdd(raiderProperty.habitatCaptured);
                place.entityToRemoveAdd(raider);
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
        var raider = uwpe.entity;
        var raiderProperty = RaiderProperty.of(raider);
        var habitatCaptured = raiderProperty.habitatCaptured;
        if (habitatCaptured != null) {
            var constrainable = Constrainable.of(habitatCaptured);
            constrainable.constraintRemoveFinal();
        }
    }
    static visualBuild() {
        return VisualGroup.fromChildren([
            VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill(6, 4, Color.Instances().Green),
            VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill(4, 3, Color.Instances().Red),
            VisualFan.fromRadiusAnglesStartAndSpannedAndColorsFillAndBorder(4, // radius
            .5, .5, // angleStart-, angleSpannedInTurns
            Color.Instances().Red, null // colorFill, colorBorder
            )
        ]);
    }
}
class RaiderProperty {
    static create() {
        return new RaiderProperty();
    }
    static of(entity) {
        return entity.propertyByName(RaiderProperty.name);
    }
    // EntityProperty.
    clone() {
        return new RaiderProperty();
    }
    equals(other) {
        return (this.habitatCaptured == other.habitatCaptured);
    }
    finalize(uwpe) {
        // Do nothing.
    }
    initialize(uwpe) {
        // Do nothing.
    }
    overwriteWith(other) {
        this.habitatCaptured = other.habitatCaptured;
        return this;
    }
    propertyName() {
        return RaiderProperty.name;
    }
    updateForTimerTick(uwpe) {
        // Do nothing.
    }
}
