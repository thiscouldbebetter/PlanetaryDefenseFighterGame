
class EnemyBurster extends Enemy
{
	constructor(pos: Coords)
	{
		super
		(
			EnemyBurster.name,
			pos,
			[
				Actor.fromActivityDefnName
				(
					EnemyBurster.activityDefnBuild().name
				),

				Carrier.create(),

				Device.fromNameTicksToChargeAndUse
				(
					"Gun",
					60, // 3 seconds
					uwpe => ProjectileGenerator.of(uwpe.entity).fire(uwpe) // use
				),

				Drawable.fromVisual
				(
					EnemyBurster.visualBuild()
				),

				Killable.fromDie(EnemyBurster.killableDie),

				Movable.fromAccelerationPerTickAndSpeedMax(2, 1),

				Enemy.projectileGeneratorBuild(),

				Scorable.fromPoints(100)
			]
		);
	}

	static fromPos(pos: Coords): EnemyBurster
	{
		return new EnemyBurster(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			EnemyBurster.name, EnemyBurster.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		// todo
	}

	static killableDie(uwpe: UniverseWorldPlaceEntities): void
	{
		Enemy.killableDie(uwpe);

		var entityKilled = uwpe.entity;
		var entityKilledPos = Locatable.of(entityKilled).pos();
		var place = uwpe.place as PlacePlanet;
		var chasersToSpawnCount = 4;
		for (var i = 0; i < chasersToSpawnCount; i++)
		{
			var entityChaser = EnemyChaser.fromPos(entityKilledPos);
			place.entityToSpawnAdd(entityChaser);
		}
	}

	static visualBuild(): VisualBase
	{
		var dimension = 4;

		var colors = Color.Instances();
		var colorBody = colors.Red;
		var colorHighlight = colors.White;

		var visualBuilder = VisualBuilder.Instance();

		var visual = visualBuilder.crystal(dimension, colorBody, colorHighlight);

		return visual;
	}
}
