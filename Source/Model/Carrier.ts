
class Carrier extends EntityPropertyBase<Carrier>
{
	habitatCarried: Habitat;

	static create()
	{
		return new Carrier();
	}

	static of(entity: Entity): Carrier
	{
		return entity.propertyByName(Carrier.name) as Carrier;
	}

	// Clonable.

	clone(): Carrier
	{
		return new Carrier();
	}
}
