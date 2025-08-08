
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
					uwpe => ProjectileGenerator.of(uwpe.entity).fire(uwpe) // use
				),

				Drawable.fromVisual
				(
					EnemyHarrier.visualBuild()
				),

				Killable.fromDie(Enemy.killableDie),

				Enemy.projectileGeneratorBuild(),

				Movable.fromAccelerationPerTickAndSpeedMax(2, 1),

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
		// todo
	}

	static visualBuild(): VisualBase
	{
		var dimension = 4;
		var colors = Color.Instances();
		var colorBody = colors.Yellow;
		var colorWindow = colors.Cyan;

		var visualCapsuleCenter = VisualRectangle.fromSizeAndColorFill
		(
			Coords.fromXY(1.5, 1),
			colorBody
		);

		var visualCapsuleEndLeft =
			VisualOffset.fromOffsetAndChild
			(
				Coords.fromXY(-0.75, 0),
				VisualCircle.fromRadiusAndColorFill(1, colorBody)
			);

		var visualCapsuleEndRight =
			VisualOffset.fromOffsetAndChild
			(
				Coords.fromXY(0.75, 0),
				VisualCircle.fromRadiusAndColorFill(1, colorBody)
			);

		var visualCapsule = VisualGroup.fromChildren
		([
			visualCapsuleEndLeft,
			visualCapsuleEndRight,
			visualCapsuleCenter
		]);

		var visualWindow = VisualCircle.fromRadiusAndColorFill(.5, colorWindow);

		var visualCapsuleWithWindows = VisualGroup.fromChildren
		([
			visualCapsule,
			VisualOffset.fromOffsetAndChild(Coords.fromXY(-0.5, 0), visualWindow.clone() ),
			VisualOffset.fromOffsetAndChild(Coords.fromXY(0, 0), visualWindow.clone() ),
			VisualOffset.fromOffsetAndChild(Coords.fromXY(0.5, 0), visualWindow.clone() )
		]);

		var scaleFactors = Coords.ones().multiplyScalar(dimension);

		var transform =
			Transform_Scale.fromScaleFactors(scaleFactors);

		visualCapsuleWithWindows.transform(transform);

		return visualCapsuleWithWindows;
	}
}
