import { intersect } from './utils';
import { random, poisson, normal } from './random';

function max<T>(candidateIndexes: number[], values: T[], score?: (v: T) => number): [number, number | T] {

    let index = -1;
    let value: T | number = -Infinity;
    candidateIndexes.forEach((i) => {
        const target = score ? score(values[i]) : values[i];

        if (value < target) {
            value = target;
            index = i;
        }
    });
    return [index, value];
}

function getNeighbors(enIndexes: number[], neighbors: number[][]): number[] {
    const ret: number[] = [];
    enIndexes.forEach((index) => {
        neighbors[index].forEach((neighborIndex) => {
            if (!enIndexes.includes(neighborIndex) && !ret.includes(neighborIndex)) {
                ret.push(neighborIndex);
            }
        });
    });
    return ret;
}

export type EchelonOptions<T> = {
    score?: (v: T) => number;
}

export type Peek = number[];

export type Foundation = {
    en: number[];
    fm: number[];
    pk: number[];
    fd: number[]
};

export type Echelon = {
    en: number[];
    ch: number[];
    len: number;
    parent: number;
    level: number;
}

export type Scan = {
    indexes: number[];
    llr: number;
    p: number;
};

export function peek<T>(values: T[], neighbors: number[][], options?: EchelonOptions<T>): Peek[] {
    const score = options?.score;

    let unsearched: number[] = Array.from({ length: values.length }, (_, i) => i);

    const ret: number[][] = [];

    while (unsearched.length > 0) {
        const [initIndex, initScore] = max(unsearched, values, score);
        let candidates = [initIndex], candidateScore = initScore;
        const candidateFamilies = [initIndex];

        let en: number[] = [];

        while (candidateFamilies.length < values.length) {
            const candidateNeighbors = getNeighbors(candidateFamilies, neighbors);
            const [nextCandidateIndex, nextCandidateScore] = max(candidateNeighbors, values, score);

            if (candidateScore < nextCandidateScore) {
                // Up
                break;
            }
            if (candidateScore === nextCandidateScore) {
                // Same
                candidates.push(nextCandidateIndex);
            } else {
                // Down
                en = [...en, ...candidates];
                candidates = [nextCandidateIndex];
                candidateScore = nextCandidateScore;
            }
            candidateFamilies.push(nextCandidateIndex);
            if (candidateFamilies.length === values.length) {
                en = [...en, ...candidates];
                candidates = [];
                break;
            }
        }

        if (en.length > 0) {
            ret.push(en);
        }

        unsearched = unsearched.filter((index) => {
            return ![...en, ...candidates].includes(index);
        });
    }

    return ret;
}

export function foundation<T>(values: T[], neighbors: number[][], peeks: Peek[], options?: EchelonOptions<T>):Foundation[] {
    const score = options?.score;
    let unsearchedNode = Array.from({ length: values.length }, (_, i) => i);
    let unsearchedPeek = Array.from({ length: peeks.length }, (_, i) => i);
    const flatPeek = peeks.reduce((previousValue, currentValue) => [...previousValue, ...currentValue], []);
    unsearchedNode = unsearchedNode.filter((index) => {
        return !flatPeek.includes(index);
    });

    const ret: Foundation[] = [];
    while (unsearchedNode.length > 0) {
        let en: number[] = [], fm: number[] = [];
        const pk: number[] = [], fd: number[] = [];
        const [initIndex, initScore] = max(unsearchedNode, values, score);
        let candidates = [initIndex], candidateScore = initScore, candidateFamilies = [initIndex];
        let initStage = true;

        while (candidateFamilies.length < values.length) {
            let candidateNeighbors = getNeighbors(candidateFamilies, neighbors)
            if (initStage) {
                while (candidateNeighbors.length > 0) {
                    let foundChild = false;
                    const foundationLength = ret.length;
                    for (let foundationIndex = 0; foundationIndex < foundationLength; foundationIndex++){
                        const index = foundationLength - 1 - foundationIndex;
                        const { fm } = ret[index];
                        if (intersect(fm, candidateNeighbors) && !intersect(fm, candidateFamilies)) {
                            foundChild = true;
                            fd.push(index);
                            candidateFamilies = [...candidateFamilies, ...fm];
                        }
                    }

                    unsearchedPeek.forEach((peekIndex) => {
                        const peek = peeks[peekIndex];
                        if (intersect(peek, candidateNeighbors)) {
                            foundChild = true;
                            pk.push(peekIndex);
                            candidateFamilies = [...candidateFamilies, ...peek];
                        }
                    });
                    if (!foundChild) break;
                    candidateNeighbors = getNeighbors(candidateFamilies, neighbors);
                }
            }
            if (candidateNeighbors.length === 0) {
                // filled
                en = [...candidates];
                fm = [...candidates];
                break;
            } else {
                const [nextCandidateIndex, nextCandidateScore] = max(candidateNeighbors, values, score);

                if (candidateScore < nextCandidateScore) {
                    // Up
                    break;
                }
                if (candidateScore === nextCandidateScore) {
                    // Same
                    candidates.push(nextCandidateIndex);
                } else {
                    // Down
                    en = [...en, ...candidates];
                    fm = [...candidateFamilies];
        
                    candidates = [nextCandidateIndex];
                    candidateScore = nextCandidateScore;
                    initStage = false;
                }
                candidateFamilies.push(nextCandidateIndex);
                if (candidateFamilies.length === values.length) {
                    en = [...en, ...candidates];
                    fm = [...candidateFamilies];
                    break;
                }
            }
        }
        unsearchedNode = unsearchedNode.filter((index) => {
            return !fm.includes(index);
        });
        unsearchedPeek = unsearchedPeek.filter((index) => {
            return !pk.includes(index);
        });

        ret.push({
            en, fm, pk, fd
        });
    }
    return ret;
}

