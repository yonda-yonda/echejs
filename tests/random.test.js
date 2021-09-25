const {
    random,
    poisson,
    normal,
} = require("../dist/random.js");

it("poisson", () => {
    const prng = random('poisson');
    expect(poisson(10, {prng})).toBe(12);
    expect(poisson(10, {prng})).toBe(7);
    expect(poisson(10, {prng})).toBe(12);
    expect(poisson(10, {prng})).toBe(6);
});

it("normal", () => {
    const prng = random('normal');
    expect(normal(0, 1, {prng})).toBe(-1.120242702822045);
    expect(normal(0, 1, {prng})).toBe(-0.4547830254774732);
    expect(normal(0, 1, {prng})).toBe(1.0408766777381142);
    expect(normal(0, 1, {prng})).toBe(1.8187966425061102);
});
