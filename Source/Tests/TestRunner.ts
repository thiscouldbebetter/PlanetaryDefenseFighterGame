
class TestRunner
{
	run(): void
	{
		var testSuite = new TestSuite
		(
			"TestsAll",
			[
				new CameraTests(),
				new EnemyTests(),
				new HabitatTests()
			]
		);

		testSuite.runThen( () => {} );
	}
}