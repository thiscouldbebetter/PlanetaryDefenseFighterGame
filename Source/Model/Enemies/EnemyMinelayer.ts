
class EnemyMinelayer extends Enemy
{
	constructor(pos: Coords)
	{
		super
		(
			EnemyMinelayer.name,
			pos,
			[
				Actor.fromActivityDefnName
				(
					EnemyMinelayer.activityDefnBuild().name
				),

				Carrier.create(),

				EnemyMinelayer.deviceMineLauncherBuild(),

				Drawable.fromVisual
				(
					EnemyMinelayer.visualBuild()
				),

				Enemy.killableBuild(),

				Movable.fromAccelerationPerTickAndSpeedMax(2, 2.5),

				EnemyMinelayer.projectileShooterBuild(),

				Scorable.fromPoints(250)
			]
		);
	}

	static fromPos(pos: Coords): EnemyMinelayer
	{
		return new EnemyMinelayer(pos);
	}

	static activityDefnBuild(): ActivityDefn
	{
		return new ActivityDefn
		(
			EnemyMinelayer.name, EnemyMinelayer.activityDefnPerform
		);
	}

	static activityDefnPerform(uwpe: UniverseWorldPlaceEntities): void
	{
		// Fly in a horizontal zigzag, dropping mines constantly.

		Enemy.activityDefnPerform_FireGunAtPlayerIfCharged(uwpe);

		var enemy = uwpe.entity as Enemy;

		var place = uwpe.place as PlacePlanet;
		var placeSizeMinusSurface = place.sizeMinusSurface();
		var altitudesToFlyBetweenAsFractions = [0.15, 0.85];
		var altitudesToFlyBetween =
			altitudesToFlyBetweenAsFractions.map(x => x * placeSizeMinusSurface.y);
		var enemyDisp = Locatable.of(enemy).loc; 
		var enemyVel = enemyDisp.vel;
		var enemySpeed = enemyVel.magnitude();
		if (enemySpeed == 0)
		{
			var enemySpeedFixed = Movable.of(enemy).speedMax(null);
			var enemyVelToSet =
				Coords.oneOneZero().normalize().multiplyScalar(enemySpeedFixed);
			enemyVel.overwriteWith(enemyVelToSet);
		}
		var enemyPos = enemyDisp.pos;
		var enemyPosY = enemyPos.y;
		var enemyPosYIsOutsideAllowedRange =
			enemyPosY < altitudesToFlyBetween[0]
			|| enemyPosY > altitudesToFlyBetween[1];
		if (enemyPosYIsOutsideAllowedRange)
		{
			enemyVel.y *= -1;
			enemyPos.add(enemyVel);
		}
		EnemyMinelayer.activityDefnPerform_FireMineLauncherIfCharged(uwpe);
	}

	static activityDefnPerform_FireMineLauncherIfCharged(uwpe: UniverseWorldPlaceEntities): void
	{
		var enemy = uwpe.entity;

		var place = uwpe.place as PlacePlanet;
		var player = place.player();

		if (player != null)
		{
			var deviceGun = Device.of(enemy);
			uwpe.entity2Set(enemy); // For Device.
			var deviceGunCanBeUsed = deviceGun.canUse(uwpe);
			if (deviceGunCanBeUsed)
			{
				deviceGun.use(uwpe);
			}
		}
	}

	static deviceMineLauncherBuild()
	{
		return Device.fromNameTicksToChargeAndUse
		(
			"Gun",
			20, // 1 seconds
			uwpe => ProjectileShooter.of(uwpe.entity).generatorDefault().fire(uwpe) // use
		);
	}

	static generatorBuildForBoxAndLevelIndex
	(
		enemyGenerationZone: BoxAxisAligned,
		levelIndex: number
	): EntityGenerator
	{
		var levelOfFirstAppearanceIndex = 1;
		var enemiesAdditionalPerLevel = 1;
		var enemiesCount =
			enemiesAdditionalPerLevel * (levelIndex - levelOfFirstAppearanceIndex);

		var enemyMinelayerGenerator = EntityGenerator.fromNameEntityTicksBatchMaxesAndPosBox
		(
			EntityGenerator.name + EnemyMinelayer.name,
			EnemyMinelayer.fromPos(Coords.create() ),
			0, // ticksPerGeneration
			enemiesCount, // entitiesPerGeneration
			enemiesCount, // concurrent
			enemiesCount, // all-time
			enemyGenerationZone
		);
		return enemyMinelayerGenerator;
	}

	static projectileShooterBuild(): ProjectileShooter
	{
		var propertiesToCollideWithNames = [ Playable.name ];

		var visualBuilder = VisualBuilder.Instance();

		var projectileColor = Color.Instances().Yellow

		var radius = 6;

		var projectileVisual = visualBuilder.starburstWithPointsRatioRadiusAndColor
		(
			4, .25, radius, projectileColor
		);

		var init = (entity: Entity) =>
			PlacePlanet.projectileShooterBuild_CollidableConstrainableAndDrawableWrapForEntity(entity);

		var projectileGeneration = new ProjectileGeneration
		(
			radius,
			0, // distanceInitial
			0, // speed
			100, // ticksToLive - 5 seconds
			null, // integrityMax
			propertiesToCollideWithNames,
			null, // damage
			projectileVisual,
			init,
			null // hit
		);

		var projectileGenerator =
			ProjectileGenerator.fromGeneration(projectileGeneration);

		var shooter = ProjectileShooter.fromNameAndGenerator
		(
			EnemyMinelayer.name + ProjectileShooter.name,
			projectileGenerator
		);

		shooter.collideOnlyWithEntitiesHavingPropertiesNamedSet(propertiesToCollideWithNames);

		return shooter;
	}



	static visualBuild(): Visual
	{
		var dimension = 6;

		var colors = Color.Instances();
		var colorBody = colors.Green;
		var colorLauncherPort = colors.Red;

		var visualShaft = VisualRectangle.fromSizeAndColorFill
		(
			Coords.fromXY(1.5, 1).multiplyScalar(dimension),
			colorBody
		);

		var dimensionLauncher = dimension * 1.2;

		var visualLauncherFrame =
			VisualRectangle.fromSizeAndColorFill
			(
				Coords.ones().multiplyScalar(dimensionLauncher),
				colorBody
			);

		var launcherPortRadius = dimensionLauncher * 0.4;

		var visualLauncherPort =
			VisualCircle.fromRadiusAndColorFill(launcherPortRadius, colorLauncherPort);

		var visualLauncher = VisualGroup.fromChildren
		([
			visualLauncherFrame, visualLauncherPort
		]);

		var visualLauncherOffsetLeft = VisualOffset.fromOffsetAndChild
		(
			Coords.fromXY(-1, 0).multiplyScalar(dimension),
			visualLauncher
		);

		var visualLauncherOffsetRight = VisualOffset.fromOffsetAndChild
		(
			Coords.fromXY(1, 0).multiplyScalar(dimension),
			visualLauncher
		);

		var visualShaftPlusLauncher = VisualGroup.fromChildren
		([
			visualShaft,
			visualLauncherOffsetLeft,
			visualLauncherOffsetRight
		]);

		return visualShaftPlusLauncher;
	}
}
