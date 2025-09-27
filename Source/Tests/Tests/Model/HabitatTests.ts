
class HabitatTests extends TestFixture
{
	constructor()
	{
		super(HabitatTests.name);
	}

	tests(): ( () => void )[]
	{
		var returnValues =
		[
			this.whenFallingDoesNotSinkBelowPlanetSurface
		];

		return returnValues;
	}

	// Tests.

	whenFallingDoesNotSinkBelowPlanetSurface(): void
	{
		var mockEnvironment = new MockEnvironment();
		var universe = mockEnvironment.universe;
		var world = universe.world as WorldGame;
		var player = new Player(universe);
		var levelIndex = 0;
		var place = PlacePlanet.fromUniverseLevelIndexAndPlayer(universe, levelIndex, player);
		var uwpe = UniverseWorldPlaceEntities.fromUniverseWorldAndPlace(universe, world, place);
		place.initialize(uwpe);
		var habitats = place.habitats();
		Assert.isNotEmpty(habitats);
		var habitatToDrop = habitats[0];
		var habitatToDropPos = Locatable.of(habitatToDrop).loc.pos;
		var habitatPosBeforeLift = habitatToDropPos.clone();
		var placeSize = place.size();
		var heightToDropFrom = placeSize.y / 2;
		var habitatPosBeforeDrop =
			habitatToDropPos.clone().addXY(0, 0 - heightToDropFrom);
		var secondsToWait = 3;
		var ticksPerSecond = 20;
		var ticksToWait = secondsToWait * ticksPerSecond;
		for (var t = 0; t < ticksToWait; t++)
		{
			place.updateForTimerTick(uwpe);
		}
		var habitatPosAfterDrop = habitatToDropPos.clone();
		Assert.areNotEqual(habitatPosBeforeDrop, habitatPosAfterDrop);
		Assert.isTrue(habitatPosAfterDrop.y > habitatPosBeforeDrop.y);
		Assert.areEqual(habitatPosBeforeLift, habitatPosAfterDrop);
	}

}