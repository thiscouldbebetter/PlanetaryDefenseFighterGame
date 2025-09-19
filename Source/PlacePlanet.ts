
class PlacePlanet extends PlaceBase
{
	levelIndex: number;

	enemyGenerationZone: BoxAxisAligned;

	constructor(universe: Universe, levelIndex: number, player: Player)
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

		var habitats = PlacePlanet.habitatsBuild(size);
		entities.push(...habitats);

		this.enemyGenerationZone = BoxAxisAligned.fromMinAndMax
		(
			Coords.fromXY(0, 0),
			Coords.fromXY(size.x, 0)
		);

		var enemyHarrierGenerator =
			EnemyHarrier.generatorBuildForBox(this.enemyGenerationZone);
		entities.push(enemyHarrierGenerator.toEntity() );

		var enemyBursterGenerator =
			EnemyBurster.generatorBuildForBoxAndLevelIndex(this.enemyGenerationZone, levelIndex);
		entities.push(enemyBursterGenerator.toEntity() );

		var enemyMinelayerGenerator =
			EnemyMinelayer.generatorBuildForBoxAndLevelIndex(this.enemyGenerationZone, levelIndex);
		entities.push(enemyMinelayerGenerator.toEntity() );

		var enemyRaiderGenerator =
			EnemyRaider.generatorBuild(universe, this.enemyGenerationZone, this.levelIndex).toEntity();
		this.entityToSpawnAdd(enemyRaiderGenerator);

		// Marauders and chasers are not generated spontaneously.

		this.entitiesToSpawnAdd(entities);
	}

	static fromUniverseLevelIndexAndPlayer
	(
		universe: Universe, levelIndex: number, player: Player
	): PlacePlanet
	{
		return new PlacePlanet(universe, levelIndex, player);
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

		this.colliderWrapForCollidableAndPlaceSize(collidable, placeSize);

		return cameraEntity;
	}

	static cameraEntity_EntitiesInViewSort(entitiesToSort: Entity[]) : Entity[]
	{
		return Camera.entitiesSortByRenderingOrderThenZThenY(entitiesToSort);
	}

	static colliderWrapForCollidableAndPlaceSize(collidable: Collidable, placeSize: Coords): Collidable
	{
		var colliderCenter = collidable.collider;

		var colliderLeft = ShapeTransformed.fromTransformAndChild
		(
			Transform_Translate.fromDisplacement
			(
				Coords.fromXY(0 - placeSize.x, 0)
			),
			colliderCenter.clone()
		);

		var colliderRight = ShapeTransformed.fromTransformAndChild
		(
			Transform_Translate.fromDisplacement
			(
				Coords.fromXY(placeSize.x, 0)
			),
			colliderCenter.clone()
		);

		var colliderAfterWrapping = ShapeGroupAny.fromChildren
		([
			colliderLeft,
			colliderCenter,
			colliderRight
		]);

		collidable.colliderAtRestSet(colliderAfterWrapping);

		return collidable;
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
			enemyRaidersCount = 0;
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
