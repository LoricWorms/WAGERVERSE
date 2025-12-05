// src/lib/constants.ts

/**
 * The default odds assigned to a team when a new match is created.
 */
export const DEFAULT_ODDS = 2.00;

/**
 * The initial balance given to a new user upon registration.
 */
export const STARTING_BALANCE = 1000;

/**
 * Validation constants for team creation form.
 */
export const TEAM_NAME_MIN_LENGTH = 2;
export const TEAM_TAG_MIN_LENGTH = 2;
export const TEAM_TAG_MAX_LENGTH = 5;
export const FOUNDATION_YEAR_MIN = 1900;

/**
 * Validation constants for match creation form.
 */
export const MATCH_FORMAT_MIN_LENGTH = 2;
export const ODDS_MIN_VALUE = 1.01;

/**
 * The number of items to display per page in paginated lists.
 */
export const PAGE_SIZE = 10;
