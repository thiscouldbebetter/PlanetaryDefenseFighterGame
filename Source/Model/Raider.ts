
class Raider extends Entity
{
	constructor(pos: Coords)
	{
		super
		(
			Raider.name,
			[
				Actor.fromActivityDefnName
				(
					Raider.activityDefnBuild().name
				),

				Collidable.fromCollider(Sphere.fromRadius(4) ),

				Constrainable.fromConstraint
				(
					Constraint_WrapToPlaceSizeX.create()
				),

				Drawable.fromVisual
				(
					Raider.visualBuild()
				).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1) ),

				Killable.fromDie(Raider.killableDie),

				Locatable.fromPos(pos),

				Movable.fromAccelerationAndSpeedMax(2, 1),

				RaiderProperty.create()
			]
		);
	}

	static fromPos(pos: Coords): Raider
	{
		return new Raider(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			Raider.name, Raider.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var place = uwpe.place;
		var entity = uwpe.entity;

		var raider = entity as Raider;

		var raiderPos = Locatable.of(raider).loc.pos;

		var raiderActor = Actor.of(raider);
		var raiderActivity = raiderActor.activity;
		var targetEntity = raiderActivity.targetEntity();

		if (targetEntity == null)
		{
			var placeDefault = place as PlaceDefault;
			var habitats = placeDefault.habitats();
			if (habitats.length == 0)
			{
				return; // todo
			}
			else
			{
				targetEntity = ArrayHelper.random
				(
					habitats, universe.randomizer
				);
				raiderActivity.targetEntitySet(targetEntity);
			}
		}

		var targetPos = Locatable.of(targetEntity).loc.pos;
		var displacementToTarget =
			Raider.displacement()
			.overwriteWith(targetPos)
			.subtract(raiderPos);
		var distanceToTarget = displacementToTarget.magnitude();
		var raiderMovable = Movable.of(raider);
		var raiderAccelerationPerTick =
			raiderMovable.accelerationPerTick(uwpe);
		if (distanceToTarget >= raiderAccelerationPerTick)
		{
			var raiderSpeedMax =
				raiderMovable.speedMax(uwpe);
			var displacementToMove =
				displacementToTarget
					.divideScalar(distanceToTarget)
					.multiplyScalar(raiderSpeedMax);
			raiderPos.add(displacementToMove);
		}
		else
		{
			raiderPos.overwriteWith(targetPos);
			var raiderProperty = RaiderProperty.of(raider);
			if (raiderProperty.habitatCaptured == null)
			{
				raiderProperty.habitatCaptured = targetEntity as Habitat;

				var targetConstrainable =
					Constrainable.of(targetEntity);

				var constraintToAddToTarget = Constraint_Multiple.fromChildren
				([
					Constraint_AttachToEntityWithId
						.fromTargetEntityId(raider.id),
					Constraint_Transform.fromTransform
					(
						Transform_Translate.fromDisplacement
						(
							Coords.fromXY(0, 10)
						)
					)
				]);

				targetConstrainable
					.constraintAdd(constraintToAddToTarget);

				targetEntity = Entity.fromNameAndProperties
				(
					"EscapePoint",
					[
						Locatable.fromPos
						(
							raiderPos.clone().addXY
							(
								0, 0 - place.size().y
							)
						)
					]
				);
				raiderActivity.targetEntitySet(targetEntity);
			}
			else
			{
				place.entityToRemoveAdd(raiderProperty.habitatCaptured);
				place.entityToRemoveAdd(raider);
			}
		}
	}

	static _displacement: Coords;
	static displacement(): Coords
	{
		if (this._displacement == null)
		{
			this._displacement = Coords.create();
		}
		return this._displacement;
	}

	static killableDie(uwpe: UniverseWorldPlaceEntities)
	{
		var raider = uwpe.entity as Raider;
		var raiderProperty = RaiderProperty.of(raider);
		var habitatCaptured = raiderProperty.habitatCaptured;
		if (habitatCaptured != null)
		{
			var constrainable = Constrainable.of(habitatCaptured);
			constrainable.constraintRemoveFinal();
		}
	}

	static visualBuild(): VisualBase
	{
		return VisualGroup.fromChildren
		([
			VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill
			(
				6, 4, Color.Instances().Green
			),
			VisualEllipse.fromSemiaxesHorizontalAndVerticalAndColorFill
			(
				4, 3, Color.Instances().Red
			),
			VisualFan.fromRadiusAnglesStartAndSpannedAndColorsFillAndBorder
			(
				4, // radius
				.5, .5, // angleStart-, angleSpannedInTurns
				Color.Instances().Red, null // colorFill, colorBorder
			)
		]);
	}
}

class RaiderProperty implements EntityProperty<RaiderProperty>
{
	habitatCaptured: Habitat;

	static create()
	{
		return new RaiderProperty();
	}

	static of(entity: Entity)
	{
		return entity.propertyByName(RaiderProperty.name) as RaiderProperty;
	}

	// EntityProperty.

	clone(): RaiderProperty
	{
		return new RaiderProperty();
	}

	equals(other: RaiderProperty): boolean
	{
		return (this.habitatCaptured == other.habitatCaptured);
	}

	finalize(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

	overwriteWith(other: RaiderProperty): RaiderProperty
	{
		this.habitatCaptured = other.habitatCaptured;
		return this;
	}

	propertyName(): string
	{
		return RaiderProperty.name;
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

}

