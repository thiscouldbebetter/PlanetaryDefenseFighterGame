
class CameraTests extends TestFixture
{
	constructor()
	{
		super(CameraTests.name);
	}

	tests(): Test[]
	{
		var returnValues =
		[
			this.cameraAtRightEdgeCanSeeDrawableAtLeftEdge
		].map(x => Test.fromRun(x) );

		return returnValues;
	}

	// Tests.

	cameraAtRightEdgeCanSeeDrawableAtLeftEdge(): void
	{
		var viewSize = Coords.fromXY(400, 300);
		var sizeToWrapTo = viewSize.clone().multiply(Coords.fromXY(2, 1) );
		var sizeInWrappedInstances = Coords.fromXYZ(3, 1, 1);

		var colliderCamera = ShapeWrapped.fromSizeInWrappedInstancesSizeToWrapToAndChild
		(
			sizeInWrappedInstances,
			sizeToWrapTo,
			BoxAxisAligned.fromSize(viewSize)
		).toShapeGroupAny();
		var colliderDrawable = ShapeWrapped.fromSizeInWrappedInstancesSizeToWrapToAndChild
		(
			sizeInWrappedInstances,
			sizeToWrapTo,
			Sphere.fromRadius(4)
		).toShapeGroupAny();

		var collidableCamera = Collidable.fromCollider(colliderCamera);
		var collidableDrawable = Collidable.fromCollider(colliderDrawable);

		var offsetFromEdge = Coords.fromXY(20, 0);
		var locatableCamera = Locatable.fromPos(offsetFromEdge.clone() );
		var locatableDrawable =
			Locatable.fromPos(sizeToWrapTo.clone().subtract(offsetFromEdge) );

		var entityCamera = Entity.fromNameAndProperties
		(
			Camera.name, [ collidableCamera, locatableCamera ]
		);
		var entityDrawable = Entity.fromNameAndProperties
		(
			Drawable.name, [ collidableDrawable, locatableDrawable ]
		);

		collidableCamera.colliderLocateForEntity(entityCamera);
		collidableDrawable.colliderLocateForEntity(entityDrawable);

		var collisionHelper = CollisionHelper.create();

		//var entitiesCameraAndDrawableCollide =
			Collidable.doEntitiesCollide(entityCamera, entityDrawable, collisionHelper);
		
		// Assert.isTrue(entitiesCameraAndDrawableCollide);
	}

}