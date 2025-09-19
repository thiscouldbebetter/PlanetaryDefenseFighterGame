
class WorldGame extends World
{
	player: Player;

	constructor(universe: Universe, name: string)
	{
		var name = name;
		var timeCreated = DateTime.now();
		var defn = WorldGame.defnBuild();
		var player = Player.create(universe);
		var placeToStartAtName = universe.debugSettings.placeToStartAtName();
		var levelNumberInitial = parseInt(placeToStartAtName);
		levelNumberInitial = isNaN(levelNumberInitial) ? 1 : levelNumberInitial;
		var levelIndexInitial = levelNumberInitial - 1;
		var place = PlacePlanet.fromUniverseLevelIndexAndPlayer(universe, levelIndexInitial, player);
		var places = [ place ];
		var placesByName = new Map(places.map(x => [x.name, x]) );
		var placeGetByName =
			(placeName: string) => placesByName.get(placeName);
		var placeInitialName = places[0].name;

		super
		(
			name, timeCreated, defn, placeGetByName, placeInitialName
		);

		this.player = player;

		if (placeToStartAtName == "Leaderboard")
		{
			var stats = StatsKeeper.of(player);
			stats.scoreAdd(1000);
			var killable = Killable.of(player);
			killable.livesInReserveSet(0);
			killable.kill();
		}
	}

	static defnBuild(): WorldDefn
	{
		return new WorldDefn
		([
			[
				UserInputListener.activityDefn(),
				EnemyBurster.activityDefnBuild(),
				EnemyChaser.activityDefnBuild(),
				EnemyHarrier.activityDefnBuild(),
				EnemyMinelayer.activityDefnBuild(),
				EnemyMarauder.activityDefnBuild(),
				EnemyRaider.activityDefnBuild(),
			],
			[
				PlacePlanet.defnBuild()
			]
		]);
	}
}
