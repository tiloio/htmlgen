#!/usr/bin/env node
const { cli } = require('../dist/cli');

cli(process.argv)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });
