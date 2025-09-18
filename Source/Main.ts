
class Program
{
	start()
	{
		var testRunner = new TestRunner();
		testRunner.run();

		var name = "GameStub";
		var contentDirectoryPath = Configuration.Instance().contentDirectoryPath;
		new Game(name, contentDirectoryPath).start();
	}
}

new Program().start();
