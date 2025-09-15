
class EnemyMinelayer extends Enemy
{
	constructor(pos: Coords)
	{
		super
		(
			EnemyMinelayer.name,
			pos,
			[
				Actor.fromActivityDefnName
				(
					EnemyMinelayer.activityDefnBuild().name
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
					EnemyMinelayer.visualBuild()
				),

				Killable.fromDie(Enemy.killableDie),

				Movable.fromAccelerationPerTickAndSpeedMax(2, 1),

				Enemy.projectileShooterBuild(),

				Scorable.fromPoints(100)
			]
		);
	}

	static fromPos(pos: Coords): EnemyMinelayer
	{
		return new EnemyMinelayer(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			EnemyMinelayer.name, EnemyMinelayer.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		// Fly in a horizontal zigzag, dropping mines constantly.

		Enemy.activityDefnPerform_FireGunAtPlayerIfCharged(uwpe);

		var enemy = uwpe.entity as Enemy;
		var enemyActivity = Actor.of(enemy).activity;
		var target = enemyActivity.targetEntity();
		if (target == null)
		{
			var place = uwpe.place as PlacePlanet;
			var placeSizeMinusSurface = place.sizeMinusSurface();
			var altitudesToFlyBetweenAsFractions = [0.25, 0.75];
			var altitudesToFlyBetween =
				altitudesToFlyBetweenAsFractions.map(x => x * placeSizeMinusSurface.y);
			var differenceOfAltitudesToFlyBetween =
				altitudesToFlyBetween[1] - altitudesToFlyBetween[0];

			var enemyPos = Locatable.of(enemy).pos();
			var altitudeToFlyBetweenIndex =
				(enemyPos.y <= altitudesToFlyBetween[0])
				? 0
				: 1;
			var altitudeToFlyToward =
				altitudesToFlyBetween[altitudeToFlyBetweenIndex];
			var targetPos = Coords.fromXY
			(
				enemyPos.x + differenceOfAltitudesToFlyBetween,
				altitudeToFlyToward
			);
			var target = Entity.fromProperty(Locatable.fromPos(targetPos) );
			enemyActivity.targetEntitySet(target);
		}
		else
		{
			Enemy.activityDefnPerform_MoveTowardTarget
			(
				uwpe,
				() => EnemyMinelayer.activityDefnPerform_TargetHasBeenReached(uwpe)
			);
		}
	}

	static activityDefnPerform_TargetHasBeenReached(uwpe: UniverseWorldPlaceEntities): void
	{
		var enemy = uwpe.entity as Enemy;
		var enemyActivity = Actor.of(enemy).activity;
		enemyActivity.targetEntityClear();
	}

	static visualBuild(): VisualBase
	{
		var colors = Color.Instances();

		return VisualGroup.fromChildren
		([
			VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill
			(
				6, 4, colors.Green
			),
			VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill
			(
				4, 3, colors.Red
			),
			VisualFan.fromRadiusAnglesStartAndSpannedAndColorsFillAndBorder
			(
				4, // radius
				.5, .5, // angleStart-, angleSpannedInTurns
				colors.Red, null // colorFill, colorBorder
			)
		]);
	}
}
