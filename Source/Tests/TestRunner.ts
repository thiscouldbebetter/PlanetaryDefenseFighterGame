
class TestRunner
{
	run(): void
	{
		var testSuite = new TestSuite
		(
			"TestsAll",

			[
				new EnemyTests()
			]
		);

		testSuite.run();
	}
}