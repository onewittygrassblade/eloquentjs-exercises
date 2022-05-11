[![CI](https://github.com/onewittygrassblade/eloquentjs-exercises/actions/workflows/ci.yml/badge.svg)](https://github.com/onewittygrassblade/eloquentjs-exercises/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/onewittygrassblade/eloquentjs-exercises/branch/main/graph/badge.svg?token=ESS29P0AUM)](https://codecov.io/gh/onewittygrassblade/eloquentjs-exercises)

# Eloquent JavaScript exercises

This is a non-exhaustive collection of code snippets from examples and exercises from [Eloquent JavaScript](https://eloquentjavascript.net/) (third edition).

## Using this repo

### Tests

All code snippets are tested using Jest.

Running all tests:
```
npm test
```

With coverage report:
```
npm test -- --coverage
```

Running the tests for a specific chapter:
```
npm test -- chap4
```

Running a specific test:
```
npm test -- chap4/list.test.js
```

### Directly running the code snippets

Some code snippets contain some manual test code (commented out to avoid making the tests noisy due to `console.log`) at the bottom of the file, after the exports. These can be run (after uncommenting the lines) using `node`:
```
node chap4/squirrel.js
```

### Linter

ESLint is configured with the base config from Airbnb.

Run the linter on all files:
```
npm run lint
```

To add autofixing, the `lint` script in `package.json` can be modified with the `--fix` parameter:
```
"lint": "eslint . --fix",
```
