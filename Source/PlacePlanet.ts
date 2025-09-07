
class PlacePlanet extends PlaceBase
{
	levelIndex: number;

	enemyGenerationZone: BoxAxisAligned;

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

		this.enemyGenerationZone = BoxAxisAligned.fromMinAndMax
		(
			Coords.fromXY(0, 0),
			Coords.fromXY(size.x, 0)
		);

		var enemyHarrierGenerator =
			this.constructor_EnemyHarrierGeneratorBuild(this.enemyGenerationZone);
		entities.push(enemyHarrierGenerator.toEntity() );

		var enemyBursterGenerator =
			this.constructor_EnemyBursterGeneratorBuild(this.enemyGenerationZone);
		entities.push(enemyBursterGenerator.toEntity() );

		var enemyMinelayerGenerator =
			this.constructor_EnemyMinelayerGeneratorBuild(this.enemyGenerationZone);
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

		var enemyBursterGenerator = EntityGenerator.fromNameEntityTicksBatchMaxesAndPosBox
		(
			EntityGenerator.name + EnemyBurster.name,
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
		var enemyHarrierGenerator = EntityGenerator.fromNameEntityTicksBatchMaxesAndPosBox
		(
			EntityGenerator.name + EnemyHarrier.name,
			EnemyHarrier.fromPos(Coords.create() ),
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

		var enemyMinelayerGenerator = EntityGenerator.fromNameEntityTicksBatchMaxesAndPosBox
		(
			EntityGenerator.name + EnemyMinelayer.name,
			EnemyMinelayer.fromPos(Coords.create() ),
			400, // ticksPerGeneration = 20 seconds.
			1, // entitiesPerGeneration
			enemyBurstersAndMinelayersToGenerateConcurrentlyCount, // concurrent
			null, // all-time
			enemyGenerationZone
		);
		return enemyMinelayerGenerator;
	}

	static fromLevelIndexAndPlayer(levelIndex: number, player: Player): PlacePlanet
	{
		return new PlacePlanet(levelIndex, player);
	}

	static cameraEntity(placeSize: Coords): Entity
	{
		var cameraViewSize = Coords.fromXY(400, 300);
		var cameraDisp = Disposition.fromOrientation
		(
			Orientation.forwardZDownY()
		);

		var camera = Camera.fromViewSizeDispositionAndEntitiesInViewSort
		(
			cameraViewSize,
			cameraDisp,
			this.cameraEntity_EntitiesInViewSort
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

	static cameraEntity_EntitiesInViewSort(entitiesToSort: Entity[]) : Entity[]
	{
		return Camera.entitiesSortByRenderingOrderThenZThenY(entitiesToSort);
	}

	static defnBuild(): PlaceDefn
	{
		var actionDisplayRecorderStartStop =
			DisplayRecorder.actionStartStop();
		var actionShowMenu =
			Action.Instances().ShowMenuSettings;

		var actionNuke = Action.fromNameAndPerform
		(
			"Nuke",
			(uwpe) => { console.log("todo - Nuke") }
		);

		var actions =
		[
			actionDisplayRecorderStartStop,
			actionShowMenu,

			Movable.actionAccelerateAndFaceLeft(),
			Movable.actionAccelerateAndFaceRight(),

			Movable.actionAccelerateWithoutFacingUp(),
			Movable.actionAccelerateWithoutFacingDown(),

			ProjectileGenerator.actionFire(),
			actionNuke
		];

		var inputs = Input.Instances();

		var atim =
			(actionName: string, inputs: Input[]) =>
				ActionToInputsMapping.fromActionNameAndInputNames(actionName, inputs.map(x => x.name) );

		var actionToInputsMappings =
		[
			atim
			(
				actionDisplayRecorderStartStop.name,
				[ inputs.Tilde ]
			),

			atim
			(
				actionShowMenu.name, [ inputs.Escape ]
			),

			atim
			(
				Movable.actionAccelerateAndFaceLeft().name,
				[ inputs.ArrowLeft, inputs.a ]
			),
			atim
			(
				Movable.actionAccelerateAndFaceRight().name,
				[ inputs.ArrowRight, inputs.d ]
			),

			atim
			(
				Movable.actionAccelerateWithoutFacingDown().name,
				[ inputs.ArrowDown, inputs.s ]
			),
			atim
			(
				Movable.actionAccelerateWithoutFacingUp().name,
				[ inputs.ArrowUp, inputs.w ]
			),

			atim
			(
				ProjectileGenerator.actionFire().name,
				[ inputs.Space ]
			).inactivateInputWhenActionPerformedSet(true),

			atim
			(
				"Nuke",
				[ inputs.n ]
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

	enemyRaidersCountInitial(universe: Universe): number
	{
		var habitatsCount = this.habitatsCountInitial(universe);
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

	finalize(uwpe: UniverseWorldPlaceEntities): void
	{
		this.initializeIsComplete = false;
		super.finalize(uwpe);
	}

	initializeIsComplete: boolean = false;

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		if (this.initializeIsComplete == false)
		{
			var habitats = this.initialize_HabitatsBuild(uwpe);
			this.entitiesToSpawnAdd(habitats);

			var enemyRaiderGenerator =
				this.initialize_EnemyRaiderGeneratorBuild(uwpe).toEntity();
			this.entityToSpawnAdd(enemyRaiderGenerator);

			super.initialize(uwpe);

			this.initializeIsComplete = true;
		}
	}

	initialize_EnemyRaiderGeneratorBuild(uwpe: UniverseWorldPlaceEntities): EntityGenerator
	{
		var enemyRaidersCount = this.enemyRaidersCountInitial(uwpe.universe);
		var enemyRaiderGenerator = EntityGenerator.fromNameEntityTicksBatchMaxesAndPosBox
		(
			EntityGenerator.name + EnemyRaider.name,
			EnemyRaider.fromPos(Coords.create() ),
			100, // ticksPerGeneration = 5 seconds.
			1, // entitiesPerGeneration
			enemyRaidersCount, // concurrent
			enemyRaidersCount, // all-time
			this.enemyGenerationZone
		);
		return enemyRaiderGenerator;
	}

	initialize_HabitatsBuild(uwpe: UniverseWorldPlaceEntities): Habitat[]
	{
		var habitats: Habitat[] = [];
		var habitatsCount = this.habitatsCountInitial(uwpe.universe);
		var habitatSpacing = this.size().x / habitatsCount;
		for (var i = 0; i < habitatsCount; i++)
		{
			var habitat =
				Habitat.fromPos(Coords.fromXY(i * habitatSpacing, 250) );
			habitats.push(habitat);
		}
		return habitats;
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

	enemyGeneratorRaiders(): EntityGenerator
	{
		var entityName = EntityGenerator.name + EnemyRaider.name;
		var entity = this.entityByName(entityName);
		var entityGenerator = EntityGenerator.of(entity);
		return entityGenerator;
	}

	habitats(): Habitat[]
	{
		return this.entitiesByPropertyName(HabitatProperty.name) as Habitat[];
	}

	habitatsCountInitial(universe: Universe): number
	{
		return (universe == null ? 4 : universe.debugSettings.difficultyEasy() ? 1 : 4);
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
