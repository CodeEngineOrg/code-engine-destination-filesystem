"use strict";

const filesystem = require("../../");
const { CodeEngine } = require("@code-engine/lib");
const createDir = require("../utils/create-dir");
const { expect } = require("chai");

describe("filter option", () => {

  async function generateWebsite (cwd, destination) {
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

    let engine = new CodeEngine({ cwd });
    await engine.use(source, destination);
    await engine.run();
  }

  it("should write all files by default", async () => {
    let cwd = await createDir();
    let destination = filesystem({
      path: ".",
      filter: undefined,
    });

    await generateWebsite(cwd, destination);

    expect(cwd).to.have.deep.files([
      "robots.txt",
      "index.html",
      "about.html",
      "img/logo.png",
      "product1/index.html",
      "product1/about.html",
      "product1/img/front.jpg",
      "product1/img/back.jpg",
      "product2/index.html",
      "product2/about.html",
      "product2/img/front.jpg",
      "product2/img/back.jpg",
    ]);
  });

  it("should write all files if the filter is true", async () => {
    let cwd = await createDir();
    let destination = filesystem({
      path: ".",
      filter: true,
    });

    await generateWebsite(cwd, destination);

    expect(cwd).to.have.deep.files([
      "robots.txt",
      "index.html",
      "about.html",
      "img/logo.png",
      "product1/index.html",
      "product1/about.html",
      "product1/img/front.jpg",
      "product1/img/back.jpg",
      "product2/index.html",
      "product2/about.html",
      "product2/img/front.jpg",
      "product2/img/back.jpg",
    ]);
  });

  it("should not write any files if the filter is false", async () => {
    let cwd = await createDir();
    let destination = filesystem({
      path: ".",
      filter: false,
    });

    await generateWebsite(cwd, destination);

    expect(cwd).to.be.a.directory().and.empty;  // eslint-disable-line no-unused-expressions
  });

  it("should write all files that match the glob pattern", async () => {
    let cwd = await createDir();
    let destination = filesystem({
      path: ".",
      filter: "**/*.{png,jpg}"
    });

    await generateWebsite(cwd, destination);

    expect(cwd).to.have.deep.files([
      "img/logo.png",
      "product1/img/front.jpg",
      "product1/img/back.jpg",
      "product2/img/front.jpg",
      "product2/img/back.jpg",
    ]);
  });

  it("should write all files that match multiple glob patterns", async () => {
    let cwd = await createDir();
    let destination = filesystem({
      path: ".",
      filter: [
        "**/*.html",
        "**/*.jpg",
        "!about.html",
        "!**/back.jpg",
      ]
    });

    await generateWebsite(cwd, destination);

    expect(cwd).to.have.deep.files([
      "index.html",
      "product1/index.html",
      "product1/about.html",
      "product1/img/front.jpg",
      "product2/index.html",
      "product2/about.html",
      "product2/img/front.jpg",
    ]);
  });

  it("should write all files that match the regular expression", async () => {
    let cwd = await createDir();
    let destination = filesystem({
      path: ".",
      filter: /^product2[\\/].*\.html/,
    });

    await generateWebsite(cwd, destination);

    expect(cwd).to.have.deep.files([
      "product2/index.html",
      "product2/about.html",
    ]);
  });

  it("should write all files that match the include/exclude criteria", async () => {
    let cwd = await createDir();
    let destination = filesystem({
      path: ".",
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

    await generateWebsite(cwd, destination);

    expect(cwd).to.have.deep.files([
      "index.html",
      "product1/index.html",
      "product1/about.html",
      "product1/img/front.jpg",
      "product2/index.html",
      "product2/about.html",
      "product2/img/front.jpg",
    ]);
  });

  it("should write all files that match the custom filter criteria", async () => {
    let cwd = await createDir();
    let destination = filesystem({
      path: ".",
      filter (file, context) {
        expect(file).to.be.a("file");
        expect(context).to.be.an("object").and.include.keys("cwd", "concurrency", "dev", "debug");

        return file.name.includes("index.html");
      },
    });

    await generateWebsite(cwd, destination);

    expect(cwd).to.have.deep.files([
      "index.html",
      "product1/index.html",
      "product2/index.html",
    ]);
  });

});
