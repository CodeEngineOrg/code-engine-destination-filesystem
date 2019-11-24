"use strict";

const filesystem = require("../../");
const { assert, expect } = require("chai");
const { resolve } = require("path");

describe("Config", () => {

  it("should throw an error if called with no arguments", async () => {
    try {
      filesystem();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Invalid config: undefined. A value is required.");
    }
  });

  it("should throw an error if called with an invalid argument", async () => {
    try {
      filesystem("hello, world");
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal('Invalid config: "hello, world". Expected an object.');
    }
  });

  describe("path", () => {

    it("should allow an absolute path", async () => {
      filesystem({
        path: resolve("foo/bar/baz"),
      });
    });

    it("should allow a relative path", async () => {
      filesystem({
        path: "../foo/bar/baz",
      });
    });

    it("should throw an error if not specified", async () => {
      try {
        filesystem({});
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(TypeError);
        expect(error.message).to.equal("Invalid path: undefined. A value is required.");
      }
    });

    it("should throw an error if set to an invalid value", async () => {
      try {
        filesystem({ path: true });
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(TypeError);
        expect(error.message).to.equal("Invalid path: true. Expected a string.");
      }
    });

    it("should throw an error if set to an empty string", async () => {
      try {
        filesystem({ path: "" });
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(RangeError);
        expect(error.message).to.equal('Invalid path: "". It cannot be empty.');
      }
    });

    it("should throw an error if set to a whitespace string", async () => {
      try {
        filesystem({ path: "\r \n \t" });
        assert.fail("An error should have been thrown");
      }
      catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Invalid path: "\r \n \t". It cannot be all whitespace.');
      }
    });

  });

});
