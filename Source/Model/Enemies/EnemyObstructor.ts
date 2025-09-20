
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

				Killable.fromDie(EnemyObstructor.killableDie),

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

	static activityDefnPerform_MoveTowardTarget_TargetHasBeenReached
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var enemy = uwpe.entity;

		var enemyActivity = Actor.of(enemy).activity;
		var targetEntity = enemyActivity.targetEntity();
		var targetPos = Locatable.of(targetEntity).pos();

		var enemyPos = Locatable.of(enemy).pos();
		enemyPos.overwriteWith(targetPos);

		enemyActivity.targetEntityClear();
	}

	static killableDie(uwpe: UniverseWorldPlaceEntities): void
	{
		Enemy.killableDie(uwpe);
	}

	static visualBuild(): VisualBase
	{
		var dimension = 8;

		var visualBuilder = VisualBuilder.Instance();

		var visual = visualBuilder.archeryTarget(dimension);

		return visual;
	}
}
