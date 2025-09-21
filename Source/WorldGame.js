"use strict";
class WorldGame extends World {
    constructor(universe, name) {
        var name = name;
        var timeCreated = DateTime.now();
        var defn = WorldGame.defnBuild();
        var player = Player.create(universe);
        var placeToStartAtName = universe.debugSettings.placeToStartAtName();
        var levelNumberInitial = parseInt(placeToStartAtName);
        levelNumberInitial = isNaN(levelNumberInitial) ? 1 : levelNumberInitial;
        var levelIndexInitial = levelNumberInitial - 1;
        var place = placeToStartAtName != null && placeToStartAtName.startsWith(Enemy.name)
            ? PlacePlanet.fromUniversePlayerAndEnemyTypeName(universe, player, placeToStartAtName)
            : PlacePlanet.fromUniverseLevelIndexAndPlayer(universe, levelIndexInitial, player);
        var places = [place];
        var placesByName = new Map(places.map(x => [x.name, x]));
        var placeGetByName = (placeName) => placesByName.get(placeName);
        var placeInitialName = places[0].name;
        super(name, timeCreated, defn, placeGetByName, placeInitialName);
        this.player = player;
        if (placeToStartAtName == "Leaderboard") {
            var stats = StatsKeeper.of(player);
            stats.scoreAdd(1000);
            var killable = Killable.of(player);
            killable.livesInReserveSet(0);
            killable.kill();
        }
    }
    static defnBuild() {
        return new WorldDefn([
            [
                UserInputListener.activityDefn(),
                EnemyBurster.activityDefnBuild(),
                EnemyChaser.activityDefnBuild(),
                EnemyEmplacement.activityDefnBuild(),
                EnemyHarrier.activityDefnBuild(),
                EnemyMinelayer.activityDefnBuild(),
                EnemyMarauder.activityDefnBuild(),
                EnemyObstructor.activityDefnBuild(),
                EnemyRaider.activityDefnBuild(),
            ],
            [
                PlacePlanet.defnBuild()
            ]
        ]);
    }
}
