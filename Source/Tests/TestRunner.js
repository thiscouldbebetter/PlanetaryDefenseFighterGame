"use strict";
class TestRunner {
    run() {
        var testSuite = new TestSuite("TestsAll", [
            new CameraTests(),
            new EnemyTests(),
            new HabitatTests()
        ]);
        testSuite.run();
    }
}
