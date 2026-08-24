import type { AssetPack } from '../../engine/contracts/world';

const ROOT = '/assets/coruscant/v1/runtime';

export const coruscantV1Pack: AssetPack = {
  id: 'coruscant-v1',
  version: 1,
  compatibility: {
    provides: ['science-fiction', 'urban', 'aerial-city', 'blue-hour', 'platform-layout'],
    excludes: ['medieval'],
  },
  style: {
    guide: '/assets/coruscant/v1/master-panorama-style-guide.png',
    palette: {
      sky: 0x101f61,
      shadow: 0x080b24,
      indigo: 0x18265b,
      violet: 0x49428e,
      cyan: 0x43d7ef,
      amber: 0xffb45c,
      coral: 0xff6c61,
    },
    outline: { color: 0x080b24, relativeWeight: 0.01 },
    detail: 'medium',
    groundAnchor: 'bottom-center',
  },
  assets: [
    { id: 'coruscant-sky', source: `${ROOT}/sky-seamless-v1.png`, metadata: { role: 'sky', opaque: true, seamlessWidth: 1983 } },
    { id: 'coruscant-far-skyline', source: `${ROOT}/far-skyline-seamless-v1.png`, metadata: { role: 'far-background', seamlessWidth: 1983 } },
    { id: 'coruscant-far-skyline-base', source: `${ROOT}/far-skyline-base-v1.png`, metadata: { role: 'far-background-base', seamlessWidth: 1983 } },
    { id: 'coruscant-mid-city', source: `${ROOT}/mid-city-seamless-v1.png`, metadata: { role: 'mid-background', seamlessWidth: 1983 } },
    { id: 'coruscant-transit-platform', source: `${ROOT}/transit-platform.png`, metadata: { role: 'ground-surface', tileSize: [1983, 218] } },
    { id: 'coruscant-transit-platform-compact', source: `${ROOT}/transit-platform-compact-seamless-v1.png`, metadata: { role: 'ground-surface', tileSize: [1983, 155], compact: true, seamlessWidth: 1983 } },
    { id: 'coruscant-transit-street-band', source: `${ROOT}/transit-street-band-v1.png`, metadata: { role: 'ground-surface', tileSize: [1983, 110], compact: true, seamlessWidth: 1983 } },
    { id: 'coruscant-lower-ground-fill', primitive: { kind: 'rect', width: 64, height: 512, color: 0x080b24 }, metadata: { role: 'lower-ground-fill' } },

    { id: 'coruscant-council-rotunda', source: `${ROOT}/council-rotunda.png`, metadata: { role: 'landmark', variant: 'civic' } },
    { id: 'coruscant-residential-needle', source: `${ROOT}/residential-needle.png`, metadata: { role: 'architecture', variant: 'residential' } },
    { id: 'coruscant-transit-exchange', source: `${ROOT}/transit-exchange.png`, metadata: { role: 'architecture', variant: 'transit' } },
    { id: 'coruscant-garden-residence', source: `${ROOT}/garden-residence.png`, metadata: { role: 'architecture', variant: 'garden' } },
    { id: 'coruscant-data-archive', source: `${ROOT}/data-archive.png`, metadata: { role: 'architecture', variant: 'data' } },
    { id: 'coruscant-diplomatic-cylinder', source: `${ROOT}/diplomatic-cylinder.png`, metadata: { role: 'architecture', variant: 'diplomatic' } },
    { id: 'coruscant-hotel-crown', source: `${ROOT}/hotel-crown.png`, metadata: { role: 'architecture', variant: 'hospitality' } },
    { id: 'coruscant-utility-megablock', source: `${ROOT}/utility-megablock.png`, metadata: { role: 'architecture', variant: 'utility' } },

    { id: 'coruscant-commuter-speeder', source: `${ROOT}/commuter-speeder.png`, metadata: { role: 'aerial-traffic', capacity: 2 } },
    { id: 'coruscant-passenger-shuttle', source: `${ROOT}/passenger-shuttle.png`, metadata: { role: 'aerial-traffic', capacity: 8 } },
    { id: 'coruscant-maintenance-drone', source: `${ROOT}/maintenance-drone.png`, metadata: { role: 'ambient-flight' } },
    { id: 'coruscant-twin-wing-interceptor', source: `${ROOT}/twin-wing-interceptor.png`, metadata: { role: 'rare-flyby', class: 'interceptor' } },
    { id: 'coruscant-cross-wing-starfighter', source: `${ROOT}/cross-wing-starfighter.png`, metadata: { role: 'rare-flyby', class: 'starfighter' } },

    { id: 'coruscant-civilian', source: `${ROOT}/civilian.png`, metadata: { role: 'inhabitant', variant: 'civilian' } },
    { id: 'coruscant-technician', source: `${ROOT}/technician.png`, metadata: { role: 'inhabitant', variant: 'technician' } },
    { id: 'coruscant-alien-diplomat', source: `${ROOT}/alien-diplomat.png`, metadata: { role: 'inhabitant', variant: 'diplomat' } },
    { id: 'coruscant-service-droid', source: `${ROOT}/service-droid.png`, metadata: { role: 'inhabitant', variant: 'service-droid' } },
    { id: 'coruscant-astromech-droid', source: `${ROOT}/astromech-droid-rolling-v2.png`, metadata: { role: 'ground-traffic', variant: 'dome-utility-travel', tools: 'stowed' } },
    { id: 'coruscant-protocol-android', source: `${ROOT}/protocol-android-polished-v1.png`, metadata: { role: 'inhabitant', variant: 'protocol-polished', finish: 'shiny-gold' } },
    { id: 'coruscant-armored-patrol', source: `${ROOT}/armored-patrol.png`, metadata: { role: 'inhabitant-group', count: 4 } },

    { id: 'coruscant-info-kiosk', source: `${ROOT}/info-kiosk.png`, metadata: { role: 'platform-prop' } },
    { id: 'coruscant-alien-planter', source: `${ROOT}/alien-planter.png`, metadata: { role: 'platform-prop' } },
    { id: 'coruscant-lane-beacon', source: `${ROOT}/lane-beacon.png`, metadata: { role: 'platform-prop' } },
  ],
  recipes: [
    { id: 'landmark-council-rotunda', asset: 'coruscant-council-rotunda', role: 'landmark', anchor: { x: 0.5, y: 1 }, worldHeight: 430, tags: ['architecture', 'grounded', 'civic'] },
    { id: 'building-residential-needle', asset: 'coruscant-residential-needle', role: 'building', anchor: { x: 0.5, y: 1 }, worldHeight: 620, tags: ['architecture', 'grounded', 'residential'] },
    { id: 'building-transit-exchange', asset: 'coruscant-transit-exchange', role: 'building', anchor: { x: 0.5, y: 1 }, worldHeight: 460, tags: ['architecture', 'grounded', 'transit'] },
    { id: 'building-garden-residence', asset: 'coruscant-garden-residence', role: 'building', anchor: { x: 0.5, y: 1 }, worldHeight: 520, tags: ['architecture', 'grounded', 'residential'] },
    { id: 'building-data-archive', asset: 'coruscant-data-archive', role: 'building', anchor: { x: 0.5, y: 1 }, worldHeight: 500, tags: ['architecture', 'grounded', 'data'] },
    { id: 'building-diplomatic-cylinder', asset: 'coruscant-diplomatic-cylinder', role: 'building', anchor: { x: 0.5, y: 1 }, worldHeight: 520, tags: ['architecture', 'grounded', 'diplomatic'] },
    { id: 'building-hotel-crown', asset: 'coruscant-hotel-crown', role: 'building', anchor: { x: 0.5, y: 1 }, worldHeight: 650, tags: ['architecture', 'grounded', 'hospitality'] },
    { id: 'building-utility-megablock', asset: 'coruscant-utility-megablock', role: 'building', anchor: { x: 0.5, y: 1 }, worldHeight: 520, tags: ['architecture', 'grounded', 'utility'] },

    { id: 'traffic-commuter-speeder', asset: 'coruscant-commuter-speeder', role: 'ambient-traffic', anchor: { x: 0.5, y: 0.5 }, worldHeight: 58, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'civilian', 'fast'] },
    { id: 'traffic-passenger-shuttle', asset: 'coruscant-passenger-shuttle', role: 'ambient-traffic', anchor: { x: 0.5, y: 0.5 }, worldHeight: 86, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'transit'] },
    { id: 'ambient-maintenance-drone', asset: 'coruscant-maintenance-drone', role: 'ambient-traffic', anchor: { x: 0.5, y: 0.5 }, worldHeight: 46, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'maintenance'] },
    { id: 'rare-twin-wing-interceptor', asset: 'coruscant-twin-wing-interceptor', role: 'rare-event', anchor: { x: 0.5, y: 0.5 }, worldHeight: 54, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'high-altitude', 'fast', 'rare'] },
    { id: 'rare-cross-wing-starfighter', asset: 'coruscant-cross-wing-starfighter', role: 'rare-event', anchor: { x: 0.5, y: 0.5 }, worldHeight: 56, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'high-altitude', 'fast', 'rare'] },

    { id: 'inhabitant-civilian', asset: 'coruscant-civilian', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 108, tags: ['grounded', 'stationary', 'civilian'] },
    { id: 'inhabitant-technician', asset: 'coruscant-technician', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 108, tags: ['grounded', 'stationary', 'technician'] },
    { id: 'inhabitant-alien-diplomat', asset: 'coruscant-alien-diplomat', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 108, tags: ['grounded', 'stationary', 'diplomatic'] },
    { id: 'inhabitant-service-droid', asset: 'coruscant-service-droid', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 108, tags: ['grounded', 'stationary', 'service-droid'] },
    { id: 'inhabitant-astromech-droid', asset: 'coruscant-astromech-droid', role: 'ground-traffic', anchor: { x: 0.5, y: 1 }, worldHeight: 108, directions: ['right'], angles: ['level'], tags: ['grounded', 'mobile', 'astromech', 'tools-stowed'] },
    { id: 'inhabitant-protocol-android', asset: 'coruscant-protocol-android', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 108, tags: ['grounded', 'stationary', 'protocol'] },
    { id: 'inhabitant-armored-patrol', asset: 'coruscant-armored-patrol', role: 'inhabitant-group', anchor: { x: 0.5, y: 1 }, worldHeight: 108, tags: ['grounded', 'stationary', 'security', 'group'] },

    { id: 'prop-info-kiosk', asset: 'coruscant-info-kiosk', role: 'prop', anchor: { x: 0.5, y: 1 }, worldHeight: 132, tags: ['grounded', 'information'] },
    { id: 'prop-alien-planter', asset: 'coruscant-alien-planter', role: 'prop', anchor: { x: 0.5, y: 1 }, worldHeight: 88, tags: ['grounded', 'vegetation'] },
    { id: 'prop-lane-beacon', asset: 'coruscant-lane-beacon', role: 'prop', anchor: { x: 0.5, y: 1 }, worldHeight: 120, tags: ['grounded', 'traffic-control'] },
  ],
};
