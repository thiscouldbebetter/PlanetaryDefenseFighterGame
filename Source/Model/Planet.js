"use strict";
class Planet extends Entity {
    constructor(size, horizonHeight) {
        super(Planet.name, [
            Drawable.fromVisual(Planet.visual(size, horizonHeight)).sizeInWrappedInstancesSet(Coords.fromXYZ(3, 1, 1)),
            Locatable.create(),
            Planet.triggerable()
        ]);
        this.horizonHeight = horizonHeight;
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
        var playerShipIsGone = (level.player() == null);
        var habitatsAreAllGone = (level.habitats().length == 0);
        var playerHasLost = playerShipIsGone
            || habitatsAreAllGone;
        return playerHasLost;
    }
    static triggerLoseReactToBeingTriggered(uwpe) {
        var universe = uwpe.universe;
        var leaderboard = Leaderboard.fromStorageHelper(universe.storageHelper);
        var leaderboardAsVenue = leaderboard.toVenue(uwpe);
        var venueMessageGameOver = VenueMessage.fromTextAndAcknowledgeNoButtons("GAME OVER", () => // acknowledge
         {
            var world = uwpe.world;
            var player = world.player;
            var statsKeeper = StatsKeeper.of(player);
            var score = statsKeeper.score();
            leaderboard.scoreInsert(score);
            universe.venueTransitionTo(leaderboardAsVenue);
        });
        var venueLayered = venueMessageGameOver.venueInner(universe);
        var venueControls = venueLayered.children[0];
        var secondsToHoldBeforeProceedingToVenueAfterGameOver = 5;
        var controlTimer = ControlTimer.fromNameSecondsToWaitAndElapsed("Advance to Next Screen Automatically", secondsToHoldBeforeProceedingToVenueAfterGameOver, () => universe.venueTransitionTo(leaderboardAsVenue));
        var container = venueControls.controlRoot;
        container.childAdd(controlTimer);
        universe.venueTransitionTo(venueMessageGameOver);
    }
    static triggerWinIsTriggered(uwpe) {
        var level = uwpe.place;
        var enemyGeneratorIsExhausted = level.enemyGenerator().exhausted();
        var enemiesAreAllGone = (level.enemies().length == 0);
        var habitatIsStillThere = (level.habitats().length > 0);
        var playerHasWon = enemyGeneratorIsExhausted
            && enemiesAreAllGone
            && habitatIsStillThere;
        return playerHasWon;
    }
    static triggerWinReactToBeingTriggered(uwpe) {
        var universe = uwpe.universe;
        var place = uwpe.place;
        var player = place.player();
        var playerStatsKeeper = StatsKeeper.of(player);
        var enemyRaidersKilled = playerStatsKeeper.kills();
        var enemyRaidersTotal = place.enemyRaidersCountInitial();
        var habitatsRemaining = place.habitats().length;
        var habitatsTotal = place.habitatsCountInitial();
        var shotsHit = playerStatsKeeper.hits();
        var shotsFired = playerStatsKeeper.shots();
        var timerTicksToComplete = place.timerTicksSoFar();
        var secondsToComplete = universe.timerHelper.ticksToSeconds(timerTicksToComplete);
        var statLengthMax = 8;
        var messageAsLines = [
            place.name + " complete!",
            "",
            "Enemies killed: " + (enemyRaidersKilled + "/" + enemyRaidersTotal).padStart(statLengthMax, " "),
            "Habitats saved: " + (habitatsRemaining + "/" + habitatsTotal).padStart(statLengthMax, " "),
            "Hits/Shots:     " + (shotsHit + "/" + shotsFired).padStart(statLengthMax, " "),
            "Seconds taken:  " + ("" + secondsToComplete).padStart(statLengthMax, " "),
            "",
            "Press Enter to start the next level."
        ];
        var newline = "\n";
        var messageAsString = messageAsLines.join(newline);
        universe.venueTransitionTo(VenueMessage.fromTextAndAcknowledgeNoButtons(messageAsString, () => // acknowledge
         {
            playerStatsKeeper.killsClear();
            playerStatsKeeper.shotsClear();
            playerStatsKeeper.hitsClear();
            var levelNextIndex = place.levelIndex + 1;
            var placeNext = PlacePlanet.fromLevelIndexAndPlayer(levelNextIndex, player);
            universe.world.placeNextSet(placeNext);
            universe.venuePrevTransitionTo();
        }));
    }
    // Visual.
    static visual(placeSize, horizonHeight) {
        var colors = Color.Instances();
        var groundNormal = VisualRectangle.fromSizeAndColorFill(Coords.fromXY(placeSize.x, horizonHeight), colors.GreenDark);
        var groundHighlighted = VisualRectangle.fromSizeAndColorFill(Coords.fromXY(placeSize.x, horizonHeight), colors.Green);
        var groundFlashing = VisualAnimation.fromTicksToHoldFramesAndFramesRepeating(10, // Half a second per frame.
        [groundNormal, groundHighlighted]);
        var groundSelectNormalOrFlashing = VisualSelect.fromSelectChildToShowAndChildren((uwpe, visualSelect) => {
            var place = uwpe.place;
            var habitats = place.habitats();
            var habitatsCount = habitats.length;
            var onlyOneHabitatRemains = (habitatsCount <= 1);
            var childIndex = onlyOneHabitatRemains ? 1 : 0;
            var childToShow = visualSelect.children[childIndex];
            return childToShow;
        }, [groundNormal, groundFlashing]);
        var groundOffset = VisualOffset.fromOffsetAndChild(Coords.fromXY(placeSize.x / 2, placeSize.y - horizonHeight / 2), groundSelectNormalOrFlashing);
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
        var visual = VisualGroup.fromChildren([
            groundOffset,
            mountainsOffset
        ]);
        return visual;
    }
}
