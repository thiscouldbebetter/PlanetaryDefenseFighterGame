
class PlacePlanet extends PlaceBase
{
	levelIndex: number;

	enemyGenerationZone: BoxAxisAligned;

	constructor(universe: Universe, levelIndex: number, player: Player, enemyTypeToTestName: string)
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

		var entitiesPlacePlanetPlayer =
		[
			PlacePlanet.cameraEntity(size.clone() ),
			Planet.fromSizeAndHorizonHeight
			(
				size.clone(), 50
			),
			player
		];
		this.entitiesToSpawnAdd(entitiesPlacePlanetPlayer);

		var habitats = PlacePlanet.habitatsBuild(size);
		this.entitiesToSpawnAdd(habitats);

		var enemyGenerators =
			this.constructor_EnemyGeneratorsBuild(universe, levelIndex, size);
		this.entitiesToSpawnAdd(enemyGenerators);

		if (enemyTypeToTestName == null)
		{
			// Do nothing.
		}
		else
		{
			enemyGenerators.forEach(x => EntityGenerator.of(x).inactivate() );
			var enemyGeneratorRaiders =
				enemyGenerators.find(x => x.name == EntityGenerator.name + EnemyRaider.name);
			EntityGenerator.of(enemyGeneratorRaiders).exhaust();
			var enemies: Entity[] = [];

			if (enemyTypeToTestName == EnemyEmplacement.name)
			{
				// For testing.
				enemies =
				[
					EnemyEmplacement.fromPos(size.clone().half().addXY(0, 30) )
				];
			}
			else if (enemyTypeToTestName == EnemyObstructor.name)
			{
				enemies =
				[
					EnemyObstructor.fromPos(Coords.fromXY(0, size.y / 2) ),
					EnemyObstructor.fromPos(Coords.fromXY(0, size.y / 2).addXY(0, 30) ),
					EnemyObstructor.fromPos(size.clone().half().addXY(0, 30) )
				];
			}
			else
			{
				throw new Error("Unsupported enemyTypeToTestName: " + enemyTypeToTestName);
			}

			this.entitiesToSpawnAdd(enemies);
		}
	}

	constructor_EnemyGeneratorsBuild(universe: Universe, levelIndex: number, size: Coords): Entity[]
	{
		this.enemyGenerationZone = BoxAxisAligned.fromMinAndMax
		(
			Coords.fromXY(0, 0),
			Coords.fromXY(size.x, 0)
		);

		var enemyHarrierGenerator =
			EnemyHarrier.generatorBuildForBox(this.enemyGenerationZone);

		var enemyBursterGenerator =
			EnemyBurster.generatorBuildForBoxAndLevelIndex(this.enemyGenerationZone, levelIndex);

		var enemyMinelayerGenerator =
			EnemyMinelayer.generatorBuildForBoxAndLevelIndex(this.enemyGenerationZone, levelIndex);

		var enemyRaiderGenerator =
			EnemyRaider.generatorBuild(universe, this.enemyGenerationZone, this.levelIndex);

		var entityGenerators =
		[
			enemyHarrierGenerator,
			enemyBursterGenerator,
			enemyMinelayerGenerator,
			enemyRaiderGenerator
		];

		var entities = entityGenerators.map(x => x.toEntity() );

		// Marauders and chasers are not generated spontaneously.

		return entities;
	}

	static fromUniversePlayerAndEnemyTypeName
	(
		universe: Universe, player: Player, enemyTypeName: string
	): PlacePlanet
	{
		var place = new PlacePlanet(universe, 0, player, enemyTypeName);
		return place;
	}

	static fromUniverseLevelIndexAndPlayer
	(
		universe: Universe, levelIndex: number, player: Player
	): PlacePlanet
	{
		return new PlacePlanet(universe, levelIndex, player, null);
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

		var wrappable = PlacePlanet.wrappableBuildWithPosTrimmedToPlaceSizeY(true);
		cameraEntity.propertyAdd(wrappable);

		return cameraEntity;
	}

	static cameraEntity_EntitiesInViewSort(entitiesToSort: Entity[]) : Entity[]
	{
		return Camera.entitiesSortByRenderingOrderThenZThenY(entitiesToSort);
	}

	static constraintWrapBuild(posShouldBeTrimmedToPlaceSizeY: boolean): Constraint
	{
		var constraint =
			posShouldBeTrimmedToPlaceSizeY
			? Constraint_WrapToPlaceSizeXTrimY.create()
			: Constraint_WrapToPlaceSizeX.create();

		return constraint;
	}

	static defnBuild(): PlaceDefn
	{
		var actionDisplayRecorderStartStop =
			DisplayRecorder.actionStartStop();
		var actionShowMenu =
			Action.Instances().ShowMenuSettings;

		var actionFireGun = ProjectileGenerator.actionFire("Gun");
		var actionFireNuke = ProjectileGenerator.actionFire("Nuke");

		var actions =
		[
			actionDisplayRecorderStartStop,
			actionShowMenu,

			Movable.actionAccelerateAndFaceLeft(),
			Movable.actionAccelerateAndFaceRight(),

			Movable.actionAccelerateWithoutFacingUp(),
			Movable.actionAccelerateWithoutFacingDown(),

			actionFireGun,
			actionFireNuke
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
				actionFireGun.name,
				[ inputs.Space ]
			).inactivateInputWhenActionPerformedSet(true),

			atim
			(
				actionFireNuke.name,
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
			Triggerable.name,
			Wrappable.name
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

	static _sizeInWrappedInstances: Coords;
	static sizeInWrappedInstances(): Coords
	{
		if (this._sizeInWrappedInstances == null)
		{
			this._sizeInWrappedInstances = Coords.fromXYZ(3, 1, 1);
		}
		return this._sizeInWrappedInstances;
	}

	static wrappableBuildWithPosTrimmedToPlaceSizeY
	(
		posShouldBeTrimmedToPlaceSizeY: boolean
	): Wrappable
	{
		return Wrappable.fromSizeInWrappedInstancesAndConstraintWrap
		(
			PlacePlanet.sizeInWrappedInstances(),
			PlacePlanet.constraintWrapBuild(posShouldBeTrimmedToPlaceSizeY)
		);
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

			super.initialize(uwpe);

			this.initializeIsComplete = true;
		}
	}

	static habitatsBuild(placeSize: Coords): Habitat[]
	{
		var habitats: Habitat[] = [];
		var habitatsCount = this.habitatsCountInitial();
		var habitatSpacing = placeSize.x / habitatsCount;
		for (var i = 0; i < habitatsCount; i++)
		{
			var habitat =
				Habitat.fromPos(Coords.fromXY(i * habitatSpacing, 250) );
			habitats.push(habitat);
		}
		return habitats;
	}

	static habitatsCountInitial(): number
	{
		return 4;
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

	static enemyRaidersCountInitial(universe: Universe, levelIndex: number): number
	{
		var enemyRaidersCount: number;
		if (universe.debugSettings.difficultyEasy() )
		{
			enemyRaidersCount = 2;
		}
		else
		{
			var habitatsCount = PlacePlanet.habitatsCountInitial();
			var enemyRaidersCountForLevel0 = habitatsCount * 2;
			var enemyRaidersAdditionalPerLevel = 3;
			enemyRaidersCount =
				enemyRaidersCountForLevel0
				+ enemyRaidersAdditionalPerLevel * levelIndex;
		}
		return enemyRaidersCount;
	}

	generators(): Entity[]
	{
		return this.entitiesByPropertyName(EntityGenerator.name) as Entity[];
	}

	habitats(): Habitat[]
	{
		return this.entitiesByPropertyName(HabitatProperty.name) as Habitat[];
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
