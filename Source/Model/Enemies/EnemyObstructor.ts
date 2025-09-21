
class EnemyObstructor extends Enemy
{
	constructor(pos: Coords)
	{
		super
		(
			EnemyObstructor.name,
			pos,
			[
				Actor.fromActivityDefnName
				(
					EnemyObstructor.activityDefnBuild().name
				),

				Drawable.fromVisual
				(
					EnemyObstructor.visualBuild()
				),

				Enemy.killableBuild(),

				Scorable.fromPoints(100)
			]
		);
	}

	static fromPos(pos: Coords): EnemyObstructor
	{
		return new EnemyObstructor(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			EnemyObstructor.name, EnemyObstructor.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

	static visualBuild(): Visual
	{
		var dimension = 8;

		var visualBuilder = VisualBuilder.Instance();

		var visual = visualBuilder.archeryTarget(dimension);

		return visual;
	}
}
