
class Planet extends Entity
{
	horizonHeight: number;

	constructor(size: Coords, horizonHeight: number)
	{
		super
		(
			Planet.name,
			[
				Animatable2.create(),

				Drawable.fromVisual
				(
					Planet.visualBuild(size, horizonHeight)
				),

				Locatable.create(),

				Planet.triggerable(),

				PlacePlanet.wrappableBuildWithPosTrimmedToPlaceSizeY(true)
			]
		);

		this.horizonHeight = horizonHeight;
	}

	static fromSizeAndHorizonHeight
	(
		size: Coords, horizonHeight: number
	): Planet
	{
		return new Planet(size, horizonHeight);
	}

	// Triggerable.

	static triggerable(): Triggerable
	{
		var triggerLose =
			Trigger.fromNameIsTriggeredAndReactToBeingTriggered
			(
				"Lose",
				this.triggerLoseIsTriggered,
				this.triggerLoseReactToBeingTriggered
			);

		var triggerWin =
			Trigger.fromNameIsTriggeredAndReactToBeingTriggered
			(
				"Win",
				this.triggerWinIsTriggered,
				this.triggerWinReactToBeingTriggered
			);

		return Triggerable.fromTriggers
		([
			triggerLose,
			triggerWin
		]);
	}

	static triggerLoseIsTriggered
	(
		uwpe: UniverseWorldPlaceEntities
	): boolean
	{
		var playerHasLost = false;

		var level = uwpe.place as PlacePlanet;

		var playerShipIsGone =
			(level.player() == null);
		if (playerShipIsGone)
		{
			playerHasLost = true;
		}
		else
		{
			var habitatsAreAllGone =
				(level.habitats().length == 0);
			if (habitatsAreAllGone)
			{
				var planet = level.planet();
				var planetIsGone = (planet == null);
				if (planetIsGone)
				{
					playerHasLost = true;
				}
				else
				{
					var planetEphemeral = Ephemeral.of(planet);
					if (planetEphemeral == null)
					{
						planetEphemeral = Ephemeral.fromTicksToLive
						(
							100 // 5 seconds.
						);
						planet.propertyAdd(planetEphemeral);
						Animatable2.of(planet).animationsStopAll(); // todo
						var place = uwpe.place; 
						var placeEphemerals =
							place.entitiesByPropertyName(planetEphemeral.propertyName() );
						placeEphemerals.push(planet);
					}
					else
					{
						playerHasLost = planetEphemeral.isExpired();
					}
				}
			}
		}

		return playerHasLost;
	}

	static triggerLoseReactToBeingTriggered
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var universe = uwpe.universe;

		var leaderboard =
			Leaderboard.fromStorageHelper(universe.storageHelper);

		var venueMessageGameOver = VenueMessage.fromTextAndAcknowledgeNoButtons
		(
			"GAME OVER",
			() => // acknowledge
			{
				var world = uwpe.world as WorldGame;
				var player = world.player;
				var statsKeeper = StatsKeeper.of(player);
				var score = statsKeeper.score();
				leaderboard.scoreBeingEnteredSet(score);
				var leaderboardAsVenue = leaderboard.toVenue(uwpe);
				universe.venueTransitionTo(leaderboardAsVenue);
			}
		).secondsToShowSet(5);

