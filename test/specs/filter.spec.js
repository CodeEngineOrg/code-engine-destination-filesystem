"use strict";

const filesystem = require("../../");
const CodeEngine = require("@code-engine/lib");
const { createDir, readDir } = require("../utils");
const { expect } = require("chai");
const { normalize } = require("path");

describe("filter option", () => {

  async function generateWebsite (destination) {
    let source = {
      read () {
        return [
          { path: "robots.txt" },
          { path: "index.html" },
          { path: "about.html" },
          { path: "img/logo.png" },
          { path: "product1/index.html" },
          { path: "product1/about.html" },
          { path: "product1/img/front.jpg" },
          { path: "product1/img/back.jpg" },
          { path: "product2/index.html" },
          { path: "product2/about.html" },
          { path: "product2/img/front.jpg" },
          { path: "product2/img/back.jpg" },
        ];
      }
    };

    let engine = new CodeEngine();
    await engine.use(source, destination);
    await engine.build();
  }

  it("should write all files by default", async () => {
    let dir = await createDir();
    let destination = filesystem({
      path: dir,
      filter: undefined,
    });

    await generateWebsite(destination);
    let files = await readDir(dir);

    expect(files).to.have.same.members([
      "robots.txt",
      "index.html",
      "about.html",
      normalize("img/logo.png"),
      normalize("product1/index.html"),
      normalize("product1/about.html"),
      normalize("product1/img/front.jpg"),
      normalize("product1/img/back.jpg"),
      normalize("product2/index.html"),
      normalize("product2/about.html"),
      normalize("product2/img/front.jpg"),
      normalize("product2/img/back.jpg"),
    ]);
  });

  it("should write all files if the filter is true", async () => {
    let dir = await createDir();
    let destination = filesystem({
      path: dir,
      filter: true,
    });

    await generateWebsite(destination);
    let files = await readDir(dir);

    expect(files).to.have.same.members([
      "robots.txt",
      "index.html",
      "about.html",
      normalize("img/logo.png"),
      normalize("product1/index.html"),
      normalize("product1/about.html"),
      normalize("product1/img/front.jpg"),
      normalize("product1/img/back.jpg"),
      normalize("product2/index.html"),
      normalize("product2/about.html"),
      normalize("product2/img/front.jpg"),
      normalize("product2/img/back.jpg"),
    ]);
  });

  it("should not write any files if the filter is false", async () => {
    let dir = await createDir();
    let destination = filesystem({
      path: dir,
      filter: false,
    });

    await generateWebsite(destination);
    let files = await readDir(dir);

    expect(files).to.have.lengthOf(0);
  });

  it("should write all files that match the glob pattern", async () => {
    let dir = await createDir();
    let destination = filesystem({
      path: dir,
      filter: "**/*.{png,jpg}"
    });

    await generateWebsite(destination);
    let files = await readDir(dir);

    expect(files).to.have.same.members([
      normalize("img/logo.png"),
      normalize("product1/img/front.jpg"),
      normalize("product1/img/back.jpg"),
      normalize("product2/img/front.jpg"),
      normalize("product2/img/back.jpg"),
    ]);
  });

  it("should write all files that match multiple glob patterns", async () => {
    let dir = await createDir();
    let destination = filesystem({
      path: dir,
      filter: [
        "**/*.html",
        "**/*.jpg",
        "!about.html",
        "!**/back.jpg",
      ]
    });

    await generateWebsite(destination);
    let files = await readDir(dir);

    expect(files).to.have.same.members([
      "index.html",
      normalize("product1/index.html"),
      normalize("product1/about.html"),
      normalize("product1/img/front.jpg"),
      normalize("product2/index.html"),
      normalize("product2/about.html"),
      normalize("product2/img/front.jpg"),
    ]);
  });

  it("should write all files that match the regular expression", async () => {
    let dir = await createDir();
    let destination = filesystem({
      path: dir,
      filter: /^product2[\\/].*\.html/,
    });

    await generateWebsite(destination);
    let files = await readDir(dir);

    expect(files).to.have.same.members([
      normalize("product2/index.html"),
      normalize("product2/about.html"),
    ]);
  });

  it("should write all files that match the include/exclude criteria", async () => {
    let dir = await createDir();
    let destination = filesystem({
      path: dir,
      filter: {
        include: [
          "**/*.html",
          "**/*.jpg"
        ],
        exclude: [
          "about.html",
          "**/back.jpg"
        ]
      },
    });

    await generateWebsite(destination);
    let files = await readDir(dir);

    expect(files).to.have.same.members([
      "index.html",
      normalize("product1/index.html"),
      normalize("product1/about.html"),
      normalize("product1/img/front.jpg"),
      normalize("product2/index.html"),
      normalize("product2/about.html"),
      normalize("product2/img/front.jpg"),
    ]);
  });

  it("should write all files that match the custom filter criteria", async () => {
    let dir = await createDir();
    let destination = filesystem({
      path: dir,
      filter (file, context) {
        expect(file).to.be.a("file");
        expect(context).to.be.an("object").and.include.keys("cwd", "dev", "debug", "fullBuild");

        return file.name.includes("index.html");
      },
    });

    await generateWebsite(destination);
    let files = await readDir(dir);

    expect(files).to.have.same.members([
      "index.html",
      normalize("product1/index.html"),
      normalize("product2/index.html"),
    ]);
  });

});
