const { emptyValueChecker } = require("../app.js");

describe("Mongodb name validation", () => {
  test("To check if entered value is a valid string", () => {
    expect(emptyValueChecker("sfd")).toEqual(true);
  });

  test("To check if entered value is an empty string", () => {
    expect(emptyValueChecker(" ")).toEqual(false);
  });
});