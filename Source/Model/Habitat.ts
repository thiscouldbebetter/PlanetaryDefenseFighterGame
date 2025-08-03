
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
		return VisualPolygon.fromVerticesAndColorFill
		(
			[
				Coords.fromXY(4, 0),
				Coords.fromXY(-4, 0),
				Coords.fromXY(-4, -4),
				Coords.fromXY(0, -8),
				Coords.fromXY(4, -4)
			],
			Color.byName("Brown")
		);
	}
}

class HabitatProperty implements EntityProperty<HabitatProperty>
{
	static create(): HabitatProperty
	{
		return new HabitatProperty();
	}

	// Clonable.

	clone(): HabitatProperty
	{
		throw new Error("Not implemented!");
	}

	overwriteWith(other: HabitatProperty): HabitatProperty
	{
		throw new Error("Not implemented!");
	}

	// EntityProperty.

	equals(other: HabitatProperty): boolean
	{
		return (this == other);
	}

	finalize(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

	propertyName(): string
	{
		return HabitatProperty.name;
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}
}
