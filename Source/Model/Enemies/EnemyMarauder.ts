
class EnemyMarauder extends Enemy
{
	constructor(pos: Coords)
	{
		super
		(
			EnemyMarauder.name,
			pos,
			[
				Actor.fromActivityDefnName
				(
					EnemyMarauder.activityDefnBuild().name
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
					EnemyMarauder.visualBuild()
				),

				Enemy.killableBuild(),

				Enemy.projectileShooterBuild(),

				Movable.fromAccelerationPerTickAndSpeedMax(4, 2),

				Scorable.fromPoints(100)
			]
		);
	}

	static fromPos(pos: Coords): EnemyMarauder
	{
		return new EnemyMarauder(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			EnemyMarauder.name, EnemyMarauder.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		var enemy = uwpe.entity;
		var enemyActivity = Actor.of(enemy).activity;
		var targetEntity = enemyActivity.targetEntity();
		if (targetEntity == null)
		{
			targetEntity =
				Enemy.activityDefnPerform_ChooseTargetEntity_RandomPoint(uwpe);
			enemyActivity.targetEntitySet(targetEntity);
		}

		Enemy.activityDefnPerform_MoveTowardTarget
		(
			uwpe,
			Enemy.activityDefnPerform_TargetClear
		);

		// The marauder moves around jerkily.
		var jitterDistanceMax = 4;
		var randomizer = uwpe.universe.randomizer;
		var randomJitter =
			Polar
				.random2D(randomizer)
				.toCoords()
				.multiplyScalar(jitterDistanceMax);
		Locatable.of(enemy).pos().add(randomJitter);

		var place = uwpe.place as PlacePlanet;
		var player = place.player();
		if (player != null)
		{
			Enemy.activityDefnPerform_FireGunAtPlayerIfCharged(uwpe);
		}
	}

	static visualBuild(): Visual
	{
		var colors = Color.Instances();
		var colorSaucer = colors.Red;
		var colorDome = colors.Green;

		return VisualGroup.fromChildren
		([
			VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill
			(
				6, 4, colorSaucer
			),
			VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill
			(
				4, 3, colorDome
			),
			VisualFan.fromRadiusAnglesStartAndSpannedAndColorsFillAndBorder
			(
				4, // radius
				.5, .5, // angleStart-, angleSpannedInTurns
				colorDome, null // colorFill, colorBorder
			)
		]);
	}
}
