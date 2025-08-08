
class EnemyChaser extends Enemy
{
	constructor(pos: Coords)
	{
		super
		(
			EnemyChaser.name,
			pos,
			[
				Actor.fromActivityDefnName
				(
					EnemyChaser.activityDefnBuild().name
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
					EnemyChaser.visualBuild()
				),

				Killable.fromDie(Enemy.killableDie),

				Enemy.projectileGeneratorBuild(),

				Movable.fromAccelerationPerTickAndSpeedMax(2, 1),

				Scorable.fromPoints(100)
			]
		);
	}

	static fromPos(pos: Coords): EnemyChaser
	{
		return new EnemyChaser(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			EnemyChaser.name, EnemyChaser.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		// todo
	}

	static visualBuild(): VisualBase
	{
		var colors = Color.Instances();
		var color = colors.Red;

		var dimension = 3;
		var visualBuilder = VisualBuilder.Instance();
		var visual = visualBuilder.rhombusOfColor
		(
			color
		).transform
		(
			Transform_Scale.fromScaleFactor(dimension)
		);

		return visual;
	}
}