export function echelon<T>(values: T[], neighbors: number[][], options?: EchelonOptions<T>): Echelon[] {
    const score = options?.score;
    const peeks = peek(values, neighbors, options);
    const foundations = foundation(values, neighbors, peeks, options);
    const ret: Echelon[] = peeks.map((peek) => {
        return { en: peek, ch: [], len: -1, parent: -1, level: -1 };
    });
    
    foundations.forEach(foundation => {
        const ch = [...foundation.pk, ...foundation.fd.map((index) => {
            return index + peeks.length
        })];
        ch.sort(function (a, b) {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });

        ret.push({
            en: [...foundation.en],
            ch, len: -1,
            parent: -1,
            level: -1
        });
    });

    const root = ret[ret.length - 1];
    root.level = 0;
    let maxScore: number | T = -Infinity, minScore: number | T = Infinity;
    root.en.forEach((index) => {
        const enScore = score ? score(values[index]) : values[index];
        if (maxScore < enScore)
            maxScore = enScore;
        
        if (minScore > enScore)
            minScore = enScore;
    });
    root.len = maxScore - minScore;

    fillProperties(ret.length - 1, maxScore, ret, values, options);

    return ret;
}

function fillProperties<T>(parentIndex: number, parentScore: number, echelons: Echelon[], values: T[], options?: EchelonOptions<T>) {
    const score = options?.score;
    const parent = echelons[parentIndex];

    parent.ch.forEach(childIndex => {
        const child = echelons[childIndex];
        child.parent = parentIndex;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let childScore: any = -Infinity
        child.en.forEach((index) => {
            const enScore = score ? score(values[index]) : values[index];
            if (childScore < enScore)
                childScore = enScore;
        });
        child.len = childScore - parentScore;
        child.level = parent.level + 1;
        if (child.ch.length > 0) {
            fillProperties(childIndex, childScore, echelons, values, options);
        }
    });
}


export function offspring(index: number, echelons: Echelon[], level=-1):number[] {
    const root = echelons[index];
    let ret: number[] = [];
    if (level >= 0) ret = [...root.en];

    root.ch.forEach((childIndex) => {
            ret = [...ret, ...offspring(childIndex, echelons, level + 1)];
    });
    return ret;
}

export function scanNormalDistribution(cases: number[], echelons: Echelon[],
    options: {
        limitWindow?: number;
        mcIter?: number;
        prng?: () => number;
    }
): Scan[] {
    /*
      References
      ----------
      Scan statistic for continuous data based on the normal probability model
      October 2009 International Journal of Health Geographics 8:58
      Auhtors: Martin Kulldorff, Lan Huang, Kevin Konty
    */
    const limitWindow = options?.limitWindow ? options.limitWindow : 20;
    const mcIter = options?.mcIter ? options.mcIter : 999;
    const pr = options?.prng ? options.prng : random();

    let total = 0;
    cases.forEach((v) => {
        total += v;
    });

    const N = cases.length;
    const mean = total / N;
    const variance = cases.reduce((prev, value) => {
        return prev + (value - mean) ** 2;
    }, 0) / N;
    const deviation = Math.sqrt(variance);

    const llr = (window: number[], sampleCases: number[]): number => {        
        let caseDispersion = 0, windowVariance=0, windowTotal = 0;
        for (let i = 0; i < sampleCases.length; i++) {
            caseDispersion += (sampleCases[i] - mean) ** 2;
            windowVariance += sampleCases[i] ** 2;

            if (window.includes(i)) {
                windowTotal += sampleCases[i];
            }
        }

        const windowNumber = window.length;
        const windowMean = windowTotal / windowNumber;
        const otherTotal = total - windowTotal;
        const otherNumber = N - windowNumber;
        const otherMean = otherTotal / otherNumber;

        if (windowMean < otherMean) return 0;

        windowVariance += (-2 * windowTotal * windowMean + window.length * windowMean ** 2
            - 2 * otherTotal * otherMean + otherNumber * otherMean ** 2);
        windowVariance /= N;

        return N * Math.log(deviation) + 0.5 * caseDispersion / variance - 0.5 * N  - 0.5 * N * Math.log(windowVariance);
    };

    const windows: {
        indexes: number[];
        llr: number;
    }[] = [];
    let reachedLimit = false;
    for (let i = 0; i < echelons.length; i++) {
        const target = echelons[i];
        const prev = [];
        offspring(i, echelons).forEach((index) => {
            prev.push(index);
        });
        for (let j = 0; j < target.en.length; j++) {
            prev.push(target.en[j]);
            const indexes = [...prev];
            windows.push({
                indexes,
                llr: llr(indexes, cases)
            });

            if (windows.length > limitWindow) {
                reachedLimit = true;
                break;
            }
        }
        if (reachedLimit) break;
    }
    windows.sort(function (a, b) {
        if (a.llr > b.llr) return -1;
        if (a.llr < b.llr) return 1;
        return 0;
    });

    let checked:number[] = [];
    const candidates = windows.filter((window) => {
        if (!intersect(window.indexes, checked)) {
            checked = [...checked, ...window.indexes];
            return true;
        }
        return false;
    });

    const montecarlos:number[] = [];

    for (let i = 0; i < mcIter; i++) {
        const randamized = cases.map(() => {
            return normal(mean, deviation, { prng: pr })
        });
        let maxLLR = 0;
        windows.forEach((window) => {
            const v = llr(window.indexes, randamized);
            if (maxLLR < v) maxLLR = v;
        });
        montecarlos.push(maxLLR);
    }
    montecarlos.sort(function (a, b) {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
    });

    const ret: Scan[] = [];
    candidates.forEach((window) => {
        let r = 1;
        for (let i = 0; i < montecarlos.length; i++) {
            if (window.llr > montecarlos[i]) break;
            r++;
        }
        const p = r / (1 + mcIter);

        ret.push({
            ...window,
            p
        });

    });
    return ret;
}

