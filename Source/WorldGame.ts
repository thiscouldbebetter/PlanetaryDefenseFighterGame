
class WorldGame extends World
{
	statsKeeper: StatsKeeper;

	constructor(name: string)
	{
		var name = name;
		var timeCreated = DateTime.now();
		var defn = WorldGame.defnBuild();
		var place = new PlaceDefault();
		var places = [ place ];
		var placesByName = new Map(places.map(x => [x.name, x]) );
		var placeGetByName =
			(placeName: string) => placesByName.get(placeName);
		var placeInitialName = places[0].name;

		super
		(
			name, timeCreated, defn, placeGetByName, placeInitialName
		);

		this.statsKeeper = StatsKeeper.create();
	}

	static defnBuild(): WorldDefn
	{
		return new WorldDefn
		([
			[
				UserInputListener.activityDefn(),
				Enemy.activityDefnBuild()
			],
			[
				PlaceDefault.defnBuild()
			]
		]);
	}
}
