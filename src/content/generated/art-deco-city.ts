import type { AssetPack, WorldTemplate } from '../../engine/contracts/world';

export const generatedPack: AssetPack = {
  "id": "art-deco-city-pack",
  "version": 1,
  "compatibility": {
    "provides": [
      "urban",
      "night",
      "historical",
      "art-deco",
      "elevated-transit"
    ]
  },
  "style": {
    "guide": "/assets/art-deco-city-pack/v1/style-guide.png",
    "palette": {
      "sky": 530219,
      "shadow": 658450,
      "navy": 1122102,
      "teal": 1589053,
      "burgundy": 5906220,
      "brass": 13017435,
      "amber": 15910509
    },
    "outline": {
      "color": 658450,
      "relativeWeight": 0.01
    },
    "detail": "medium",
    "groundAnchor": "bottom-center"
  },
  "assets": [
    {
      "id": "adc-sky",
      "source": "/assets/art-deco-city-pack/v1/runtime/sky.png",
      "metadata": {
        "role": "sky",
        "bakedMovingObjects": false,
        "opaque": true,
        "seamlessWidth": 1983,
        "overlapPx": 2
      }
    },
    {
      "id": "adc-city",
      "source": "/assets/art-deco-city-pack/v1/runtime/city.png",
      "metadata": {
        "role": "mid-background",
        "bakedMovingObjects": false,
        "seamlessWidth": 3358,
        "overlapPx": 2
      }
    },
    {
      "id": "adc-street",
      "source": "/assets/art-deco-city-pack/v1/runtime/street.png",
      "metadata": {
        "role": "street",
        "bakedMovingObjects": false,
        "opaque": true,
        "seamlessWidth": 650,
        "overlapPx": 2
      }
    },
    {
      "id": "adc-movie-palace",
      "source": "/assets/art-deco-city-pack/v1/runtime/movie-palace.png",
      "metadata": {
        "role": "architecture",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-department-store",
      "source": "/assets/art-deco-city-pack/v1/runtime/department-store.png",
      "metadata": {
        "role": "architecture",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-bank",
      "source": "/assets/art-deco-city-pack/v1/runtime/bank.png",
      "metadata": {
        "role": "architecture",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-jazz-club",
      "source": "/assets/art-deco-city-pack/v1/runtime/jazz-club.png",
      "metadata": {
        "role": "architecture",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-hotel",
      "source": "/assets/art-deco-city-pack/v1/runtime/hotel.png",
      "metadata": {
        "role": "architecture",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-apartments",
      "source": "/assets/art-deco-city-pack/v1/runtime/apartments.png",
      "metadata": {
        "role": "architecture",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-terminal",
      "source": "/assets/art-deco-city-pack/v1/runtime/terminal.png",
      "metadata": {
        "role": "architecture",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-civic-hall",
      "source": "/assets/art-deco-city-pack/v1/runtime/civic-hall.png",
      "metadata": {
        "role": "architecture",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-sedan",
      "source": "/assets/art-deco-city-pack/v1/runtime/sedan.png",
      "metadata": {
        "role": "vehicle",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-taxi",
      "source": "/assets/art-deco-city-pack/v1/runtime/taxi.png",
      "metadata": {
        "role": "vehicle",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-elevated-train",
      "source": "/assets/art-deco-city-pack/v1/runtime/elevated-train.png",
      "metadata": {
        "role": "vehicle",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-zeppelin",
      "source": "/assets/art-deco-city-pack/v1/runtime/zeppelin.png",
      "metadata": {
        "role": "ambient-flight",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-woman",
      "source": "/assets/art-deco-city-pack/v1/runtime/woman.png",
      "metadata": {
        "role": "inhabitant",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-man",
      "source": "/assets/art-deco-city-pack/v1/runtime/man.png",
      "metadata": {
        "role": "inhabitant",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-street-lamp",
      "source": "/assets/art-deco-city-pack/v1/runtime/street-lamp.png",
      "metadata": {
        "role": "street-prop",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-newsstand",
      "source": "/assets/art-deco-city-pack/v1/runtime/newsstand.png",
      "metadata": {
        "role": "street-prop",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-rooftop-sentinel",
      "source": "/assets/art-deco-city-pack/v1/runtime/rooftop-sentinel.png",
      "metadata": {
        "role": "rare-event",
        "bakedMovingObjects": false
      }
    },
    {
      "id": "adc-night-signal",
      "source": "/assets/art-deco-city-pack/v1/runtime/night-signal.png",
      "metadata": {
        "role": "rare-event",
        "bakedMovingObjects": false
      }
    }
  ],
  "recipes": [
    {
      "id": "movie-palace",
      "asset": "adc-movie-palace",
      "role": "landmark",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "architecture",
        "grounded"
      ]
    },
    {
      "id": "department-store",
      "asset": "adc-department-store",
      "role": "building",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "architecture",
        "grounded"
      ]
    },
    {
      "id": "bank",
      "asset": "adc-bank",
      "role": "building",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "architecture",
        "grounded"
      ]
    },
    {
      "id": "jazz-club",
      "asset": "adc-jazz-club",
      "role": "building",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "architecture",
        "grounded"
      ]
    },
    {
      "id": "hotel",
      "asset": "adc-hotel",
      "role": "building",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "architecture",
        "grounded"
      ]
    },
    {
      "id": "apartments",
      "asset": "adc-apartments",
      "role": "building",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "architecture",
        "grounded"
      ]
    },
    {
      "id": "terminal",
      "asset": "adc-terminal",
      "role": "building",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "architecture",
        "grounded"
      ]
    },
    {
      "id": "civic-hall",
      "asset": "adc-civic-hall",
      "role": "building",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "architecture",
        "grounded"
      ]
    },
    {
      "id": "woman",
      "asset": "adc-woman",
      "role": "inhabitant",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "worldHeight": 100,
      "tags": [
        "grounded",
        "stationary"
      ]
    },
    {
      "id": "man",
      "asset": "adc-man",
      "role": "inhabitant",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "worldHeight": 100,
      "tags": [
        "grounded",
        "stationary"
      ]
    },
    {
      "id": "sedan",
      "asset": "adc-sedan",
      "role": "traffic",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "directions": [
        "left"
      ],
      "tags": [
        "grounded",
        "street",
        "near-lane"
      ]
    },
    {
      "id": "taxi",
      "asset": "adc-taxi",
      "role": "traffic",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "directions": [
        "right"
      ],
      "tags": [
        "grounded",
        "street",
        "far-lane"
      ]
    },
    {
      "id": "elevated-train",
      "asset": "adc-elevated-train",
      "role": "ambient-traffic",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "directions": [
        "right"
      ],
      "tags": [
        "airborne",
        "transit"
      ]
    },
    {
      "id": "zeppelin",
      "asset": "adc-zeppelin",
      "role": "ambient-traffic",
      "anchor": {
        "x": 0.5,
        "y": 0.5
      },
      "directions": [
        "left"
      ],
      "tags": [
        "airborne",
        "rare-event"
      ]
    },
    {
      "id": "rooftop-sentinel",
      "asset": "adc-rooftop-sentinel",
      "role": "rare-event",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "tags": [
        "stationary",
        "rare-event"
      ]
    },
    {
      "id": "night-signal",
      "asset": "adc-night-signal",
      "role": "rare-event",
      "anchor": {
        "x": 0.5,
        "y": 0.5
      },
      "tags": [
        "stationary",
        "rare-event"
      ]
    }
  ]
};

export const generatedWorld: WorldTemplate = {
  "id": "art-deco-city",
  "name": "1920s Art Deco City",
  "version": 1,
  "designProfile": "silhouette-screensaver",
  "layout": {
    "id": "dense-urban-street",
    "tags": [
      "urban",
      "street",
      "elevated-transit"
    ],
    "groundY": 610,
    "chunkHeight": 720
  },
  "camera": {
    "autoScrollSpeed": 25,
    "inputSpeed": 320
  },
  "themes": [
    "art-deco",
    "late-1920s",
    "night"
  ],
  "assetPacks": [
    "art-deco-city-pack"
  ],
  "palette": {
    "sky": 530219,
    "city": 1122102,
    "ground": 658450,
    "amber": 15910509
  },
  "backgrounds": [
    {
      "id": "adc-night-sky",
      "asset": "adc-sky",
      "depth": -120,
      "parallax": 0.015,
      "y": 396.5,
      "spacing": 1983
    },
    {
      "id": "adc-distant-city",
      "asset": "adc-city",
      "depth": -80,
      "parallax": 0.08,
      "y": 400,
      "spacing": 3358
    },
    {
      "id": "adc-continuous-street",
      "asset": "adc-street",
      "depth": 0,
      "parallax": 1,
      "y": 740,
      "spacing": 650
    }
  ],
  "entities": [
    {
      "id": "adc-movie-palace",
      "asset": "adc-movie-palace",
      "depth": 8,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "architecture"
        ]
      }
    },
    {
      "id": "adc-department-store",
      "asset": "adc-department-store",
      "depth": 8,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "architecture"
        ]
      }
    },
    {
      "id": "adc-bank",
      "asset": "adc-bank",
      "depth": 8,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "architecture"
        ]
      }
    },
    {
      "id": "adc-jazz-club",
      "asset": "adc-jazz-club",
      "depth": 8,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "architecture"
        ]
      }
    },
    {
      "id": "adc-hotel",
      "asset": "adc-hotel",
      "depth": 8,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "architecture"
        ]
      }
    },
    {
      "id": "adc-apartments",
      "asset": "adc-apartments",
      "depth": 8,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "architecture"
        ]
      }
    },
    {
      "id": "adc-terminal",
      "asset": "adc-terminal",
      "depth": 8,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "architecture"
        ]
      }
    },
    {
      "id": "adc-civic-hall",
      "asset": "adc-civic-hall",
      "depth": 8,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "architecture"
        ]
      }
    },
    {
      "id": "adc-woman",
      "asset": "adc-woman",
      "depth": 14,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "stationary"
        ]
      }
    },
    {
      "id": "adc-man",
      "asset": "adc-man",
      "depth": 14,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "stationary"
        ]
      }
    },
    {
      "id": "adc-street-lamp",
      "asset": "adc-street-lamp",
      "depth": 13,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "street-prop"
        ]
      }
    },
    {
      "id": "adc-newsstand",
      "asset": "adc-newsstand",
      "depth": 13,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "grounded",
          "street-prop"
        ]
      }
    },
    {
      "id": "adc-sedan-left",
      "asset": "adc-sedan",
      "depth": 40,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "pathFollower": {
          "path": "adc-near-lane",
          "speed": {
            "min": 46,
            "max": 55
          },
          "direction": -1
        },
        "tags": [
          "grounded",
          "traffic"
        ]
      }
    },
    {
      "id": "adc-taxi-right",
      "asset": "adc-taxi",
      "depth": 30,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "pathFollower": {
          "path": "adc-far-lane",
          "speed": {
            "min": 38,
            "max": 47
          },
          "direction": 1
        },
        "tags": [
          "grounded",
          "traffic"
        ]
      }
    },
    {
      "id": "adc-train-right",
      "asset": "adc-elevated-train",
      "depth": -12,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "pathFollower": {
          "path": "adc-elevated-line",
          "speed": {
            "min": 31,
            "max": 38
          },
          "direction": 1
        },
        "tags": [
          "traffic",
          "airborne",
          "transit"
        ]
      }
    },
    {
      "id": "adc-zeppelin-left",
      "asset": "adc-zeppelin",
      "depth": -45,
      "anchor": {
        "x": 0.5,
        "y": 0.5
      },
      "components": {
        "pathFollower": {
          "path": "adc-high-sky",
          "speed": {
            "min": 13,
            "max": 19
          },
          "direction": -1
        },
        "tags": [
          "traffic",
          "airborne",
          "rare-event"
        ]
      }
    },
    {
      "id": "adc-rooftop-sentinel",
      "asset": "adc-rooftop-sentinel",
      "depth": -4,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "components": {
        "tags": [
          "stationary",
          "rare-event"
        ]
      }
    },
    {
      "id": "adc-night-signal",
      "asset": "adc-night-signal",
      "depth": -55,
      "anchor": {
        "x": 0.5,
        "y": 0.5
      },
      "components": {
        "tags": [
          "stationary",
          "rare-event"
        ]
      }
    }
  ],
  "animations": [],
  "chunks": [
    {
      "id": "adc-palace-row",
      "width": 620,
      "objects": [
        {
          "entity": "adc-movie-palace",
          "x": 310,
          "y": 610
        },
        {
          "entity": "adc-street-lamp",
          "x": 598,
          "y": 610
        }
      ]
    },
    {
      "id": "adc-store-row",
      "width": 480,
      "objects": [
        {
          "entity": "adc-department-store",
          "x": 240,
          "y": 610
        },
        {
          "entity": "adc-woman",
          "x": 452,
          "y": 610
        }
      ]
    },
    {
      "id": "adc-bank-row",
      "width": 570,
      "objects": [
        {
          "entity": "adc-bank",
          "x": 285,
          "y": 610
        },
        {
          "entity": "adc-street-lamp",
          "x": 548,
          "y": 610
        }
      ]
    },
    {
      "id": "adc-jazz-row",
      "width": 440,
      "objects": [
        {
          "entity": "adc-jazz-club",
          "x": 220,
          "y": 610
        },
        {
          "entity": "adc-man",
          "x": 410,
          "y": 610
        }
      ]
    },
    {
      "id": "adc-hotel-row",
      "width": 860,
      "objects": [
        {
          "entity": "adc-hotel",
          "x": 430,
          "y": 610
        },
        {
          "entity": "adc-street-lamp",
          "x": 838,
          "y": 610
        }
      ]
    },
    {
      "id": "adc-apartment-row",
      "width": 660,
      "objects": [
        {
          "entity": "adc-apartments",
          "x": 330,
          "y": 610
        },
        {
          "entity": "adc-newsstand",
          "x": 620,
          "y": 610
        }
      ]
    },
    {
      "id": "adc-terminal-row",
      "width": 525,
      "objects": [
        {
          "entity": "adc-terminal",
          "x": 262.5,
          "y": 610
        },
        {
          "entity": "adc-woman",
          "x": 495,
          "y": 610
        }
      ]
    },
    {
      "id": "adc-civic-row",
      "width": 600,
      "objects": [
        {
          "entity": "adc-civic-hall",
          "x": 300,
          "y": 610
        },
        {
          "entity": "adc-man",
          "x": 565,
          "y": 610
        }
      ]
    }
  ],
  "chunkPlan": {
    "mode": "authored",
    "sequence": [
      "adc-palace-row",
      "adc-store-row",
      "adc-bank-row",
      "adc-jazz-row",
      "adc-hotel-row",
      "adc-apartment-row",
      "adc-terminal-row",
      "adc-civic-row"
    ],
    "repeat": true
  },
  "paths": [
    {
      "id": "adc-far-lane",
      "y": 650,
      "xPadding": 160,
      "zone": "ground",
      "distance": "mid"
    },
    {
      "id": "adc-near-lane",
      "y": 705,
      "xPadding": 180,
      "zone": "ground",
      "distance": "near"
    },
    {
      "id": "adc-elevated-line",
      "y": 405,
      "xPadding": 220,
      "zone": "sky",
      "distance": "mid"
    },
    {
      "id": "adc-high-sky",
      "y": 180,
      "xPadding": 180,
      "zone": "sky",
      "distance": "far"
    }
  ],
  "traffic": [
    {
      "id": "adc-far-traffic",
      "path": "adc-far-lane",
      "entities": [
        "adc-taxi-right"
      ],
      "intervalMs": {
        "min": 11000,
        "max": 16500
      },
      "initialDelayMs": {
        "min": 900,
        "max": 2200
      },
      "maxActive": 1,
      "maxActivePerDirection": 1
    },
    {
      "id": "adc-near-traffic",
      "path": "adc-near-lane",
      "entities": [
        "adc-sedan-left"
      ],
      "intervalMs": {
        "min": 12000,
        "max": 18000
      },
      "initialDelayMs": {
        "min": 2600,
        "max": 4300
      },
      "maxActive": 1,
      "maxActivePerDirection": 1
    },
    {
      "id": "adc-elevated-traffic",
      "path": "adc-elevated-line",
      "entities": [
        "adc-train-right"
      ],
      "intervalMs": {
        "min": 18000,
        "max": 28000
      },
      "initialDelayMs": {
        "min": 5000,
        "max": 8500
      },
      "maxActive": 1,
      "maxActivePerDirection": 1
    },
    {
      "id": "adc-zeppelin-traffic",
      "path": "adc-high-sky",
      "entities": [
        "adc-zeppelin-left"
      ],
      "intervalMs": {
        "min": 42000,
        "max": 68000
      },
      "initialDelayMs": {
        "min": 12000,
        "max": 19000
      },
      "maxActive": 1,
      "maxActivePerDirection": 1
    }
  ],
  "clock": {
    "startHour": 21,
    "realSecondsPerWorldHour": 75,
    "loopHours": 24
  },
  "environments": [
    {
      "id": "night",
      "sky": [
        530219,
        1122102
      ],
      "ambientTint": 16777215
    },
    {
      "id": "late-night",
      "sky": [
        329748,
        724534
      ],
      "ambientTint": 14476271,
      "overlay": {
        "color": 2644616,
        "alpha": 0.05
      }
    }
  ],
  "initialEnvironment": "night",
  "weather": [
    {
      "id": "clear"
    }
  ],
  "initialWeather": "clear",
  "events": [
    {
      "id": "adc-night-watch",
      "everyWorldHours": 1.5,
      "cooldownWorldHours": 0.4,
      "chance": 0.45,
      "rare": true,
      "actions": [
        {
          "type": "start-sequence",
          "sequence": "adc-night-watch-appearance"
        }
      ]
    }
  ],
  "triggers": [],
  "motionPaths": [
    {
      "id": "adc-sentinel-stationary",
      "type": "stationary",
      "point": {
        "x": 1480,
        "y": 385,
        "z": 30
      }
    },
    {
      "id": "adc-signal-stationary",
      "type": "stationary",
      "point": {
        "x": 1490,
        "y": 205,
        "z": -80
      }
    }
  ],
  "sequences": [
    {
      "id": "adc-night-watch-appearance",
      "cooldownMs": 90000,
      "steps": [
        {
          "actions": [
            {
              "type": "spawn",
              "entity": "adc-rooftop-sentinel",
              "at": {
                "x": 1480,
                "y": 385,
                "z": 30
              },
              "as": "adc-active-sentinel"
            },
            {
              "type": "spawn",
              "entity": "adc-night-signal",
              "at": {
                "x": 1490,
                "y": 205,
                "z": -80
              },
              "as": "adc-active-signal"
            },
            {
              "type": "follow-path",
              "target": "adc-active-sentinel",
              "follower": {
                "path": "adc-sentinel-stationary",
                "cameraRelative": true
              }
            },
            {
              "type": "follow-path",
              "target": "adc-active-signal",
              "follower": {
                "path": "adc-signal-stationary",
                "cameraRelative": true
              }
            }
          ]
        },
        {
          "afterMs": 9000,
          "actions": [
            {
              "type": "despawn",
              "target": "adc-active-sentinel"
            },
            {
              "type": "despawn",
              "target": "adc-active-signal"
            }
          ]
        }
      ]
    }
  ],
  "pools": [
    {
      "id": "adc-sedan-pool",
      "entity": "adc-sedan-left",
      "initialSize": 1,
      "maxSize": 1
    },
    {
      "id": "adc-taxi-pool",
      "entity": "adc-taxi-right",
      "initialSize": 1,
      "maxSize": 1
    },
    {
      "id": "adc-train-pool",
      "entity": "adc-train-right",
      "initialSize": 1,
      "maxSize": 1
    },
    {
      "id": "adc-zeppelin-pool",
      "entity": "adc-zeppelin-left",
      "initialSize": 1,
      "maxSize": 1
    }
  ],
  "offscreen": {
    "sleepMargin": 260,
    "suspendAnimation": true,
    "suspendParticles": true,
    "keepLogicalTime": true
  },
  "compositionRules": {
    "chunks": {
      "minimumRepeatGap": 4
    },
    "entities": {
      "minimumSpacing": [
        {
          "tag": "traffic",
          "distance": 300
        }
      ],
      "maxVisible": [
        {
          "tag": "traffic",
          "count": 4
        },
        {
          "tag": "rare-event",
          "count": 1
        }
      ]
    }
  },
  "director": {
    "maxActivity": 4,
    "trafficCost": 1,
    "sequenceCost": 2,
    "particlesPerActivity": 20,
    "rareEventSpacingWorldHours": 3,
    "eventCosts": {
      "adc-night-watch": 2
    }
  },
  "performanceBudget": {
    "targetFps": 60,
    "maxDrawCalls": 180,
    "maxTriangles": 8000,
    "maxTextureMemoryMb": 256,
    "maxActiveEntities": 120,
    "targetResolutions": [
      [
        1920,
        1080
      ],
      [
        2560,
        1440
      ],
      [
        3840,
        2160
      ]
    ]
  },
  "metadata": {
    "description": "A restrained late-1920s Art Deco city screensaver with period road, elevated rail, and skyline traffic.",
    "styleGuide": "/assets/art-deco-city-pack/v1/style-guide.png"
  }
};

export const generatedId = 'artDecoCity';
