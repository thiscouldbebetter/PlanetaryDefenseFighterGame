
class PlacePlanet extends PlaceBase
{
	levelIndex: number;

	constructor(levelIndex: number, player: Player)
	{
		var size = Coords.fromXY(800, 300);

		super
		(
			"Level " + (levelIndex + 1),
			PlacePlanet.defnBuild().name,
			null, // parentName
			size,
			[] // entities
		);

		this.levelIndex = levelIndex;

		var entities =
		[
			PlacePlanet.cameraEntity(Coords.fromXY(800, 300) ),
			Planet.fromSizeAndHorizonHeight
			(
				Coords.fromXY(800, 300), 50
			),
			player
		];

		var habitats = this.constructor_HabitatsBuild();
		entities.push(...habitats);

		var enemyGenerationZone = BoxAxisAligned.fromMinAndMax
		(
			Coords.fromXY(0, 0),
			Coords.fromXY(size.x, 0)
		);

		var enemyRaiderGenerator =
			this.constructor_EnemyRaiderGeneratorBuild(enemyGenerationZone);
		entities.push(enemyRaiderGenerator.toEntity() );

		var enemyHarrierGenerator =
			this.constructor_EnemyHarrierGeneratorBuild(enemyGenerationZone);
		entities.push(enemyHarrierGenerator.toEntity() );

		var enemyBursterGenerator =
			this.constructor_EnemyBursterGeneratorBuild(enemyGenerationZone);
		entities.push(enemyBursterGenerator.toEntity() );

		var enemyMinelayerGenerator =
			this.constructor_EnemyMinelayerGeneratorBuild(enemyGenerationZone);
		entities.push(enemyMinelayerGenerator.toEntity() );

		// Marauders and chasers are not generated spontaneously.

		this.entitiesToSpawnAdd(entities);
	}

	constructor_EnemyBursterGeneratorBuild
	(
		enemyGenerationZone: BoxAxisAligned
	): EntityGenerator
	{
		var enemyBurstersAndMinelayersToGenerateConcurrentlyCount =
			this.enemyBurstersAndMinelayersToGenerateConcurrentlyCount();

		var enemyBursterGenerator = EntityGenerator.fromEntityTicksBatchMaxesAndPosBox
		(
			EnemyBurster.fromPos(Coords.create() ),
			400, // ticksPerGeneration = 20 seconds.
			1, // entitiesPerGeneration
			enemyBurstersAndMinelayersToGenerateConcurrentlyCount, // concurrent
			null, // all-time
			enemyGenerationZone
		);
		return enemyBursterGenerator;
	}

	constructor_EnemyHarrierGeneratorBuild
	(
		enemyGenerationZone: BoxAxisAligned
	): EntityGenerator
	{
		var enemyHarrierGenerator = EntityGenerator.fromEntityTicksBatchMaxesAndPosBox
		(
			EnemyRaider.fromPos(Coords.create() ),
			400, // ticksPerGeneration = 20 seconds.
			1, // entitiesPerGeneration
			1, // concurrent
			null, // all-time
			enemyGenerationZone
		);
		return enemyHarrierGenerator;
	}

	constructor_EnemyMinelayerGeneratorBuild
	(
		enemyGenerationZone: BoxAxisAligned
	): EntityGenerator
	{
		var enemyBurstersAndMinelayersToGenerateConcurrentlyCount =
			this.enemyBurstersAndMinelayersToGenerateConcurrentlyCount();

		var enemyMinelayerGenerator = EntityGenerator.fromEntityTicksBatchMaxesAndPosBox
		(
			EnemyMinelayer.fromPos(Coords.create() ),
			400, // ticksPerGeneration = 20 seconds.
			1, // entitiesPerGeneration
			enemyBurstersAndMinelayersToGenerateConcurrentlyCount, // concurrent
			null, // all-time
			enemyGenerationZone
		);
		return enemyMinelayerGenerator;
	}

	constructor_EnemyRaiderGeneratorBuild
	(
		enemyGenerationZone: BoxAxisAligned
	): EntityGenerator
	{
		var enemyRaidersCount = this.enemyRaidersCountInitial();
		var enemyRaiderGenerator = EntityGenerator.fromEntityTicksBatchMaxesAndPosBox
		(
			EnemyRaider.fromPos(Coords.create() ),
			100, // ticksPerGeneration = 5 seconds.
			1, // entitiesPerGeneration
			enemyRaidersCount, // concurrent
			enemyRaidersCount, // all-time
			enemyGenerationZone
		);
		return enemyRaiderGenerator;
	}

	constructor_HabitatsBuild(): Habitat[]
	{
		var habitats: Habitat[] = [];
		var habitatsCount = this.habitatsCountInitial();
		var habitatSpacing = this.size().x / habitatsCount;
		for (var i = 0; i < habitatsCount; i++)
		{
			var habitat =
				Habitat.fromPos(Coords.fromXY(i * habitatSpacing, 250) );
			habitats.push(habitat);
		}
		return habitats;
	}

	static fromLevelIndexAndPlayer(levelIndex: number, player: Player): PlacePlanet
	{
		return new PlacePlanet(levelIndex, player);
	}

