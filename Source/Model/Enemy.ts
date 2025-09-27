
class Enemy extends Entity
{
	constructor(name: string, pos: Coords, properties: EntityProperty[])
	{
		var propertiesCommonToAllEnemies = 
		[
			Enemy.collidableBuild(),
			Enemy.constrainableBuild(),
			EnemyProperty.create(),
			Locatable.fromPos(pos),
			PlacePlanet.wrappableBuildWithPosTrimmedToPlaceSizeY(false)
		];
		properties.push(...propertiesCommonToAllEnemies);

		super(name, properties);
	}

	static activityDefnPerform_ChooseTargetEntity_RandomPoint
	(
		uwpe: UniverseWorldPlaceEntities
	): Entity
	{
		var place = uwpe.place as PlacePlanet;

		var planet = place.planet();
		var placeSize = place.size();
		var placeSizeMinusGround =
			placeSize
				.clone()
				.subtract(Coords.fromXY(0, planet.horizonHeight) );
		var randomizer = uwpe.universe.randomizer;
		var posRandom = Coords.random(randomizer).multiply(placeSizeMinusGround);
		var targetEntity = Entity.fromNameAndProperty
		(
			"RandomPoint",
			Locatable.fromPos(posRandom)
		);
		return targetEntity;
	}

	static activityDefnPerform_FireGunAtPlayerIfCharged(uwpe: UniverseWorldPlaceEntities): void
	{
		var enemy = uwpe.entity;
		var enemyDisp = Locatable.of(enemy).loc;
		var enemyPos = enemyDisp.pos;

		var place = uwpe.place as PlacePlanet;
		var player = place.player();

		if (player != null)
		{
			var deviceGun = Device.of(enemy);
			uwpe.entity2Set(enemy); // For Device.
			var deviceGunCanBeUsed = deviceGun.canUse(uwpe);
			if (deviceGunCanBeUsed)
			{
				var playerPos = Locatable.of(player).pos();
				var displacementToPlayer =
					playerPos.clone().subtract(enemyPos);
				var distanceToPlayer = displacementToPlayer.magnitude();
				var projectileShooter = ProjectileShooter.of(enemy);
				var projectileGenerator = projectileShooter.generatorDefault();
				var projectileRange = projectileGenerator.range();
				if (distanceToPlayer < projectileRange)
				{
					var directionToPlayer =
						displacementToPlayer.normalize();
					enemyDisp.orientation.forwardSet(directionToPlayer);
					deviceGun.use(uwpe);
				}
			}
		}
	}

	static activityDefnPerform_MoveTowardTarget
	(
		uwpe: UniverseWorldPlaceEntities,
		targetHasBeenReached: (uwpe: UniverseWorldPlaceEntities) => void
	): void
	{
		var enemy = uwpe.entity;

		var enemyPos = Locatable.of(enemy).pos();

		var enemyActor = Actor.of(enemy);
		var enemyActivity = enemyActor.activity;
		var targetEntity = enemyActivity.targetEntity();

		var targetPos = Locatable.of(targetEntity).loc.pos;
		var displacementToTarget =
			Enemy
				.displacement()
				.overwriteWith(targetPos)
				.subtract(enemyPos);
		var distanceToTarget = displacementToTarget.magnitude();
		var directionToTarget =
			displacementToTarget.clone().divideScalar(distanceToTarget);
		var enemyMovable = Movable.of(enemy);
		var enemyAccelerationPerTick =
			enemyMovable.accelerationPerTickInDirection(uwpe, directionToTarget);
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
			targetHasBeenReached(uwpe);
		}
	}

	static activityDefnPerform_TargetClear
	(
		uwpe: UniverseWorldPlaceEntities
	): void
	{
		var enemy = uwpe.entity;
		var enemyActivity = Actor.of(enemy).activity;
		enemyActivity.targetEntityClear();
	}

	static collidableBuild(): Collidable
	{
		var collider = Sphere.fromRadius(4);

		return Collidable.fromColliderPropertyNameAndCollide
		(
			collider,
			Player.name,
			(uwpe: UniverseWorldPlaceEntities, c: Collision) =>
			{
				var entityOther = uwpe.entity2;
				if (entityOther.name == Player.name)
				{
					var playerEntity = entityOther as Player;
					var playerKillable = Killable.of(playerEntity);
					playerKillable.kill();

					var enemyEntity = uwpe.entity;
					var enemyKillable = Killable.of(enemyEntity);
					enemyKillable.kill();
				}
			}
		);
	}

	static constrainableBuild(): Constrainable
	{
		return Constrainable.fromConstraint
		(
			Constraint_WrapToPlaceSizeX.create()
		);
	}

	static killableBuild(): Killable
	{
		return Killable.fromDie(this.killableDie);
	}

	static killableDie(uwpe: UniverseWorldPlaceEntities): void
	{
		var place = uwpe.place as PlacePlanet;
		var enemy = uwpe.entity;

		var entityExplosion =
			uwpe.universe.entityBuilder.explosion
			(
				Locatable.of(enemy).loc.pos,
				10, // radius
				"Effects_Boom",
				40, // ticksToLive
				(uwpe) => {}
			);

		entityExplosion
			.propertyAdd(EnemyProperty.create() )
			.propertyAdd(PlacePlanet.wrappableBuildWithPosTrimmedToPlaceSizeY(false) );

		place.entityToSpawnAdd(entityExplosion);

		// Stats.

		var player = place.player();
		var playerStatsKeeper = StatsKeeper.of(player);

		playerStatsKeeper.killsIncrement();

		var scorable = Scorable.of(enemy);
		var scoreForKillingEnemy = scorable.scoreGet(uwpe);
		playerStatsKeeper.scoreAdd(scoreForKillingEnemy);
	}

	static projectileShooterBuild(): ProjectileShooter
	{
		var propertyNames = [ Playable.name ];
		var shooter =
			ProjectileShooter.default()
			.collideOnlyWithEntitiesHavingPropertiesNamedSet(propertyNames);
		return shooter;
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
}

class EnemyProperty extends EntityPropertyBase<EnemyProperty>
{
	static create()
	{
		return new EnemyProperty();
	}

	static of(entity: Entity)
	{
		return entity.propertyByName(EnemyProperty.name) as EnemyProperty;
	}

	// Clonable.

	clone(): EnemyProperty
	{
		return new EnemyProperty();
	}
}

