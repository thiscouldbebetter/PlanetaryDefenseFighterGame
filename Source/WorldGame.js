"use strict";
class WorldGame extends World {
    constructor(universe, name) {
        var name = name;
        var timeCreated = DateTime.now();
        var defn = WorldGame.defnBuild();
        var player = Player.create(universe);
        var levelNumberInitial = parseInt(universe.debugSettings.placeToStartAtName());
        levelNumberInitial = isNaN(levelNumberInitial) ? 1 : levelNumberInitial;
        var levelIndexInitial = levelNumberInitial - 1;
        var place = PlacePlanet.fromLevelIndexAndPlayer(levelIndexInitial, player);
        var places = [place];
        var placesByName = new Map(places.map(x => [x.name, x]));
        var placeGetByName = (placeName) => placesByName.get(placeName);
        var placeInitialName = places[0].name;
        super(name, timeCreated, defn, placeGetByName, placeInitialName);
        this.player = player;
    }
    static defnBuild() {
        return new WorldDefn([
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
