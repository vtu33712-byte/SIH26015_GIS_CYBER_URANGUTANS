export const formatCoordinates = ([latitude, longitude]: [number, number]) => `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
export const titleCase = (value: string) => value.replace(/[_-]/g, ' ').replace(/\b\w/g, character => character.toUpperCase())
