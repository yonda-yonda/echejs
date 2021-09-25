
const fs = require("fs");
const path = require("path");

const {
    intersect,
    line,
    grid,
} = require("../dist/utils.js");

const {
    random,
    poisson,
    normal
} = require("../dist/random.js");

const {
    peek,
    echelon,
    offspring,
    scanPoissonDistribution,
    scanNormalDistribution
} = require("../dist/echelon.js");

const prefectures = require("../src/prefectures.json");
const tokyoSmrs = require("../src/tokyo_smr.json");
const tokyoContinuousValues = require("../src/tokyo_continuous_values.json");
const tokyoWards = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../src/tokyo_wards.geojson"), "utf8")
);

const lineValues1 = [
    1, 2, 3, 4, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 5, 6, 7, 6, 5, 4, 3, 2, 1, 2, 1
];
const lineValues2 = [
    1, 1, 1, 2, 1, 1, 1, 1, 1
];
const lineValues3 = [
    1, 1, 1, 2, 1, 1, 1, 2, 1
];
const lineValues4 = [
    1, 1, 1, 2, 2, 1, 1, 1, 1
];
const lineValues5 = {
    values: [
        {
            denominator: 10,
            numerator: 2
        }, {
            denominator: 10,
            numerator: 1
        }, {
            denominator: 20,
            numerator: 2
        }, {
            denominator: 10,
            numerator: 2
        }, {
            denominator: 10,
            numerator: 1
        },
    ],
    score: (v) => {
        return v.numerator / v.denominator;
    },
};
const lineValues6 = [
    1, 1, 1, 2, 1, 1, 1, 1, 0
];

const lineValues7 = [
    1, 1, 1, 2, 1, 0, 1, 1, 1
];

const gridValues = [
    [2, 8, 24, 5, 3],
    [1, 10, 14, 22, 15],
    [4, 21, 19, 23, 25],
    [16, 20, 12, 11, 17],
    [13, 6, 9, 7, 18]
];

const populationDensity = [
    69, 136, 84, 321, 88, 121, 139, 478, 308, 310, 1913, 1207, 6169, 3778,
    183, 251, 276, 188, 187, 155, 191, 476, 1447, 315, 352, 566, 4640, 659,
    370, 204, 164, 104, 270, 335, 230, 182, 520, 244, 103, 1023, 341, 333,
    241, 184, 143, 179, 628
];

const japanPopulations = prefectures.map((prefecture, i) => {
    return {
        ...prefecture,
        "value": populationDensity[i]
    }
})

it("peek", () => {
    console.log(line(lineValues1.length))
    expect(peek(lineValues1, line(lineValues1.length))).toEqual(
        [
            [16, 15, 17], [13], [6, 5, 7], [3], [23]
        ]
    );

    expect(peek(lineValues2, line(lineValues2.length))).toEqual(
        [
            [3, 2, 4, 1, 5, 0, 6, 7, 8]
        ]
    );

    expect(peek(lineValues3, line(lineValues3.length))).toEqual(
        [
            [3], [7]
        ]
    );

    expect(peek(lineValues4, line(lineValues4.length), {
    })).toEqual(
        [[3, 4, 2, 5, 1, 6, 0, 7, 8]]
    );

    expect(peek(lineValues5.values, line(lineValues5.values.length), {
        score: lineValues5.score
    })).toEqual(
        [[0],[3]]
    );

    expect(peek(lineValues6, line(lineValues6.length))).toEqual(
        [[3, 2, 4, 1, 5, 0, 6, 7, 8]]
    );

    expect(peek(gridValues.flat(), grid(gridValues.length, gridValues[0].length))).toEqual(
        [[14, 13, 8], [2], [11, 16], [24]]
    );

});

