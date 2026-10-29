const { test } = require("node:test");
const assert = require("node:assert/strict");
const cases = require("../../api-specs/password-policy-cases.json");
const { getPasswordRequirements, isStrongPassword } = require("../node_modules/.password-tests/passwordPolicy.js");

for (const [index, fixture] of cases.entries()) {
  test(`shared backend/frontend password policy case ${index + 1}`, () => {
    assert.equal(isStrongPassword(fixture.password), fixture.valid);
  });
}

test("every requirement starts unmet and updates independently", () => {
  assert.equal(getPasswordRequirements("").filter(rule => rule.met).length, 0);
  const actual = Object.fromEntries(getPasswordRequirements("Abcdefgh").map(rule => [rule.id, rule.met]));
  assert.deepEqual(actual, { length: true, uppercase: true, lowercase: true, number: false, special: false });
  assert.equal(getPasswordRequirements("Abcdefg1").find(rule => rule.id === "number").met, true);
  assert.equal(getPasswordRequirements("Abcdefg!").find(rule => rule.id === "special").met, true);
});
