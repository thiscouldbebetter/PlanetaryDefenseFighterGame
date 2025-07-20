
class Habitat extends Entity implements EntityProperty<Habitat>
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
					VisualPolygon.fromVerticesAndColorFill
					(
						[
							Coords.fromXY(4, 0),
							Coords.fromXY(-4, 0),
							Coords.fromXY(-4, -4),
							Coords.fromXY(0, -8),
							Coords.fromXY(4, -4)
						],
						Color.byName("Brown")
					)
				).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1) ),

				Locatable.fromPos(pos)
			]
		);

		this.propertyAdd(this);
	}

	static fromPos(pos: Coords): Habitat
	{
		return new Habitat(pos);
	}


	// Clonable.

	clone(): Habitat
	{
		throw new Error("Not implemented!");
	}

	overwriteWith(other: Habitat): Habitat
	{
		throw new Error("Not implemented!");
	}

	// EntityProperty.

	equals(other: Habitat): boolean
	{
		return (this == other);
	}

	propertyName(): string
	{
		return Habitat.name;
	}
}
