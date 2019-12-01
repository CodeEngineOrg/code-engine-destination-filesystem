"use strict";

const filesystem = require("../../");
const CodeEngine = require("@code-engine/lib");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");
const { join } = require("path");
const { promises: fs } = require("fs");

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

describe("Filesystem Destination plugin", () => {

  it("should write files to the output directory", async () => {
    let dir = await createDir();

    let source = {
      read () {
        return [
          { path: "file1.txt", text: "Hello, world!" },
          { path: "file2.html", text: "<h1>Hello, world!</h1>" },
          { path: "file3.jpg", contents: Buffer.from([72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33]) },
        ];
      }
    };

    let destination = filesystem({
      path: dir,
      filter: undefined,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();

    // Make sure the output directory contains exactly what we expect
    expect(dir).to.have.deep.files([
      "file1.txt",
      "file2.html",
      "file3.jpg",
    ]);

    // Check the contents of each file
    expect(await fs.readFile(join(dir, "file1.txt"), "utf8")).to.equal("Hello, world!");
    expect(await fs.readFile(join(dir, "file2.html"), "utf8")).to.equal("<h1>Hello, world!</h1>");
    expect(await fs.readFile(join(dir, "file3.jpg"), "utf8")).to.equal("Hello, world!");
  });

  it("should write files to sub-directories", async () => {
    let dir = await createDir();

    let source = {
      read () {
        return [
          { path: "subdir/file1.txt", text: "Hello, world!" },
          { path: "sub/dir/file2.html", text: "<h1>Hello, world!</h1>" },
          { path: "deep/sub/dir/file3.jpg", contents: Buffer.from([72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33]) },
        ];
      }
    };

    let destination = filesystem({
      path: dir,
      filter: undefined,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();

    // Make sure the output directory contains exactly what we expect
    expect(dir).to.have.deep.files([
      "subdir/file1.txt",
      "sub/dir/file2.html",
      "deep/sub/dir/file3.jpg",
    ]);

    // Check the contents of each file
    expect(await fs.readFile(join(dir, "subdir/file1.txt"), "utf8")).to.equal("Hello, world!");
    expect(await fs.readFile(join(dir, "sub/dir/file2.html"), "utf8")).to.equal("<h1>Hello, world!</h1>");
    expect(await fs.readFile(join(dir, "deep/sub/dir/file3.jpg"), "utf8")).to.equal("Hello, world!");
  });

  it("should write empty files", async () => {
    let dir = await createDir();

    let source = {
      read () {
        return [
          { path: "file1.txt" },
          { path: "file2.html", text: "" },
          { path: "file3.jpg", contents: Buffer.alloc(0) },
        ];
      }
    };

    let destination = filesystem({
      path: dir,
      filter: undefined,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();

    // Make sure the output directory contains exactly what we expect
    expect(dir).to.have.deep.files([
      "file1.txt",
      "file2.html",
      "file3.jpg",
    ]);

    // Check the contents of each file
    expect(await fs.readFile(join(dir, "file1.txt"))).to.deep.equal(Buffer.alloc(0));
    expect(await fs.readFile(join(dir, "file2.html"))).to.deep.equal(Buffer.alloc(0));
    expect(await fs.readFile(join(dir, "file3.jpg"))).to.deep.equal(Buffer.alloc(0));
  });

  it("should write dotfiles", async () => {
    let dir = await createDir();

    let source = {
      read () {
        return [
          { path: ".gitignore", text: "*.log" },
          { path: "package/.npmrc", text: "registry=npmjs.org" },
          { path: "package/.eslintrc", text: "extends: eslint/recommended" },
        ];
      }
    };

    let destination = filesystem({
      path: dir,
      filter: undefined,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();

    // Make sure the output directory contains exactly what we expect
    expect(dir).to.have.deep.files([
      ".gitignore",
      "package/.npmrc",
      "package/.eslintrc",
    ]);

    // Check the contents of each file
    expect(await fs.readFile(join(dir, ".gitignore"), "utf8")).to.equal("*.log");
    expect(await fs.readFile(join(dir, "package/.npmrc"), "utf8")).to.equal("registry=npmjs.org");
    expect(await fs.readFile(join(dir, "package/.eslintrc"), "utf8")).to.equal("extends: eslint/recommended");
  });

  it("should write very large text files", async function () {
    // Increase the timeout to allow time for filling, writing, & reading such large strings
    this.timeout(60000);
    console.log("\n    NOTE: This test takes a while...");

    let dir = await createDir();

    let bigText = "A".repeat(100 * MB);

    let source = {
      read () {
        return [
          { path: "file", text: bigText },
        ];
      }
    };

    let destination = filesystem({
      path: dir,
      filter: undefined,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();

    let actualText = await fs.readFile(join(dir, "file"), "utf8");
    expect(actualText).to.have.lengthOf(100 * MB);
    expect(actualText).to.equal(bigText);
  });

  it("should write very large binary files", async function () {
    // Increase the timeout to allow time for filling, writing, & reading such large arrays
    this.timeout(60000);
    console.log("\n    NOTE: This test takes a while...");

    let dir = await createDir();

    let bigBinary = Buffer.from(new Uint8Array(1 * GB).fill(1));

    let source = {
      read () {
        return [
          { path: "file", contents: bigBinary },
        ];
      }
    };

    let destination = filesystem({
      path: dir,
      filter: undefined,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();

    let actualBinary = await fs.readFile(join(dir, "file"));
    expect(actualBinary).to.have.lengthOf(1 * GB);
    expect(actualBinary).to.deep.equal(bigBinary);
  });

});
