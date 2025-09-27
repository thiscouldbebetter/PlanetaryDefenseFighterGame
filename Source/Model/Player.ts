
class Player extends Entity
{
	constructor(universe: Universe)
	{
		super
		(
			Player.name,
			[
				Actor.fromActivityDefnName
				(
					UserInputListener.activityDefn().name
				),

				Audible.create(),

				Collidable.fromCollider(Sphere.fromRadius(4) ),

				Constrainable.fromConstraints
				([
					Constraint_WrapToPlaceSizeXTrimY.create(),
					Constraint_ContainInHemispace.fromHemispace
					(
						Hemispace.fromPlane
						(
							Plane.fromNormalAndDistanceFromOrigin
							(
								Coords.fromXY(0, 1), 250
							)
						)
					),
					Constraint_OrientationRound.fromHeadingsCount(2),
					Constraint_FrictionY.fromCoefficient(0.1)
				]),

				Controllable.fromToControl
				(
					uwpe => Player.toControl(uwpe)
				),

				Drawable.fromVisual
				(
					Player.visualBuild()
				),

				ItemHolder.fromItem
				(
					Item.fromDefnNameAndQuantity("Nuke", 3)
				).retainsItemsWithZeroQuantitiesSet(true),

				Killable.fromTicksOfImmunityDieAndLives
				(
					40, Player.killableDie, 2
				),

				Locatable.fromDisposition
				(
					Disposition.fromPos
					(
						Coords.fromXY(0, 125)
					)
				),

				Movable.fromAccelerationPerTickAndSpeedMax
				(
					.2,
					8
					/*
					(uwpe: UniverseWorldPlaceEntities, direction: Coords) =>
						direction.y == 0 || Math.abs(Locatable.of(uwpe.entity).loc.vel.y) < 4
					*/
				),

				Playable.create(),

				Player.projectileShooterBuild(),

				StatsKeeper.create(),

				PlacePlanet.wrappableBuildWithPosTrimmedToPlaceSizeY(true)
			]
		);

		var debugSettings = universe.debugSettings;
		var killable = Killable.of(this);
		if (debugSettings.playerCannotDie() )
		{
			killable.deathIsIgnoredSet(true);
		}

		var playerIntegrity = debugSettings.playerIntegrity();
		if (playerIntegrity != null)
		{
			killable.integrityMaxSet(playerIntegrity);
		}

		var playerLives = debugSettings.playerLives();
		if (playerLives != null)
		{
			killable.livesInReserveSet(playerLives);
		}

	}

	static create(universe: Universe): Player
	{
		return new Player(universe);
	}

	static killableDie(uwpe: UniverseWorldPlaceEntities): void
	{
		var playerEntity = uwpe.entity as Player;

		var playerLocatable = Locatable.of(playerEntity);
		var playerLoc = playerLocatable.loc;
		var playerPos = playerLoc.pos;

		var place = uwpe.place;

		var playerExplosionAndRespawner = uwpe.universe.entityBuilder.explosion
		(
			playerPos.clone(),
			10,
			"Effects_Boom",
			60, // 3 seconds.
			uwpe =>
			{
				var playerKillable = Killable.of(playerEntity);
				if (playerKillable.livesInReserve > 0)
				{
					playerKillable.livesInReserve--;
					playerLoc.clear();
					var placeSizeHalf = place.size().clone().half();
					playerPos.overwriteWith(placeSizeHalf);
					playerKillable.integritySetToMax();
					place.entityToSpawnAdd(playerEntity);
				}
			}
		);

		playerExplosionAndRespawner.propertyAdd(Playable.create())

		place.entityToSpawnAdd(playerExplosionAndRespawner);
	}

	static projectileShooterBuild(): ProjectileShooter
	{
		var generatorGun = this.projectileShooterBuild_Gun();

		var generatorNuke = this.projectileShooterBuild_Nuke();

		var generators = [ generatorGun, generatorNuke ];

		var shooter = ProjectileShooter.fromNameAndGenerators("GunAndNuke", generators);

		var propertyNames = [ EnemyProperty.name ];
		shooter.collideOnlyWithEntitiesHavingPropertiesNamedSet(propertyNames);

		return shooter;
	}

	static projectileShooterBuild_CollidableConstrainableAndDrawableWrapForEntity(entity: Entity): void
	{
		var wrappable = PlacePlanet.wrappableBuildWithPosTrimmedToPlaceSizeY(true);
		entity.propertyAdd(wrappable);
	}

