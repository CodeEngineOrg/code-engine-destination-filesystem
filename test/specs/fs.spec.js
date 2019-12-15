"use strict";

const filesystem = require("../../");
const { CodeEngine } = require("@code-engine/lib");
const { assert, expect } = require("chai");
const { normalize, resolve, dirname } = require("path");
const sinon = require("sinon");

describe("fs option", () => {

  it("should use custom filesystem functions", async () => {
    let source = {
      read () {
        return [
          { path: "file1.txt", text: "AAAAA" },
          { path: "file2.txt", text: "BBBBB" },
          { path: "subdir/file3.txt", text: "CCCCC" },
          { path: "sub/dir/file4.txt", text: "DDDDD" },
        ];
      }
    };

    let myCustomFS = {
      mkdir: sinon.stub().callsArg(2),
      writeFile: sinon.stub().callsArg(3),
    };

    let destination = filesystem({
      path: "/my/output/dir",
      fs: myCustomFS,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();

    sinon.assert.notCalled(myCustomFS.mkdir);
    sinon.assert.callCount(myCustomFS.writeFile, 4);

    let calls = myCustomFS.writeFile.getCalls();
    let file1 = calls.find(call => call.args[0].endsWith("file1.txt"));
    let file2 = calls.find(call => call.args[0].endsWith("file2.txt"));
    let file3 = calls.find(call => call.args[0].endsWith("file3.txt"));
    let file4 = calls.find(call => call.args[0].endsWith("file4.txt"));

    expect(file1.args[0]).to.equal(resolve("/my/output/dir/file1.txt"));
    expect(file1.args[1]).to.deep.equal(Buffer.from("AAAAA"));
    expect(file1.args[2]).to.deep.equal({ flag: "w" });

    expect(file2.args[0]).to.equal(resolve("/my/output/dir/file2.txt"));
    expect(file2.args[1]).to.deep.equal(Buffer.from("BBBBB"));
    expect(file2.args[2]).to.deep.equal({ flag: "w" });

    expect(file3.args[0]).to.equal(resolve("/my/output/dir/subdir/file3.txt"));
    expect(file3.args[1]).to.deep.equal(Buffer.from("CCCCC"));
    expect(file3.args[2]).to.deep.equal({ flag: "w" });

    expect(file4.args[0]).to.equal(resolve("/my/output/dir/sub/dir/file4.txt"));
    expect(file4.args[1]).to.deep.equal(Buffer.from("DDDDD"));
    expect(file4.args[2]).to.deep.equal({ flag: "w" });
  });

  it("should only call mkdir when writeFile throws ENOENT", async () => {
    let source = {
      read () {
        return [
          { path: "file1.txt" },
          { path: "file2.txt" },
          { path: "subdir/file3.txt" },
          { path: "sub/dir/file4.txt" },
        ];
      }
    };

    let createdDirs = [];

    let myCustomFS = {
      mkdir: sinon.stub().callsArg(2),

      writeFile (path, _data, _opts, callback) {
        let dir = dirname(path);

        if (createdDirs.includes(dir)) {
          callback();
        }
        else {
          createdDirs.push(dir);
          callback({ code: "ENOENT" });
        }
      }
    };

    let destination = filesystem({
      path: "/my/output/dir",
      fs: myCustomFS,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();

    sinon.assert.callCount(myCustomFS.mkdir, 3);

    let calls = myCustomFS.mkdir.getCalls();
    let rootDir = calls.find(call => call.args[0].endsWith(normalize("/my/output/dir")));
    let subDir = calls.find(call => call.args[0].endsWith(normalize("subdir")));
    let deepDir = calls.find(call => call.args[0].endsWith(normalize("sub/dir")));

    expect(rootDir.args[0]).to.equal(resolve("/my/output/dir"));
    expect(rootDir.args[1]).to.deep.equal({ recursive: true });

    expect(subDir.args[0]).to.equal(resolve("/my/output/dir/subdir"));
    expect(subDir.args[1]).to.deep.equal({ recursive: true });

    expect(deepDir.args[0]).to.equal(resolve("/my/output/dir/sub/dir"));
    expect(deepDir.args[1]).to.deep.equal({ recursive: true });
  });

  it("should re-throw unexpected errors from writeFile", async () => {
    let source = {
      read () {
        return { path: "file1.txt" };
      }
    };

    let myCustomFS = {
      mkdir: sinon.stub().callsArg(2),
      writeFile: sinon.stub().callsArgWith(3, new RangeError("Boom!")),
    };

    let destination = filesystem({
      path: "/my/output/dir",
      fs: myCustomFS,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);

    try {
      await engine.build();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(RangeError);
      expect(error.message).to.equal("An error occurred in Filesystem Destination while processing file1.txt. \nBoom!");
    }
  });

  it("should re-throw unexpected errors from mkdir", async () => {
    let source = {
      read () {
        return { path: "file1.txt" };
      }
    };

    let myCustomFS = {
      mkdir: sinon.stub().callsArgWith(2, new RangeError("Boom!")),
      writeFile: sinon.stub().callsArgWith(3, { code: "ENOENT" }),
    };

    let destination = filesystem({
      path: "/my/output/dir",
      fs: myCustomFS,
    });

    let engine = new CodeEngine();
    await engine.use(source, destination);

    try {
      await engine.build();
      assert.fail("An error should have been thrown");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(RangeError);
      expect(error.message).to.equal("An error occurred in Filesystem Destination while processing file1.txt. \nBoom!");
    }
  });

  it("should throw an error if fs.mkdir is not a function", async () => {
    try {
      filesystem({
        path: "/my/output/dir",
        fs: {
          mkdir: true,
        },
      });

      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Invalid fs.mkdir: true. Expected a function.");
    }
  });

  it("should throw an error if fs.writeFile is not a function", async () => {
    try {
      filesystem({
        path: "/my/output/dir",
        fs: {
          writeFile: 123456,
        },
      });

      assert.fail("An error should have been thrown!");
    }
    catch (error) {
      expect(error).to.be.an.instanceOf(TypeError);
      expect(error.message).to.equal("Invalid fs.writeFile: 123456. Expected a function.");
    }
  });

});
