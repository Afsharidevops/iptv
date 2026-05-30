import type * as Location from '$lib/types/location'

export class LocationService {
  locations = new Map<string, Location.Type>()

  constructor(rawLocations: Location.RawLocation[]) {
    this.locations = new Map(rawLocations.map(location => [location.code, location]))
  }

  getLocation(code: string): Location.Type | undefined {
    return this.locations.get(code)
  }
}