	static projectileShooterBuild_Gun(): ProjectileGenerator
	{
		var generationGun = ProjectileGeneration.fromRadiusDistanceSpeedTicksDamageVisualInitAndHit
		(
			2, // radius
			5, // distanceInitial
			16, // speed
			8, // ticksToLive
			Damage.fromAmount(1),
			VisualGroup.fromChildren
			([
				VisualSound.fromSoundName("Effects_Blip"),

				VisualCircle.fromRadiusAndColorFill
				(
					2, Color.Instances().Yellow
				)
			]),
			(entity) =>
				this.projectileShooterBuild_CollidableConstrainableAndDrawableWrapForEntity(entity),
			uwpe => // hit
			{
				var place = uwpe.place as PlacePlanet;
				var player = place.player();
				var playerStatsKeeper = StatsKeeper.of(player);
				playerStatsKeeper.hitsIncrement();
				ProjectileGeneration.hit_DamageTargetAndDestroySelf(uwpe);
			}
		);

		var generatorGun = ProjectileGenerator.fromNameGenerationAndFire
		(
			"Gun",
			generationGun,
			uwpe =>
			{
				var place = uwpe.place as PlacePlanet;
				var player = place.player();
				var playerKillable = Killable.of(player);
				var playerIsInImmunityPeriod = playerKillable.immunityIsInEffect();
				if (playerIsInImmunityPeriod == false)
				{
					var playerStatsKeeper = StatsKeeper.of(player);
					playerStatsKeeper.shotsIncrement();
					ProjectileGenerator.fireGeneratorByName("Gun", uwpe);
				}
			}
		);

		return generatorGun;
	}

	static projectileShooterBuild_Nuke(): ProjectileGenerator
	{
		var nukeRadius = 200;

		var generationNuke = ProjectileGeneration.fromRadiusDistanceSpeedTicksDamageVisualInitAndHit
		(
			nukeRadius,
			0, // distanceInitial
			0, // speed
			1, // ticksToLive
			Damage.fromAmount(1),
			VisualGroup.fromChildren
			([
				VisualSound.fromSoundName("Effects_Boom"),

				VisualCircle.fromRadiusAndColorFill
				(
					nukeRadius, Color.Instances().White
				)
			]),
			(entity) =>
				this.projectileShooterBuild_CollidableConstrainableAndDrawableWrapForEntity(entity),
			uwpe => // hit
			{
				ProjectileGeneration.hit_DamageTargetAndDestroySelf(uwpe);
			}
		);

		var generatorNukeName = "Nuke";

		var generatorNuke = ProjectileGenerator.fromNameGenerationAndFire
		(
			generatorNukeName,
			generationNuke,
			uwpe =>
			{
				var place = uwpe.place as PlacePlanet;
				var player = place.player();
				var playerKillable = Killable.of(player);
				var playerIsInImmunityPeriod = playerKillable.immunityIsInEffect();
				if (playerIsInImmunityPeriod == false)
				{
					var playerItemHolder = ItemHolder.of(player);
					if (playerItemHolder.hasItemWithDefnName(generatorNukeName) )
					{
						playerItemHolder.itemSubtractDefnNameAndQuantity(generatorNukeName, 1);
						ProjectileGenerator.fireGeneratorByName(generatorNukeName, uwpe);
					}
				}
			}
		);

		return generatorNuke;
	}

