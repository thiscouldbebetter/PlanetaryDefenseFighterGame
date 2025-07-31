
class Game
{
	name: string;
	contentDirectoryPath: string;

	constructor(name: string, contentDirectoryPath: string)
	{
		this.name = name;
		this.contentDirectoryPath = contentDirectoryPath;
	}

	start(): void
	{
		var mediaFilePaths = this.mediaFilePathsBuild();

		var mediaLibrary =
			MediaLibrary.fromContentDirectoryPathAndMediaFilePaths
			(
				this.contentDirectoryPath, mediaFilePaths
			);

		var worldCreator = WorldCreator.fromWorldCreate
		(
			() => new WorldGame(this.name)
		);

		var universe = Universe.fromMediaLibraryAndWorldCreator
		(
			mediaLibrary,
			worldCreator
		);

		universe.initialize
		(
			() => { universe.start(); }
		);
	}

	mediaFilePathsBuild(): string[]
	{
		var contentDirectoryPath = this.contentDirectoryPath;

		var imageTitlesDirectoryPath = contentDirectoryPath + "Images/Titles/";

		// For everything but the titles, use built-in content from the Framework.
		contentDirectoryPath = "../Source/Framework/Content/" + contentDirectoryPath;

		var fontDirectoryPath = contentDirectoryPath + "Fonts/";
		// var imageDirectoryPath = contentDirectoryPath + "Images/";
		var soundEffectDirectoryPath = contentDirectoryPath + "Audio/Effects/";
		var soundMusicDirectoryPath = contentDirectoryPath + "Audio/Music/";
		var textStringDirectoryPath = contentDirectoryPath + "Text/";
		var videoDirectoryPath = contentDirectoryPath + "Video/";

		var title = (x: string) => imageTitlesDirectoryPath + x;
		// var image = (x: string) => imageDirectoryPath + x;
		var effect = (x: string) => soundEffectDirectoryPath + x;
		var music = (x: string) => soundMusicDirectoryPath + x;
		var video = (x: string) => videoDirectoryPath + x;
		var font = (x: string) => fontDirectoryPath + x;
		var text = (x: string) => textStringDirectoryPath + x;

		var mediaFilePaths =
		[
			title("Opening.png"),
			title("Producer.png"),
			title("Title.png"),

			effect("_Default.wav"),
			effect("_Silence.wav"),
			effect("Bading.wav"),
			effect("Blip.wav"),
			effect("Boom.wav"),
			effect("Buzz.wav"),
			effect("Chirp.wav"),
			effect("Chirp-Reversed.wav"),
			effect("Clank.wav"),
			effect("Pluck.wav"),
			effect("Slap.wav"),

			music("_Default.mp3"),
			music("Producer.wav"),
			music("Title.mp3"),

			video("Movie.webm"),

			font("Font.ttf"),

			text("Instructions.txt"),
		];

		return mediaFilePaths;
	}
}