it("echelon", () => {
    expect(echelon(lineValues1, line(lineValues1.length))).toEqual(
        [
          { en: [ 16, 15, 17 ], ch: [], len: 2, parent: 5, level: 3 },
          { en: [ 13 ], ch: [], len: 1, parent: 5, level: 3 },
          { en: [ 6, 5, 7 ], ch: [], len: 2, parent: 6, level: 3 },
          { en: [ 3 ], ch: [], len: 1, parent: 6, level: 3 },
          { en: [ 23 ], ch: [], len: 1, parent: 8, level: 1 },
          {
            en: [
              12, 14, 18, 11,
              19, 10, 20
            ],
            ch: [ 0, 1 ],
            len: 3,
            parent: 7,
            level: 2
          },
          { en: [ 2, 4, 8 ], ch: [ 2, 3 ], len: 1, parent: 7, level: 2 },
          { en: [ 1, 9, 21 ], ch: [ 5, 6 ], len: 1, parent: 8, level: 1 },
          { en: [ 0, 22, 24 ], ch: [ 4, 7 ], len: 0, parent: -1, level: 0 }
        ]
    );

    expect(echelon(lineValues2, line(lineValues2.length))).toEqual(
        [
            { "ch": [], "en": [3, 2, 4, 1, 5, 0, 6, 7, 8], "len": 1, "level": 0, "parent": -1 }
        ]
    );

    expect(echelon(lineValues3, line(lineValues3.length))).toEqual(
        [
            { "ch": [], "en": [3], "len": 1, "level": 1, "parent": 2 },
            { "ch": [], "en": [7], "len": 1, "level": 1, "parent": 2 },
            { "ch": [0, 1], "en": [0, 1, 2, 4, 5, 6, 8], "len": 0, "level": 0, "parent": -1 }
        ]
    );

    expect(echelon(gridValues.flat(), grid(gridValues.length, gridValues[0].length))).toEqual(
        [
          { en: [ 14, 13, 8 ], ch: [], len: 6, parent: 4, level: 3 },
          { en: [ 2 ], ch: [], len: 10, parent: 6, level: 1 },
          { en: [ 11, 16 ], ch: [], len: 2, parent: 4, level: 3 },
          { en: [ 24 ], ch: [], len: 1, parent: 5, level: 2 },
          { en: [ 12 ], ch: [ 0, 2 ], len: 2, parent: 5, level: 2 },
          { en: [ 19, 15, 9 ], ch: [ 3, 4 ], len: 3, parent: 6, level: 1 },
          {
            en: [
              7, 20, 17, 18,  6, 22,
              1, 23, 21,  3, 10,  4,
              0,  5
            ],
            ch: [ 1, 5 ],
            len: 13,
            parent: -1,
            level: 0
          }
        ]
    );

    expect(echelon(lineValues6, line(lineValues6.length))).toEqual(
        [
            { "ch": [], "en": [3, 2, 4, 1, 5, 0, 6, 7, 8], "len": 2, "level": 0, "parent": -1 }
        ]
    );

    expect(echelon(lineValues7, line(lineValues7.length))).toEqual(
        [
            { "ch": [], "en": [3, 2, 4, 1, 0], "len": 2, "level": 1, "parent": 2 },
            { "ch": [], "en": [6, 7, 8], "len": 1, "level": 1, "parent": 2 },
            { "ch": [0, 1], "en": [5], "len": 0, "level": 0, "parent": -1 }
        ]
    );

    expect(
        echelon(
            japanPopulations.map((population) => {
                return population.value
            }),
            japanPopulations.map((population) => {
                return population.neighbor
            })
        )
    ).toEqual(
        [
            { "ch": [], "en": [12, 13, 10, 11, 7], "len": 5693, "level": 8, "parent": 10 },
            { "ch": [], "en": [26, 27, 25, 28, 24], "len": 4325, "level": 7, "parent": 11 },
            { "ch": [], "en": [22], "len": 971, "level": 8, "parent": 10 },
            { "ch": [], "en": [39, 40, 41, 42], "len": 793, "level": 5, "parent": 13 },
            { "ch": [], "en": [46], "len": 449, "level": 3, "parent": 15 },
            { "ch": [], "en": [36], "len": 250, "level": 6, "parent": 12 },
            { "ch": [], "en": [33], "len": 65, "level": 6, "parent": 12 },
            { "ch": [], "en": [3], "len": 182, "level": 2, "parent": 16 },
            { "ch": [], "en": [16, 15], "len": 85, "level": 4, "parent": 14 },
            { "ch": [], "en": [1], "len": 48, "level": 1, "parent": 17 },
            { "ch": [0, 2], "en": [21], "len": 161, "level": 7, "parent": 11 },
            { "ch": [1, 10], "en": [23, 9, 8], "len": 45, "level": 6, "parent": 12 },
            { "ch": [5, 6, 11], "en": [32, 37], "len": 40, "level": 5, "parent": 13 },
            { "ch": [3, 12], "en": [34, 29], "len": 39, "level": 4, "parent": 14 },
            { "ch": [8, 13], "en": [20, 17, 18, 43, 14, 35], "len": 12, "level": 3, "parent": 15 },
            { "ch": [4, 14], "en": [45, 30, 19, 44], "len": 40, "level": 2, "parent": 16 },
            { "ch": [7, 15], "en": [6, 5, 31, 38], "len": 51, "level": 1, "parent": 17 },
            { "ch": [9, 16], "en": [4, 2, 0], "len": 19, "level": 0, "parent": -1 }
        ]
    );

    expect(
        echelon(
            tokyoSmrs.map((smr) => {
                return smr.o / smr.e
            }),
            tokyoWards.features.map((ward) => {
                return ward.properties.neighbor
            })
        )
    ).toEqual(
        [
            
            { "ch": [], "en": [21, 20], "len": 0.26090070040648294, "level": 3, "parent": 4 },
            { "ch": [], "en": [19, 18, 15], "len": 0.13189307060882283, "level": 3, "parent": 4 },
            { "ch": [], "en": [5], "len": 0.11355371038998141, "level": 1, "parent": 6 },
            { "ch": [], "en": [12], "len": 0.006593519011173221, "level": 2, "parent": 5 },
            { "ch": [0, 1], "en": [16], "len": 0.04522784206257702, "level": 2, "parent": 5 },
            { "ch": [3, 4], "en": [13, 22], "len": 0.03805214044554184, "level": 1, "parent": 6 },
            { "ch": [2, 5], "en": [17, 11, 14, 8, 9, 10, 1, 6, 7, 3, 0, 4, 2], "len": 0.4343382428343452, "level": 0, "parent": -1 }
        ]
    );
});

