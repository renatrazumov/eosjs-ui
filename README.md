# About

Deprecated .. this is for reference only..


General purpose web interface for the EOS blockchain.

Status: Alpha (for developers)

# Requirement

Build and run [eosd](https://github.com/eosio/eos) or direct requests to a public testnet or production node.

# Configuration

See [npm/config](http://npmjs.com/package/config) and [./config](./config).

In summary, the kyt environment automatically sets NODE_ENV to `development`
(in `npm run dev`).  For local customizations, you can copy [./config/development.json](./config/development.json)
to a new name (like ./config/myconfig.json) set NODE_ENV=myconfig.

# Start

```bash
npm install
npm run dev
```

# Development

[Getting Started](DEVELOP.md)

# Environment

Node 8+ and Browser
