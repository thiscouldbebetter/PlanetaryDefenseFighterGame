
class Enemy extends Entity
{
	constructor(pos: Coords)
	{
		super
		(
			Enemy.name,
			[
				Actor.fromActivityDefnName
				(
					Enemy.activityDefnBuild().name
				),

				Collidable.fromColliderPropertyNameAndCollide
				(
					Sphere.fromRadius(4),
					Player.name,
					(uwpe: UniverseWorldPlaceEntities, c: Collision) =>
					{
						var entityOther = uwpe.entity2;
						if (entityOther.name == Player.name)
						{
							var playerEntity = entityOther as Player;
							var playerKillable = Killable.of(playerEntity);
							playerKillable.kill();
						}
					}
				),

				Constrainable.fromConstraint
				(
					Constraint_WrapToPlaceSizeX.create()
				),

				Drawable.fromVisual
				(
					Enemy.visualBuild()
				).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1) ),

				Killable.fromDie(Enemy.killableDie),

				Locatable.fromPos(pos),

				Movable.fromAccelerationAndSpeedMax(2, 1),

				EnemyProperty.create()
			]
		);
	}

	static fromPos(pos: Coords): Enemy
	{
		return new Enemy(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			Enemy.name, Enemy.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var place = uwpe.place;
		var entity = uwpe.entity;

		var enemy = entity as Enemy;

		var enemyPos = Locatable.of(enemy).loc.pos;

		var enemyActor = Actor.of(enemy);
		var enemyActivity = enemyActor.activity;
		var targetEntity = enemyActivity.targetEntity();

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
				enemyActivity.targetEntitySet(targetEntity);
			}
		}

		var targetPos = Locatable.of(targetEntity).loc.pos;
		var displacementToTarget =
			Enemy.displacement()
			.overwriteWith(targetPos)
			.subtract(enemyPos);
		var distanceToTarget = displacementToTarget.magnitude();
		var enemyMovable = Movable.of(enemy);
		var enemyAccelerationPerTick =
			enemyMovable.accelerationPerTick(uwpe);
		if (distanceToTarget >= enemyAccelerationPerTick)
		{
			var enemySpeedMax =
				enemyMovable.speedMax(uwpe);
			var displacementToMove =
				displacementToTarget
					.divideScalar(distanceToTarget)
					.multiplyScalar(enemySpeedMax);
			enemyPos.add(displacementToMove);
		}
		else
		{
			enemyPos.overwriteWith(targetPos);
			var enemyProperty = EnemyProperty.of(enemy);
			if (enemyProperty.habitatCaptured == null)
			{
				enemyProperty.habitatCaptured = targetEntity as Habitat;

				var targetConstrainable =
					Constrainable.of(targetEntity);

				var constraintToAddToTarget = Constraint_Multiple.fromChildren
				([
					Constraint_AttachToEntityWithId
						.fromTargetEntityId(enemy.id),
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
							enemyPos.clone().addXY
							(
								0, 0 - place.size().y
							)
						)
					]
				);
				enemyActivity.targetEntitySet(targetEntity);
			}
			else
			{
				place.entityToRemoveAdd(enemyProperty.habitatCaptured);
				place.entityToRemoveAdd(enemy);
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
		var enemy = uwpe.entity as Enemy;
		var enemyProperty = EnemyProperty.of(enemy);
		var habitatCaptured = enemyProperty.habitatCaptured;
		if (habitatCaptured != null)
		{
			var constrainable = Constrainable.of(habitatCaptured);
			constrainable.constraintRemoveFinal();
		}

		var world = uwpe.world as WorldGame;
		world.statsKeeper.killsIncrement();

		var entityExplosion =
			uwpe.universe.entityBuilder.explosion
			(
				Locatable.of(enemy).loc.pos,
				10, // radius
				"Effects_Boom",
				40, // ticksToLive
				(uwpe) => {}
			);

		uwpe.place.entityToSpawnAdd(entityExplosion);
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

class EnemyProperty implements EntityProperty<EnemyProperty>
{
	habitatCaptured: Habitat;

	static create()
	{
		return new EnemyProperty();
	}

	static of(entity: Entity)
	{
		return entity.propertyByName(EnemyProperty.name) as EnemyProperty;
	}

	// EntityProperty.

	clone(): EnemyProperty
	{
		return new EnemyProperty();
	}

	equals(other: EnemyProperty): boolean
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

	overwriteWith(other: EnemyProperty): EnemyProperty
	{
		this.habitatCaptured = other.habitatCaptured;
		return this;
	}

	propertyName(): string
	{
		return EnemyProperty.name;
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

}

