
class Ship extends Entity
{
	constructor(pos: Coords)
	{
		super
		(
			Ship.name,
			[
				Actor.fromActivityDefnName
				(
					UserInputListener.activityDefn().name
				),

				Constrainable.fromConstraints
				([
					Constraint_WrapToPlaceSizeXTrimY.create(),
					Constraint_ContainInHemispace.fromHemispace
					(
						Hemispace.fromPlane
						(
							Plane.fromNormalAndDistanceFromOrigin
							(
								Coords.fromXY(0, 1), 250
							)
						)
					)
				]),

				Drawable.fromVisual
				(
					VisualPolygon.fromVerticesAndColorFill
					(
						[
							Coords.fromXY(-5, -5),
							Coords.fromXY(5, 0),
							Coords.fromXY(-5, 5),
						],
						Color.Instances().Gray
					)
				),

				Locatable.fromDisposition
				(
					Disposition.fromPosAndVel
					(
						Coords.fromXY(100, 100), // pos
						Coords.fromXY(1, 0) // vel
					)
				),

				Movable.fromAccelerationAndSpeedMax(0.2, 2),

				ProjectileGenerator.fromNameAndGenerations
				(
					"Bullet",
					[
						ProjectileGeneration.fromRadiusDistanceSpeedTicksDamageVisualAndInit
						(
							2, // radius
							5, // distanceInitial
							4, // speed
							32, // ticksToLive
							Damage.fromAmount(1),
							VisualGroup.fromChildren
							([
								VisualSound.default(),

								VisualCircle.fromRadiusAndColorFill
								(
									2, Color.Instances().Yellow
								)
							]),
							(entity) =>
							{
								entity.propertyAdd
								(
									Constrainable.fromConstraint
									(
										Constraint_WrapToPlaceSizeXTrimY.create()
									)
								);

								Drawable.of(entity).sizeInWrappedInstancesSet
								(
									Coords.fromXYZ(3, 1, 1)
								)
							}
						)
					]
				)

			]
		);
	}

	static fromPos(pos: Coords): Ship
	{
		return new Ship(pos);
	}

}
