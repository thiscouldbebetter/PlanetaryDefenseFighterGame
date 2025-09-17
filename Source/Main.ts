
class Program
{
	start()
	{
		var sampleTests = new SampleTests();
		var testSuite = TestSuite.fromTestFixtures( [sampleTests] );
		testSuite.run();

		var name = "GameStub";
		var contentDirectoryPath = Configuration.Instance().contentDirectoryPath;
		new Game(name, contentDirectoryPath).start();
	}
}

new Program().start();