		universe.venueTransitionTo(venueMessageGameOver);
	}

	static triggerWinIsTriggered
	(
		uwpe: UniverseWorldPlaceEntities
	): boolean
	{
		var level = uwpe.place as PlacePlanet;
		var enemyGeneratorRaidersIsExhausted =
			level.enemyGeneratorRaiders().exhausted();
		var enemiesAreAllGone =
			(level.enemies().length == 0);
		var habitatIsStillThere =
			(level.habitats().length > 0);
		var player = level.player();
		var playerIsNotAnExplosion =
			(StatsKeeper.of(player) != null)
		var playerHasWon =
			enemyGeneratorRaidersIsExhausted
			&& enemiesAreAllGone
			&& habitatIsStillThere
			&& playerIsNotAnExplosion;
		return playerHasWon;
	}

	static triggerWinReactToBeingTriggered
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var universe = uwpe.universe;
		var place = uwpe.place as PlacePlanet;
		var player = place.player();

		var playerStatsKeeper = StatsKeeper.of(player);
		var enemiesKilled = playerStatsKeeper.kills();

		var habitatsRemaining = place.habitats().length;
		var habitatsTotal = PlacePlanet.habitatsCountInitial();

		var shotsHit = playerStatsKeeper.hits();
		var shotsFired = playerStatsKeeper.shots();

		var timerTicksToComplete = place.timerTicksSoFar();
		var secondsToComplete =
			universe.timerHelper.ticksToSeconds(timerTicksToComplete);

		var statLengthMax = 8;
		var messageAsLines =
		[
			place.name + " complete!",
			"",
			"Enemies killed: " + ("" + enemiesKilled).padStart(statLengthMax, " "),
			"Habitats saved: " + (habitatsRemaining + "/" + habitatsTotal).padStart(statLengthMax, " "),
			"Hits/Shots:     " + (shotsHit + "/" + shotsFired).padStart(statLengthMax, " "),
			"Seconds taken:  " + ("" + secondsToComplete).padStart(statLengthMax, " "),
			"",
			"Press Enter to start the next level."
		];

		var newline = "\n";
		var messageAsString = messageAsLines.join(newline);

		var venueNext = VenueMessage.fromTextAndAcknowledgeNoButtons
		(
			messageAsString,
			() => // acknowledge
			{
				playerStatsKeeper.killsClear();
				playerStatsKeeper.shotsClear();
				playerStatsKeeper.hitsClear();
				var levelNextIndex = place.levelIndex + 1;
				var placeNext = PlacePlanet.fromUniverseLevelIndexAndPlayer
				(
					universe, levelNextIndex, player
				);
				universe.world.placeNextSet(placeNext);
				universe.venuePrevTransitionTo();
			}
		)

		universe.venueTransitionTo(venueNext);
	}

	// Visual.

	static visualBuild
	(
		placeSize: Coords, horizonHeight: number
	): Visual
	{
		var groundSize = Coords.fromXY(placeSize.x, horizonHeight);
		var groundVisual = (color: Color) => VisualRectangle.fromSizeAndColorFill(groundSize, color);
		var colors = Color.Instances();

		var groundNormal = groundVisual(colors.GreenDark);
		var groundHighlighted = groundVisual(colors.Green);
		var groundFlashing = VisualAnimation.fromTicksToHoldFramesAndFramesRepeating
		(
			10, // Half a second per frame.
			[ groundNormal, groundHighlighted ]
		);

		var groundYellow = groundVisual(colors.Yellow);
		var groundOrange = groundVisual(colors.Orange);
		var groundRed = groundVisual(colors.Red);
		var groundRedDark = groundVisual(colors.RedDark);
		var groundBlack = groundVisual(colors.Black);

		var groundDying = VisualAnimation.fromTicksToHoldFramesAndFramesNonRepeating
		(
			10, // 1/2 second per frame.
			[ groundNormal, groundHighlighted, groundYellow, groundOrange, groundRed, groundRedDark, groundBlack ]
		);

		var groundsNormalFlashingAndDying = [ groundNormal, groundFlashing, groundDying ];

		var groundSelectNormalOrFlashing = VisualSelect.fromSelectChildToShowAndChildren
		(
			(uwpe: UniverseWorldPlaceEntities, visualSelect: VisualSelect) =>
			{
				var place = uwpe.place as PlacePlanet;
				var habitats = place.habitats();
				var habitatsCount = habitats.length;
				var childIndex =
					(habitatsCount > 1)
					? 0
					: (habitatsCount == 1)
					? 1
					: 2;
				var childToShow = visualSelect.children[childIndex];
				return childToShow;
			},
			groundsNormalFlashingAndDying
		);

		var groundOffset = VisualOffset.fromOffsetAndChild
		(
			Coords.fromXY
			(
				placeSize.x / 2,
				placeSize.y - horizonHeight / 2
			),
			groundSelectNormalOrFlashing
		);

		var mountainSegmentCount = 8;
		var mountainSegmentWidth = placeSize.x / mountainSegmentCount;
		var mountainHeightAboveHorizonMax = horizonHeight;
		var mountainPathPoints = new Array<Coords>();

		for (var x = 0; x < mountainSegmentCount; x++)
		{
			var mountainHeightAboveHorizon =
				Math.random() * mountainHeightAboveHorizonMax;
			var mountainPathPoint = Coords.fromXY
			(
				x * mountainSegmentWidth,
				0 - mountainHeightAboveHorizon
			);
			mountainPathPoints.push(mountainPathPoint);
		}

		mountainPathPoints.push
		(
			Coords.fromXY
			(
				placeSize.x,
				mountainPathPoints[0].y
			)
		);

		var mountainsAsPath =
			Path.fromPoints(mountainPathPoints);

		var mountains = VisualPath.fromPathColorAndThicknessOpen
		(
			mountainsAsPath,
			colors.Brown,
			1 // thickness
		);

		var mountainsOffset = VisualOffset.fromOffsetAndChild
		(
			Coords.fromXY(0, placeSize.y - horizonHeight),
			mountains
		);

		var visual: Visual = VisualGroup.fromChildren
		([
			groundOffset,
			mountainsOffset
		]);

		return visual;
	}
}