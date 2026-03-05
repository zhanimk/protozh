package com.example;

import java.util.Map;

public class Tournament {

    private String id;
    private String name;
    private String date;
    private Map<String, Draw> draws;

    // Getters and setters

    public static class Draw {
        private Match[] matches;
        private Match[] repechageMatches;

        // Getters and setters
    }

    public static class Match {
        private String id;
        private int round;
        private Athlete athlete1;
        private Athlete athlete2;
        private Athlete winner;
        private Athlete loser;

        // Getters and setters
    }

    public static class Athlete {
        private String id;
        private String name;
        private boolean isPlaceholder;
        private String winnerOfMatchId;

        // Getters and setters
    }
}
