/**
 * Appends REQUEST async action type
 */

export const REQUEST = (actionType: string) => `${actionType}_REQUEST`.toString();

/**
 * Appends SUCCESS async action type
 */

export const SUCCESS = (actionType: string) => `${actionType}_SUCCESS`;

/**
 * Appends FAILURE async action type
 */

export const FAILURE = (actionType: string) => `${actionType}_FAILED`;

/**
 * Appends FAILURE async action type
 */

export const CLEAN = (actionType: string) => `${actionType}_CLEAN`;
