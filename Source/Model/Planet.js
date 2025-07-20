"use strict";
class Planet extends Entity {
    constructor(size, horizonHeight) {
        super(Planet.name, [
            Drawable.fromVisual(Planet.visual(size, horizonHeight)).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1)),
            Locatable.create(),
            Planet.triggerable()
        ]);
    }
    static fromSizeAndHorizonHeight(size, horizonHeight) {
        return new Planet(size, horizonHeight);
    }
    // Triggerable.
    static triggerable() {
        var triggerLose = Trigger.fromNameIsTriggeredAndReactToBeingTriggered("Lose", this.triggerLoseIsTriggered, this.triggerLoseReactToBeingTriggered);
        var triggerWin = Trigger.fromNameIsTriggeredAndReactToBeingTriggered("Win", this.triggerWinIsTriggered, this.triggerWinReactToBeingTriggered);
        return Triggerable.fromTriggers([
            triggerLose,
            triggerWin
        ]);
    }
    static triggerLoseIsTriggered(uwpe) {
        var level = uwpe.place;
        var habitatsAreAllGone = (level.habitats().length == 0);
        return habitatsAreAllGone;
    }
    static triggerLoseReactToBeingTriggered(uwpe) {
        var universe = uwpe.universe;
        universe.venueTransitionTo(VenueMessage.fromTextAndAcknowledge("You lose!", () => // acknowledge
         {
            universe.venueTransitionTo(universe.controlBuilder.title(universe, universe.display.sizeInPixels).toVenue());
        }));
    }
    static triggerWinIsTriggered(uwpe) {
        var level = uwpe.place;
        var raiderGeneratorIsExhausted = level.raiderGenerator().exhausted();
        var raidersAreAllGone = (level.raiders().length == 0);
        var habitatIsStillThere = (level.habitats().length > 0);
        var playerHasWon = raiderGeneratorIsExhausted
            && raidersAreAllGone
            && habitatIsStillThere;
        return playerHasWon;
    }
    static triggerWinReactToBeingTriggered(uwpe) {
        var universe = uwpe.universe;
        universe.venueTransitionTo(VenueMessage.fromTextAndAcknowledgeNoButtons("You win!", () => // acknowledge
         {
            universe.venueTransitionTo(universe.controlBuilder.title(universe, universe.display.sizeInPixels).toVenue());
        }));
    }
    // Visual.
    static visual(placeSize, horizonHeight) {
        var colors = Color.Instances();
        var ground = VisualRectangle.fromSizeAndColorFill(Coords.fromXY(placeSize.x, horizonHeight), colors.GreenDark);
        var groundOffset = VisualOffset.fromOffsetAndChild(Coords.fromXY(placeSize.x / 2, placeSize.y - horizonHeight / 2), ground);
        var mountainSegmentCount = 8;
        var mountainSegmentWidth = placeSize.x / mountainSegmentCount;
        var mountainHeightAboveHorizonMax = horizonHeight;
        var mountainPathPoints = new Array();
        for (var x = 0; x < mountainSegmentCount; x++) {
            var mountainHeightAboveHorizon = Math.random() * mountainHeightAboveHorizonMax;
            var mountainPathPoint = Coords.fromXY(x * mountainSegmentWidth, 0 - mountainHeightAboveHorizon);
            mountainPathPoints.push(mountainPathPoint);
        }
        mountainPathPoints.push(Coords.fromXY(placeSize.x, mountainPathPoints[0].y));
        var mountainsAsPath = Path.fromPoints(mountainPathPoints);
        var mountains = VisualPath.fromPathColorAndThicknessOpen(mountainsAsPath, colors.Brown, 1 // thickness
        );
        var mountainsOffset = VisualOffset.fromOffsetAndChild(Coords.fromXY(0, placeSize.y - horizonHeight), mountains);
        var visual = VisualGroup.fromNameAndChildren("Planet", [
            groundOffset,
            mountainsOffset
        ]);
        return visual;
    }
}
