# Getting started

## Download and prepare

You can add changes to the template to prepare it for your use cases. Afterwards create new projects from it with `cp` or with [hoppla](https://github.com/hopplajs/hoppla).

```bash
git clone git@github.com:witneyjs/witney.git;
# Optionally customize the cloned template
```

## Start a new project from your local witney copy

```bash
npx hoppla -t witney -d newProj -i "{ install: true }";
cd newProj;
```

## Building prod
```bash
./scripts/build.js
```


## Building dev
```bash
./scripts/build-core.js -w
```

## Starting a server

```bash
./scripts/start.js
```
