
class EnemyTests extends TestFixture
{
	constructor()
	{
		super(EnemyTests.name);
	}

	tests(): ( () => void )[]
	{
		var returnValues =
		[
			this.constructorTest,
			this.activityDefnPerform_ChooseTargetEntity_RandomPoint,
			this.activityDefnPerform_FireGunAtPlayerIfCharged,
			this.activityDefnPerform_MoveTowardTarget,
			this.activityDefnPerform_TargetClear,
			this.collidableBuild,
			this.constrainableBuild,
			this.killableDie,
			this.projectileShooterBuild
		];

		return returnValues;
	}

	// Helper methods.

	enemyBuild(): Enemy
	{
		return new EnemyRaider(Coords.create() );
	}

	// Tests.

	constructorTest()
	{
		var enemy = this.enemyBuild();
		Assert.isNotNull(enemy);
	}

	activityDefnPerform_ChooseTargetEntity_RandomPoint(): void
	{
		var mockEnvironment = new MockEnvironment();
		var universe = mockEnvironment.universe;
		var world = universe.world;
		var player = new Player(universe);
		var levelIndex = 0;
		var place = PlacePlanet.fromUniverseLevelIndexAndPlayer(universe, levelIndex, player);
		world.placeNextSet(place);
		universe.venueNextSet(world.toVenue() );
		universe.updateForTimerTick();
		var uwpe = new UniverseWorldPlaceEntities(universe, world, place, null, null);

		var targetEntity = Enemy.activityDefnPerform_ChooseTargetEntity_RandomPoint(uwpe);

		Assert.isNotNull(targetEntity);
	}

	activityDefnPerform_FireGunAtPlayerIfCharged(): void
	{
		var mockEnvironment = new MockEnvironment();
		var universe = mockEnvironment.universe;
		var world = universe.world;
		var enemy = this.enemyBuild();
		var player = new Player(universe);
		var levelIndex = 0;
		var place = PlacePlanet.fromUniverseLevelIndexAndPlayer(universe, levelIndex, player);
		world.placeNextSet(place);
		universe.venueNextSet(world.toVenue() );
		universe.updateForTimerTick();
		var uwpe = new UniverseWorldPlaceEntities(universe, world, place, enemy, null);

		Enemy.activityDefnPerform_FireGunAtPlayerIfCharged(uwpe);
		// todo
	}

	activityDefnPerform_MoveTowardTarget(): void
	{
		var mockEnvironment = new MockEnvironment();
		var universe = mockEnvironment.universe;
		var world = universe.world;
		var enemy = this.enemyBuild();
		var player = new Player(universe);
		Actor.of(enemy).activity.targetEntitySet(player);
		var levelIndex = 0;
		var place = PlacePlanet.fromUniverseLevelIndexAndPlayer(universe, levelIndex, player);
		world.placeNextSet(place);
		universe.venueNextSet(world.toVenue() );
		universe.updateForTimerTick();
		var uwpe = new UniverseWorldPlaceEntities(universe, world, place, enemy, null);

		var targetHasBeenReached = (uwpe: UniverseWorldPlaceEntities) =>
		{
			// todo
		};
		Enemy.activityDefnPerform_MoveTowardTarget(uwpe, targetHasBeenReached);
		// todo
	}

	activityDefnPerform_TargetClear(): void
	{
		var mockEnvironment = new MockEnvironment();
		var universe = mockEnvironment.universe;
		var world = universe.world;
		var enemy = this.enemyBuild();
		var player = new Player(universe);
		var levelIndex = 0;
		var place = PlacePlanet.fromUniverseLevelIndexAndPlayer(universe, levelIndex, player);
		world.placeNextSet(place);
		universe.venueNextSet(world.toVenue() );
		universe.updateForTimerTick();

		var uwpe = new UniverseWorldPlaceEntities(universe, world, place, enemy, player);
		Enemy.activityDefnPerform_TargetClear(uwpe);
		// todo
	}

	collidableBuild(): void
	{
		var collidable = Enemy.collidableBuild();
		Assert.isNotNull(collidable);
	}

	constrainableBuild(): void
	{
		var constrainable = Enemy.constrainableBuild();
		Assert.isNotNull(constrainable);
	}

	killableDie(): void
	{
		var mockEnvironment = new MockEnvironment();
		var universe = mockEnvironment.universe;
		var world = universe.world;
		var enemy = this.enemyBuild();
		var player = new Player(universe);
		var levelIndex = 0;
		var place = PlacePlanet.fromUniverseLevelIndexAndPlayer(universe, levelIndex, player);
		world.placeNextSet(place);
		universe.venueNextSet(world.toVenue() );
		universe.updateForTimerTick();

		var uwpe = new UniverseWorldPlaceEntities(universe, world, place, enemy, player);
		Enemy.killableDie(uwpe);
		// todo
	}

	projectileShooterBuild(): void
	{
		var projectileShooter = Enemy.projectileShooterBuild();
		Assert.isNotNull(projectileShooter);
	}
}