	static cameraEntity(placeSize: Coords): Entity
	{
		var camera = Camera.fromViewSizeAndDisposition
		(
			Coords.fromXY(400, 300), // viewSize
			Disposition.fromPosAndOrientation
			(
				Coords.zeroes(),
				Orientation.fromForwardAndDown
				(
					Coords.fromXYZ(0, 0, 1), // forward
					Coords.fromXYZ(0, 1, 0) // down
				)
			)
		);

		var cameraEntity =
			camera.toEntityFollowingEntityWithName(Player.name);

		var constraintContainInBox =
			camera.constraintContainInBoxForPlaceSizeWrapped
			(
				placeSize
			);

		var constrainable = Constrainable.of(cameraEntity);
		constrainable.constraintAdd(constraintContainInBox);

		var collidable = Collidable.of(cameraEntity);

		var colliderCenter = collidable.collider;

		var colliderLeft = ShapeTransformed.fromTransformAndChild
		(
			Transform_Translate.fromDisplacement
			(
				Coords.fromXY(0 - placeSize.x, 0)
			),
			colliderCenter.clone()
		)

		var colliderRight = ShapeTransformed.fromTransformAndChild
		(
			Transform_Translate.fromDisplacement
			(
				Coords.fromXY(placeSize.x, 0)
			),
			colliderCenter.clone()
		)

		var colliderAfterWrapping = ShapeGroupAny.fromChildren
		([
			colliderLeft,
			colliderCenter,
			colliderRight
		]);

		collidable.colliderAtRestSet(colliderAfterWrapping);

		return cameraEntity;
	}

	static defnBuild(): PlaceDefn
	{
		var actionDisplayRecorderStartStop =
			DisplayRecorder.actionStartStop();
		var actionShowMenu =
			Action.Instances().ShowMenuSettings;

		var actions =
		[
			actionDisplayRecorderStartStop,
			actionShowMenu,

			Movable.actionAccelerateAndFaceLeft(),
			Movable.actionAccelerateAndFaceRight(),

			Movable.actionAccelerateWithoutFacingUp(),
			Movable.actionAccelerateWithoutFacingDown(),

			ProjectileGenerator.actionFire()
		];

		var inputs = Input.Instances();

		var actionToInputsMappings =
		[
			ActionToInputsMapping.fromActionNameAndInputName
			(
				actionDisplayRecorderStartStop.name,
				inputs.Tilde.name
			),

			ActionToInputsMapping.fromActionNameAndInputName
			(
				actionShowMenu.name, inputs.Escape.name
			),

			ActionToInputsMapping.fromActionNameAndInputName
			(
				Movable.actionAccelerateAndFaceLeft().name,
				inputs.ArrowLeft.name
			),
			ActionToInputsMapping.fromActionNameAndInputName
			(
				Movable.actionAccelerateAndFaceRight().name,
				inputs.ArrowRight.name
			),

			ActionToInputsMapping.fromActionNameAndInputName
			(
				Movable.actionAccelerateWithoutFacingDown().name,
				inputs.ArrowDown.name
			),
			ActionToInputsMapping.fromActionNameAndInputName
			(
				Movable.actionAccelerateWithoutFacingUp().name,
				inputs.ArrowUp.name
			),

			ActionToInputsMapping.fromActionNameAndInputName
			(
				ProjectileGenerator.actionFire().name,
				inputs.Space.name
			).inactivateInputWhenActionPerformedSet(true)
		];

		var entityPropertyNamesToProcess: string[] =
		[
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

		return PlaceDefn.fromNameMusicActionsMappingsAndPropertyNames
		(
			PlacePlanet.name,
			"Music__Default", // soundForMusicName
			actions,
			actionToInputsMappings,
			entityPropertyNamesToProcess
		);
	}

	enemyRaidersCountInitial(): number
	{
		var habitatsCount = this.habitatsCountInitial();
		var enemyRaidersCountForLevel0 = habitatsCount * 2;
		var enemyRaidersAdditionalPerLevel = 3;
		var enemyRaidersCount =
			enemyRaidersCountForLevel0
			+ enemyRaidersAdditionalPerLevel * this.levelIndex;
		return enemyRaidersCount;
	}

	enemyBurstersAndMinelayersToGenerateConcurrentlyCount(): number
	{
		var enemiesCountForLevel0 = 0;
		var enemiesAdditionalPerLevel = 1;
		var enemiesCount =
			enemiesCountForLevel0
			+ enemiesAdditionalPerLevel * this.levelIndex;
		return enemiesCount;
	}

	sizeMinusSurface(): Coords
	{
		var planet = this.planet();

		var sizeMinusSurface =
			this.size()
				.clone()
				.addXY
				(
					0, 0 - planet.horizonHeight
				);
	
		return sizeMinusSurface;
	}

	// Entities.

	enemies(): Enemy[]
	{
		return this.entitiesByPropertyName(EnemyProperty.name) as Enemy[];
	}

	enemyGenerator(): EntityGenerator
	{
		var entity = this._entities.find
		(
			x => x.propertyByName(EntityGenerator.name) != null
		);
		var entityGenerator = EntityGenerator.of(entity);
		return entityGenerator;
	}

	habitats(): Habitat[]
	{
		return this.entitiesByPropertyName(HabitatProperty.name) as Habitat[];
	}

	habitatsCountInitial(): number
	{
		return 4;
	}

	planet(): Planet
	{
		return this.entityByName(Planet.name) as Planet;
	}

	player(): Player
	{
		return this.entitiesByPropertyName(Playable.name)[0] as Player;
	}

	statsKeeper(): Entity
	{
		return this.entitiesByPropertyName(StatsKeeper.name)[0];
	}
}
