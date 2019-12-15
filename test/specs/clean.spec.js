"use strict";

const filesystem = require("../../lib");
const { CodeEngine } = require("@code-engine/lib");
const createDir = require("../utils/create-dir");
const { assert, expect } = require("chai");
const { join } = require("path");
const { promises: fs } = require("fs");

describe("plugin.clean()", () => {

  it("should delete the output directory", async () => {
    let cwd = await createDir([
      "output/file1.txt",
      "output/subdir/file2.txt",
      "output/sub/dir/file3.txt",
    ]);

    let destination = filesystem({
      path: "output",
    });

    let engine = new CodeEngine({ cwd });
    await engine.use(destination);
    await engine.clean();

    expect(cwd).to.be.a.directory().and.empty;
  });

  it("should do nothing if the output directory does not exist", async () => {
    let cwd = await createDir();

    let destination = filesystem({
      path: "output",
    });

    let engine = new CodeEngine({ cwd });
    await engine.use(destination);
    await engine.clean();

    expect(cwd).to.be.a.directory().and.empty;
  });

  it("should overwrite files in the output directory", async () => {
    let cwd = await createDir([
      { path: "dist/file.txt", text: "OLD CONTENTS" },
      { path: "dist/file2.txt", text: "OLD CONTENTS" },
      { path: "dist/subdir/file.txt", text: "OLD CONTENTS" },
      { path: "dist/subdir/file2.txt", text: "OLD CONTENTS" },
      { path: "dist/sub/dir/file.txt", text: "OLD CONTENTS" },
      { path: "dist/sub/dir/file2.txt", text: "OLD CONTENTS" },
    ]);

    let source = {
      read () {
        return [
          { path: "file.txt", text: "Hello, world" },
          { path: "subdir/file.txt", text: "Hello subdir" },
          { path: "sub/dir/file.txt", text: "Hello deep subdir" },
        ];
      }
    };

    let destination = filesystem({
      path: "dist",
    });

    let engine = new CodeEngine({ cwd });
    await engine.use(source, destination);
    await engine.clean();
    await engine.build();

    // Make sure the output directory contains exactly what we expect
    expect(cwd).to.have.deep.files([
      "dist/file.txt",
      "dist/subdir/file.txt",
      "dist/sub/dir/file.txt",
    ]);

    // Check the contents of each file
    expect(await fs.readFile(join(cwd, "dist/file.txt"), "utf8")).to.equal("Hello, world");
    expect(await fs.readFile(join(cwd, "dist/subdir/file.txt"), "utf8")).to.equal("Hello subdir");
    expect(await fs.readFile(join(cwd, "dist/sub/dir/file.txt"), "utf8")).to.equal("Hello deep subdir");
  });

  it("should error if the output directory is not a directory", async () => {
    let cwd = await createDir([
      { path: "output", contents: "I'm not a directory. I'm a file." },
    ]);

    let destination = filesystem({
      path: "output",
    });

    let engine = new CodeEngine({ cwd });
    await engine.use(destination);

    try {
      await engine.clean();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.code).to.equal("ENOTDIR");
      expect(error.path).to.equal(join(cwd, "output"));
      expect(error.message).to.equal(
        "An error occurred in Filesystem Destination while cleaning the destination. \n" +
        `The destination path is not a directory: ${join(cwd, "output")}`
      );
    }
  });

});
