
class EnemyHarrier extends Enemy
{
	constructor(pos: Coords)
	{
		super
		(
			EnemyHarrier.name,
			pos,
			[
				Actor.fromActivityDefnName
				(
					EnemyHarrier.activityDefnBuild().name
				),

				Carrier.create(),

				Device.fromNameTicksToChargeAndUse
				(
					"Gun",
					60, // 3 seconds
					uwpe => ProjectileShooter.of(uwpe.entity).generatorDefault().fire(uwpe) // use
				),

				Drawable.fromVisual
				(
					EnemyHarrier.visualBuild()
				),

				Enemy.killableBuild(),

				Enemy.projectileShooterBuild(),

				Movable.fromAccelerationPerTickAndSpeedMax(2, 2),

				Scorable.fromPoints(100)
			]
		);
	}

	static fromPos(pos: Coords): EnemyHarrier
	{
		return new EnemyHarrier(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			EnemyHarrier.name, EnemyHarrier.activityDefnPerform
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
			EnemyHarrier.activityDefnPerform_MoveTowardTarget_TargetHasBeenReached
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

	static generatorBuildForBox
	(
		enemyGenerationZone: BoxAxisAligned
	): EntityGenerator
	{
		var enemyHarrierGenerator = EntityGenerator.fromNameEntityTicksBatchMaxesAndPosBox
		(
			EntityGenerator.name + EnemyHarrier.name,
			EnemyHarrier.fromPos(Coords.create() ),
			200, // ticksPerGeneration = 10 seconds.
			1, // entitiesPerGeneration
			1, // concurrent
			null, // all-time
			enemyGenerationZone
		);
		enemyHarrierGenerator.inactivate();
		return enemyHarrierGenerator;
	}

	static visualBuild(): Visual
	{
		var dimension = 6;

		var colors = Color.Instances();
		var colorBody = colors.Green;
		var colorWindow = colors.Red;

		var visualCapsuleCenter = VisualRectangle.fromSizeAndColorFill
		(
			Coords.fromXY(1.5, 1).multiplyScalar(dimension),
			colorBody
		);

		var radius = dimension / 2;

		var visualCapsuleEndLeft =
			VisualOffset.fromOffsetAndChild
			(
				Coords.fromXY(-0.75, 0).multiplyScalar(dimension),
				VisualCircle.fromRadiusAndColorFill(radius, colorBody)
			);

		var visualCapsuleEndRight =
			VisualOffset.fromOffsetAndChild
			(
				Coords.fromXY(0.75, 0).multiplyScalar(dimension),
				VisualCircle.fromRadiusAndColorFill(radius, colorBody)
			);

		var visualCapsule = VisualGroup.fromChildren
		([
			visualCapsuleEndLeft,
			visualCapsuleEndRight,
			visualCapsuleCenter
		]);

		var radiusWindow = dimension / 4;
		var visualWindow = VisualCircle.fromRadiusAndColorFill(radiusWindow, colorWindow);

		var visualCapsuleWithWindows = VisualGroup.fromChildren
		([
			visualCapsule,
			VisualOffset.fromOffsetAndChild(Coords.fromXY(-0.75, 0).multiplyScalar(dimension), visualWindow.clone() ),
			VisualOffset.fromOffsetAndChild(Coords.fromXY(0, 0).multiplyScalar(dimension), visualWindow.clone() ),
			VisualOffset.fromOffsetAndChild(Coords.fromXY(0.75, 0).multiplyScalar(dimension), visualWindow.clone() )
		]);

		return visualCapsuleWithWindows;
	}
}
