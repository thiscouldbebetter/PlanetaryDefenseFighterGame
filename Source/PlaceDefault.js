"use strict";
class PlaceDefault extends PlaceBase {
    constructor() {
        var size = Coords.fromXY(800, 300);
        var entities = [
            PlaceDefault.cameraEntity(Coords.fromXY(800, 300)),
            Planet.fromSizeAndHorizonHeight(Coords.fromXY(800, 300), 50),
            Player.fromPos(Coords.fromXY(100, 100))
        ];
        var habitats = [];
        var habitatsCount = 4;
        var habitatSpacing = size.x / habitatsCount;
        for (var i = 0; i < habitatsCount; i++) {
            var habitat = Habitat.fromPos(Coords.fromXY(i * habitatSpacing, 250));
            habitats.push(habitat);
        }
        entities.push(...habitats);
        var enemiesCount = habitatsCount * 2;
        var enemyGenerationZone = BoxAxisAligned.fromMinAndMax(Coords.fromXY(0, 0), Coords.fromXY(size.x, 0));
        var enemyGenerator = EntityGenerator.fromEntityTicksBatchMaxesAndPosBox(Enemy.fromPos(Coords.create()), 100, // ticksPerGeneration
        1, // entitiesPerGeneration
        enemiesCount, // concurrent
        enemiesCount, // all-time
        enemyGenerationZone);
        entities.push(enemyGenerator.toEntity());
        super(PlaceDefault.name, PlaceDefault.defnBuild().name, null, // parentName
        size, entities);
    }
    static cameraEntity(placeSize) {
        var camera = Camera.fromViewSizeAndDisposition(Coords.fromXY(400, 300), // viewSize
        Disposition.fromPosAndOrientation(Coords.zeroes(), Orientation.fromForwardAndDown(Coords.fromXYZ(0, 0, 1), // forward
        Coords.fromXYZ(0, 1, 0) // down
        )));
        var cameraEntity = camera.toEntityFollowingEntityWithName(Player.name);
        var constraintContainInBox = camera.constraintContainInBoxForPlaceSizeWrapped(placeSize);
        var constrainable = Constrainable.of(cameraEntity);
        constrainable.constraintAdd(constraintContainInBox);
        var collidable = Collidable.of(cameraEntity);
        var colliderCenter = collidable.collider;
        var colliderLeft = ShapeTransformed.fromTransformAndChild(Transform_Translate.fromDisplacement(Coords.fromXY(0 - placeSize.x, 0)), colliderCenter.clone());
        var colliderRight = ShapeTransformed.fromTransformAndChild(Transform_Translate.fromDisplacement(Coords.fromXY(placeSize.x, 0)), colliderCenter.clone());
        var colliderAfterWrapping = ShapeGroupAny.fromChildren([
            colliderLeft,
            colliderCenter,
            colliderRight
        ]);
        collidable.colliderAtRestSet(colliderAfterWrapping);
        return cameraEntity;
    }
    static defnBuild() {
        var actionDisplayRecorderStartStop = DisplayRecorder.actionStartStop();
        var actionShowMenu = Action.Instances().ShowMenuSettings;
        var actions = [
            actionDisplayRecorderStartStop,
            actionShowMenu,
            Movable.actionAccelerateAndFaceLeft(),
            Movable.actionAccelerateAndFaceRight(),
            Movable.actionAccelerateWithoutFacingUp(),
            Movable.actionAccelerateWithoutFacingDown(),
            ProjectileGenerator.actionFire()
        ];
        var inputs = Input.Instances();
        var actionToInputsMappings = [
            ActionToInputsMapping.fromActionNameAndInputName(actionDisplayRecorderStartStop.name, inputs.Tilde.name),
            ActionToInputsMapping.fromActionNameAndInputName(actionShowMenu.name, inputs.Escape.name),
            ActionToInputsMapping.fromActionNameAndInputName(Movable.actionAccelerateAndFaceLeft().name, inputs.ArrowLeft.name),
            ActionToInputsMapping.fromActionNameAndInputName(Movable.actionAccelerateAndFaceRight().name, inputs.ArrowRight.name),
            ActionToInputsMapping.fromActionNameAndInputName(Movable.actionAccelerateWithoutFacingDown().name, inputs.ArrowDown.name),
            ActionToInputsMapping.fromActionNameAndInputName(Movable.actionAccelerateWithoutFacingUp().name, inputs.ArrowUp.name),
            ActionToInputsMapping.fromActionNameAndInputName(ProjectileGenerator.actionFire().name, inputs.Space.name).inactivateInputWhenActionPerformedSet(true)
        ];
        var entityPropertyNamesToProcess = [
            Actor.name,
            Collidable.name,
            Constrainable.name,
            EntityGenerator.name,
            Ephemeral.name,
            Killable.name,
            Locatable.name,
            Movable.name,
            Triggerable.name
        ];
        return PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames(PlaceDefault.name, "Music__Default", // soundForMusicName
        actions, actionToInputsMappings, entityPropertyNamesToProcess);
    }
    // Entities.
    enemies() {
        return this.entitiesByPropertyName(EnemyProperty.name);
    }
    enemyGenerator() {
        var entity = this._entities.find(x => x.propertyByName(EntityGenerator.name) != null);
        var entityGenerator = EntityGenerator.of(entity);
        return entityGenerator;
    }
    habitats() {
        return this.entitiesByPropertyName(Habitat.name);
    }
    player() {
        return this.entitiesByPropertyName(Playable.name)[0];
    }
    statsKeeper() {
        return this.entitiesByPropertyName(StatsKeeper.name)[0];
    }
}
