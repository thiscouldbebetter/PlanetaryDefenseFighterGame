
class Habitat extends Entity
{
	constructor(pos: Coords)
	{
		super
		(
			Habitat.name,
			[
				Constrainable.fromConstraints
				([
					Constraint_Gravity.fromAccelerationPerTick
					(
						Coords.fromXY(0, .03)
					),
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
					Habitat.visualBuild()
				).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1) ),

				HabitatProperty.create(),

				Locatable.fromPos(pos)
			]
		);
	}

	static fromPos(pos: Coords): Habitat
	{
		return new Habitat(pos);
	}

	static visualBuild(): VisualBase
	{
		var houseOutlineAsPath = Path.fromPoints
		([
			Coords.fromXY(1, 0), // Right bottom.
			Coords.fromXY(-1, 0), // Left bottom.
			Coords.fromXY(-1, -1), // Left eave.
			Coords.fromXY(0, -2), // Peak of roof.
			Coords.fromXY(1, -1) // Right eave.
		]).transform(Transform_Scale.fromScaleFactor(4) );

		var house = VisualPolygon.fromPathAndColorFill
		(
			houseOutlineAsPath,
			Color.Instances().Brown
		);

		return house;
	}
}

class HabitatProperty extends EntityPropertyBase<HabitatProperty>
{
	static create(): HabitatProperty
	{
		return new HabitatProperty();
	}
}
