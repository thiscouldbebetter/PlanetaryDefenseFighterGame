
class EnemyChaser extends Enemy
{
	constructor(pos: Coords, vel: Coords)
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

		Locatable.of(this).loc.vel.overwriteWith(vel);
	}

	static fromPosAndVel(pos: Coords, vel: Coords): EnemyChaser
	{
		return new EnemyChaser(pos, vel);
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
		var place = uwpe.place as PlacePlanet;
		var enemy = uwpe.entity;

		var player = place.player();
		if (player != null)
		{
			Enemy.activityDefnPerform_FireGunAtPlayerIfCharged(uwpe);
		}

		var enemyActor = Actor.of(enemy);
		var enemyActivity = enemyActor.activity;
		var targetEntity = enemyActivity.targetEntity();

		if (targetEntity == null)
		{
			targetEntity = place.player();
		}

		enemyActivity.targetEntitySet(targetEntity);

		Enemy.activityDefnPerform_MoveTowardTarget
		(
			uwpe,
			EnemyChaser.activityDefnPerform_MoveTowardTarget_TargetHasBeenReached
		);
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

	static visualBuild(): VisualBase
	{
		var colors = Color.Instances();
		var color = colors.Red;

		var dimension = 6;
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
