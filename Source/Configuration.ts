
class Configuration
{
	contentDirectoryPath: string;
	displaySizesAvailable: Coords[];

	constructor()
	{
		this.contentDirectoryPath = "../Content/";
		this.displaySizesAvailable = null; // [ Coords.fromXY(640, 480) ];
	}

	static _instance: Configuration;

	static Instance(): Configuration
	{
		if (this._instance == null)
		{
			this._instance = new Configuration();
		}
		return this._instance;
	}
}