it("offspring", () => {
    expect(offspring(7, echelon(lineValues1, line(lineValues1.length)))).toEqual(
        [12, 14, 18, 11, 19, 10, 20, 16, 15, 17, 13, 2, 4, 8, 6, 5, 7, 3]
    );
});

it("scanPoissonDistribution", () => {
    const echelons = echelon(
        tokyoSmrs.map((v) => {
            return v.o / v.e
        }),
        tokyoWards.features.map((ward) => {
            return ward.properties.neighbor
        })
    );

    const prng = random('scanPoissonDistribution');

    expect(scanPoissonDistribution(
        tokyoSmrs.map((v) => {
            return v.n
        }),
        tokyoSmrs.map((v) => {
            return v.o
        }),
        tokyoSmrs.map((v) => {
            return v.e
        }),
        echelons,
        {
            prng 
        }
    )).toEqual(
        [
            { "indexes": [21, 20, 19, 18, 15, 16], "llr": 23.352611055749918, "p": 0.001 },
            { "indexes": [5], "llr": 0.1640465997933367, "p": 0.847 },
            { "indexes": [12], "llr": 0, "p": 1 }
        ]
    )
});

it("scanNormalDistribution", () => {
    const prng = random('scanNormalDistribution');

    const echelons = echelon(
        tokyoContinuousValues,
        tokyoWards.features.map((ward) => {
            return ward.properties.neighbor
        })
    );
    expect(scanNormalDistribution(
        tokyoContinuousValues,
        echelons,
        {
            prng
        }
    )).toEqual(
        [
            { indexes: [14, 13, 15, 11], llr: 31.388780431899846, p: 0.038 },
            { indexes: [7], llr: 0.0004849928315877605, p: 0.356 },
            { indexes: [21], llr: 0.00035081996617236655, p: 0.356 }
        ]
    )
});