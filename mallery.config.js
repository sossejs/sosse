const pkg = require("./package");

let toc = [
  { title: pkg.name, path: "README.md" },
  { path: "getting_started.md" },
  { title: "Changelog", path: "CHANGELOG.md" },
  { title: "Contributing", path: "CONTRIBUTING.md" },
];

if (pkg.repository && pkg.repository.url) {
  toc.push({ title: "Repository", href: pkg.repository.url });
}

module.exports = {
  title: pkg.name,
  paths: {
    src: "./docs",
    output: "./site",
    public: "./docs/public",
  },
  toc,
};
