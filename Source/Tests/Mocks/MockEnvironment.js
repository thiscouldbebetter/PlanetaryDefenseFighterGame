"use strict";
class MockEnvironment {
    constructor() {
        this.universe = this.universeCreate();
    }
    universeCreate() {
        var display = DisplayMock.default();
        var universe = Universe.default().displaySet(display);
        universe.world = universe.worldCreate();
        universe.world.defn = WorldGame.defnBuild();
        universe.initialize(() => { });
        universe.profile = Profile.anonymous();
        universe.world.initialize(UniverseWorldPlaceEntities.fromUniverse(universe));
        return universe;
    }
}
