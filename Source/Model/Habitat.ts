
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
				),

				HabitatProperty.create(),

				Locatable.fromPos(pos),

				PlacePlanet.wrappableBuildWithPosTrimmedToPlaceSizeY(false)
			]
		);
	}

	static fromPos(pos: Coords): Habitat
	{
		return new Habitat(pos);
	}

	static visualBuild(): Visual
	{
		var houseOutlineAsPath = Path.fromPoints
		([
			Coords.fromXY(1, 0), // Lower-right corner of wall.
			Coords.fromXY(.25, 0), // Lower-right corner of door.
			Coords.fromXY(.25, -.5), // Upper-right corner of door.
			Coords.fromXY(-.25, -.5), // Upper-left corner of door.
			Coords.fromXY(-.25, 0), // Lower-left corner of door.
			Coords.fromXY(-1, 0), // Lower-left corner of wall.
			Coords.fromXY(-1, -1), // Left eave.
			Coords.fromXY(0, -2), // Peak of roof.
			Coords.fromXY(1, -1) // Right eave.
		]).transform(Transform_Scale.fromScaleFactor(4) );

		var house: Visual = VisualPolygon.fromPathAndColorFill
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
