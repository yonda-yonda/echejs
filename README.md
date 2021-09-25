# echejs

JavaScript Library for Echelon Scan.

reference: [エシェロン解析―階層化して視る時空間データ―](https://www.kyoritsu-pub.co.jp/bookdetail/9784320112704)

## sample
### echelon
```Javascript
const echelons = echelon(
    [
        1, 2, 3, 4, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 5, 6, 7, 6, 5, 4, 3, 2, 1, 2, 1
    ],
    [
        [ 1 ], [ 0, 2 ], [ 1, 3 ], [ 2, 4 ], [ 3, 5 ],  [ 4, 6 ], [ 5, 7 ], 
        [ 6, 8 ], [ 7, 9 ], [ 8, 10 ], [ 9, 11 ], [ 10, 12 ], [ 11, 13 ], 
        [ 12, 14 ], [ 13, 15 ], [ 14, 16 ], [ 15, 17 ], [ 16, 18 ], [ 17, 19 ], 
        [ 18, 20 ], [ 19, 21 ], [ 20, 22 ], [ 21, 23 ], [ 22, 24 ], [ 23 ]
    ]
);
console.log(echelons);
// [
//   { en: [ 16, 15, 17 ], ch: [], len: 2, parent: 5, level: 3 },
//   { en: [ 13 ], ch: [], len: 1, parent: 5, level: 3 },
//   { en: [ 6, 5, 7 ], ch: [], len: 2, parent: 6, level: 3 },
//   { en: [ 3 ], ch: [], len: 1, parent: 6, level: 3 },
//   { en: [ 23 ], ch: [], len: 1, parent: 8, level: 1 },
//   {
//     en: [ 12, 14, 18, 11, 19, 10, 20], ch: [ 0, 1 ],
//     len: 3, parent: 7, level: 2
//   },
//   { en: [ 2, 4, 8 ], ch: [ 2, 3 ], len: 1, parent: 7, level: 2 },
//   { en: [ 1, 9, 21 ], ch: [ 5, 6 ], len: 1, parent: 8, level: 1 },
//   { en: [ 0, 22, 24 ], ch: [ 4, 7 ], len: 0, parent: -1, level: 0 }
// ]
```

### offspring
```Javascript
const offsprings = offspring(7, echelons);
console.log(offsprings);
// [12, 14, 18, 11, 19, 10, 20, 16, 15, 17, 13, 2, 4, 8, 6, 5, 7, 3]
```


### scanPoissonDistribution
```Javascript
const tokyoSmrs = require("./src/tokyo_smr.json");
const tokyoWards = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "./src/tokyo_wards.geojson"), "utf8")
);

const echelons = echelon(
    tokyoSmrs.map((v) => {
        return v.o / v.e
    }),
    tokyoWards.features.map((ward) => {
        return ward.properties.neighbor
    })
);
const scaned = scanPoissonDistribution(
    tokyoSmrs.map((v) => {
        return v.n
    }),
    tokyoSmrs.map((v) => {
        return v.o
    }),
    tokyoSmrs.map((v) => {
        return v.e
    }),
    echelons
);
console.log(scaned);
// [
//     { "indexes": [21, 20, 19, 18, 15, 16], "llr": 23.352611055749918, "p": 0.001 },
//     { "indexes": [5], "llr": 0.1640465997933367, "p": 0.847 },
//     { "indexes": [12], "llr": 0, "p": 1 }
// ]
```


### scanNormalDistribution
```Javascript
const tokyoContinuousValues = require("./src/tokyo_continuous_values.json");
const tokyoWards = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "./src/tokyo_wards.geojson"), "utf8")
);
const echelons = echelon(
    tokyoContinuousValues,
    tokyoWards.features.map((ward) => {
        return ward.properties.neighbor
    })
);
scanNormalDistribution(
    tokyoContinuousValues,
    echelons
);
// [
//     { indexes: [14, 13, 15, 11], llr: 31.388780431899846, p: 0.038 },
//     { indexes: [7], llr: 0.0004849928315877605, p: 0.356 },
//     { indexes: [21], llr: 0.00035081996617236655, p: 0.356 }
// ]
```

### with Openlayers
* [sample1](https://yonda-yonda.github.io/echejs/docs/sample1.html)
* [sample2](https://yonda-yonda.github.io/echejs/docs/sample2.html)