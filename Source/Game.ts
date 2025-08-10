
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
		var mediaLibrary = this.mediaLibraryBuild()

		var worldCreator = WorldCreator.fromWorldCreate
		(
			() => new WorldGame(this.name)
		);

		var universe = Universe.fromNameMediaLibraryAndWorldCreator
		(
			"PlanetaryDefenseFighterGame",
			mediaLibrary,
			worldCreator
		);

		universe.initializeAndStart();
	}

	mediaLibraryBuild() : MediaLibrary
	{
		var mediaFilePaths = this.mediaLibraryBuild_FilePaths();

		var mediaLibrary = MediaLibrary.fromContentDirectoryPathAndMediaFilePaths
		(
			this.contentDirectoryPath, mediaFilePaths
		);

		var soundTest = this.mediaLibraryBuild_SoundTest();
		mediaLibrary.soundAdd(soundTest);

		return mediaLibrary;
	}

	mediaLibraryBuild_FilePaths(): string[]
	{
		var contentDirectoryPath = this.contentDirectoryPath;

		var imageTitlesDirectoryPath = contentDirectoryPath + "Images/Titles/";

		// For everything but the titles, use built-in content from the Framework.
		contentDirectoryPath = "../Source/Framework/Content/" + contentDirectoryPath;

		var fontDirectoryPath = contentDirectoryPath + "Fonts/";
		//var imageDirectoryPath = contentDirectoryPath + "Images/";
		var soundEffectDirectoryPath = contentDirectoryPath + "Audio/Effects/";
		var soundMusicDirectoryPath = contentDirectoryPath + "Audio/Music/";
		var textStringDirectoryPath = contentDirectoryPath + "Text/";
		var videoDirectoryPath = contentDirectoryPath + "Video/";

		var title = (a: string) => imageTitlesDirectoryPath + a;
		// var image = (a: string) => imageDirectoryPath + a;
		var effect = (a: string) => soundEffectDirectoryPath + a;
		var music = (a: string) => soundMusicDirectoryPath + a;
		var video = (a: string) => videoDirectoryPath + a;
		var font = (a: string) => fontDirectoryPath + a;
		var text = (a: string) => textStringDirectoryPath + a;

		var mediaFilePaths =
		[
			title("Opening.png"),
			title("Producer.png"),
			title("Title.png"),

			effect("_Default.wav"),
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

	mediaLibraryBuild_SoundTest(): Sound
	{
		var soundSequenceBahding =
			SoundSequence.fromNameDurationVoiceAndStringsForPitchesAndDurations
			(
				"Bahding",
				1,
				SoundSequenceVoice.Instances().Harmonics,
				"880,1760",
				"10,10,5,3,1,1,1"
			);

		var soundSynthesizedBahding =
			SoundFromSoundEffectSynthesizerSequence.fromNameAndSoundSequence
			(
				"Bahding",
				soundSequenceBahding
			);

		return soundSynthesizedBahding;
	}
}