	static toControl(uwpe: UniverseWorldPlaceEntities): ControlBase
	{
		var place = uwpe.place as PlacePlanet;
		var player = place.player();

		var placeSize = place.size();

		var playerStatsKeeper = StatsKeeper.of(player);

		var visualBuilder = VisualBuilder.Instance();

		var visualPlayerShip = Player.visualBuild();

		var visualHabitat = Habitat.visualBuild();

		var visualLevel: Visual =
			VisualCircle.fromRadiusAndColorFill(5, Color.Instances().Cyan);

		// var visualKills = visualBuilder.explosionStarburstOfRadius(8);
		var visualNukes = visualBuilder.hazardTrefoilRadiation(5);

		var visualStar =
			visualBuilder.starburstWithPointsRatioRadiusAndColor
			(
				5, // points
				.5, // radiusInnerAsFractionOfOuter
				6, // radiusOuter
				Color.Instances().Yellow
			);

		var controlsForStatus =
		[
			// Level.
			ControlVisual.fromPosAndVisual
			(
				Coords.fromXY(10, 10),
				DataBinding.fromGet(() => visualLevel)
			),
			ControlLabel.fromPosAndText
			(
				Coords.fromXY(20, 4),
				DataBinding.fromGet
				(
					() => "" + (place.levelIndex + 1)
				)
			),

			// Habitats remaining.
			ControlVisual.fromPosAndVisual
			(
				Coords.fromXY(40, 15),
				DataBinding.fromContext(visualHabitat)
			),
			ControlLabel.fromPosAndText
			(
				Coords.fromXY(50, 4),
				DataBinding.fromGet
				(
					() => "" + place.habitats().length
				)
			),

			// Enemies remaining.
			ControlVisual.fromPosAndVisual
			(
				Coords.fromXY(70, 10),
				DataBinding.fromContext(EnemyRaider.visualBuild())
			),
			ControlLabel.fromPosAndText
			(
				Coords.fromXY(80, 4),
				DataBinding.fromGet(() => "" + place.enemies().length)
			),

			// Lives in reserve.
			ControlVisual.fromPosAndVisual
			(
				Coords.fromXY(10, 30),
				DataBinding.fromContext(visualPlayerShip)
			),
			ControlLabel.fromPosAndText
			(
				Coords.fromXY(20, 26),
				DataBinding.fromGet
				(
					() => "" + Killable.of(uwpe.entity).livesInReserve
				)
			),

			// Nukes remaining.
			ControlVisual.fromPosAndVisual
			(
				Coords.fromXY(40, 30),
				DataBinding.fromContext(visualNukes)
			),
			ControlLabel.fromPosAndText
			(
				Coords.fromXY(50, 26),
				DataBinding.fromGet
				(
					() => "" + ItemHolder.of(uwpe.entity).itemByDefnName("Nuke").quantity
				)
			),

			// Score.
			ControlVisual.fromPosAndVisual
			(
				Coords.fromXY(70, 30),
				DataBinding.fromContext(visualStar)
			),
			ControlLabel.fromPosAndText
			(
				Coords.fromXY(80, 26),
				DataBinding.fromGet
				(
					() => "" + playerStatsKeeper.score()
				)
			)
		];

		return ControlContainer.fromPosSizeAndChildren
		(
			Coords.fromXY(0, placeSize.y - 40), // pos
			Coords.fromXY(40, 50), // size
			controlsForStatus
		).toControlContainerTransparent()
	}

	static visualBuild(): Visual
	{
		var dimension = 5;

		var visualBuilder = VisualBuilder.Instance();

		var colors = Color.Instances();

		var transformScaleBody =
			Transform_Scale.fromScaleFactor(dimension * 2);
		var transformTranslateBody =
			Transform_Translate.fromDisplacement(Coords.fromXY(0 - dimension, 0) );

		var visualBody =
			visualBuilder
				.triangleIsocelesOfColorPointingRight(colors.Gray)
				.transform(transformScaleBody)
				.transform(transformTranslateBody);

		var visualThrusterFlame =
			visualBuilder.flame(dimension * .75);

		var transformTranslateFlame =
			Transform_Translate.fromDisplacement(Coords.fromXY(0, 0 - dimension * 1.25) );

		var visualThrusterFlameOffset =
			visualThrusterFlame.transform(transformTranslateFlame);

		var transformRotate = Transform_RotateLeft.fromQuarterTurnsToRotate(1)

		var visualThrusterFlameOffsetThenRotated =
			visualThrusterFlameOffset.transform(transformRotate);

		var visualSoundWhoosh = VisualSound.fromSoundName("Effects_Whoosh");

		var visualThrusterFlamePlusSound =
			VisualGroup.fromChildren
			([
				visualSoundWhoosh,
				visualThrusterFlameOffsetThenRotated
			]);

		var visualSelectThrusterFlamePlusSoundOrSilence =
			VisualSelect.fromSelectChildToShowAndChildren
			(
				(uwpe, visualSelect) =>
					this.visualBuild_VisualSelectThrusterFlamePlusSoundOrSilence(uwpe, visualSelect),
				[
					VisualSound.silence(),
					visualThrusterFlamePlusSound
				]
			);

		var transformScaleShield =
			Transform_Scale.fromScaleFactor(dimension * 2.5);

		var transformTranslateShield =
			Transform_Translate.fromDisplacement(Coords.fromXY(0 - dimension * 1.15, 0) );

		var visualShield =
			visualBuilder
				.triangleIsocelesOfColorPointingRight(colors.Cyan)
				.transform(transformScaleShield)
				.transform(transformTranslateShield);

		var visualShieldConditional =
			VisualHidable.fromIsVisibleAndChild
			(
				uwpe =>
				{
					var killable = Killable.of(uwpe.entity);
					var shieldIsActive =
						killable == null ? false : killable.immunityIsInEffect();
					return shieldIsActive;
				},
				visualShield
			);

		var visual = VisualGroup.fromChildren
		([
			visualShieldConditional,
			visualSelectThrusterFlamePlusSoundOrSilence,
			visualBody
		]);

		return visual;
	}

	static visualBuild_VisualSelectThrusterFlamePlusSoundOrSilence
	(
		uwpe: UniverseWorldPlaceEntities,
		visualSelect: VisualSelect
	): Visual
	{
		return visualSelect.childByIndex(
			Locatable.of(uwpe.entity).locPrev.accel.x != 0
			? 1
			: 0
		);
	}

}
