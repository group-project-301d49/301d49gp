DROP TABLE IF EXISTS campground;

CREATE TABLE campground (
  id SERIAL PRIMARY KEY,
  originalQuery VARCHAR(255),
  availabilityStatus VARCHAR(255),
  contractID VARCHAR(255),
  facilityID VARCHAR(255),
  facilityName VARCHAR(255),
  faciltyPhoto VARCHAR(255),
  latitude VARCHAR(255),
  longitude VARCHAR(255),
  regionName VARCHAR(255),
  reservationChannel VARCHAR(255),
  shortName VARCHAR(255),
  sitesWithAmps VARCHAR(255),
  sitesWithPetsAllowed VARCHAR(255),
  sitesWithSewerHookup VARCHAR(255),
  sitesWithWaterHookup VARCHAR(255),
  sitesWithWaterfront VARCHAR(255),
  statestate VARCHAR(255)
);