export function scanPoissonDistribution(population: number[], cases: number[], expectations: number[], echelons: Echelon[],
    options: {
        limitRate?: number;
        mcIter?: number;
        prng?: () => number;
    }
): Scan[] {
   /*
      References
      ----------
      Breast Cancer Clusters in the Northeast United States: A Geographic Analysis
      Am J Epidemiol. 1997 Jul 15;146(2):161-70.
      Auhtors: M Kulldorff, E J Feuer, B A Miller, L S Freedman
    */
    const limitRate = options?.limitRate ? options.limitRate : 0.5;
    const mcIter = options?.mcIter ? options.mcIter : 999;
    const pr = options?.prng ? options.prng : random();


    let totalPopulation = 0;
    population.forEach((v) => {
        totalPopulation += v;
    });

    let totalCase = 0;
    cases.forEach((v) => {
        totalCase += v;
    });

    const llr = (window: number[], sampleCases: number[], expectations: number[]): number => {
        let windowCase = 0, windowExpectation = 0;
        for (let i = 0; i < sampleCases.length; i++) {
            if (window.includes(i)) {
                windowCase += sampleCases[i];
            }
        }
        for (let i = 0; i < expectations.length; i++) {
            if (window.includes(i)) {
                windowExpectation += expectations[i];
            }
        }

        if (windowCase < windowExpectation) return 0;

        return windowCase * Math.log(windowCase / windowExpectation) +
            (totalCase - windowCase) * Math.log((totalCase - windowCase) / (totalCase - windowExpectation));
    };


    const windows: {
        indexes: number[];
        llr: number;
    }[] = [];
    let reachedLimit = false;
    for (let i = 0; i < echelons.length; i++) {
        const target = echelons[i];
        let familyTotal = 0;
        const prev = [];
        offspring(i, echelons).forEach((index) => {
            familyTotal += population[index];
            prev.push(index);
        });
        for (let j = 0; j < target.en.length; j++) {
            familyTotal += population[target.en[j]];
            prev.push(target.en[j]);
            const indexes = [...prev];
            windows.push({
                indexes,
                llr: llr(indexes, cases, expectations)
            });

            if (familyTotal > totalPopulation * limitRate) {
                reachedLimit = true;
                break;
            }
        }
        if (reachedLimit) break;
    }
    windows.sort(function (a, b) {
        if (a.llr > b.llr) return -1;
        if (a.llr < b.llr) return 1;
        return 0;
    });

    let checked:number[] = [];
    const candidates = windows.filter((window) => {
        if (!intersect(window.indexes, checked)) {
            checked = [...checked, ...window.indexes];
            return true;
        }
        return false;
    });

    const montecarlos:number[] = [];

    for (let i = 0; i < mcIter; i++) {
        const randamized = expectations.map((ex) => {
            return poisson(ex, { prng: pr })
        });
        let maxLLR = 0;
        windows.forEach((window) => {
            const v = llr(window.indexes, randamized, expectations);
            if (maxLLR < v) maxLLR = v;
        });
        montecarlos.push(maxLLR);
    }
    montecarlos.sort(function (a, b) {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
    });

    const ret: Scan[] = [];
    candidates.forEach((window) => {
        let r = 1;
        for (let i = 0; i < montecarlos.length; i++) {
            if (window.llr > montecarlos[i]) break;
            r++;
        }
        const p = r / (1 + mcIter);

        ret.push({
            ...window,
            p
        });

    });
    return ret;
}