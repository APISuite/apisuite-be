# APISuite Backend

This is APISuite's core backend repository. Affectionately known as the Kraken.

## Requirements

APISuite's backend has (or can have) a few legs. Like a Kraken. This is its head.

- Database: this backend is ready to work with the most recent versions of PostgreSQL
- Gateway: a [Kong](https://konghq.com/) instance is needed for some core functionality
- Message Queue: we currently support [RabbitMQ](https://www.rabbitmq.com/) for this effect
- OIDC/OAuth2 provider: we use [Hydra](https://www.ory.sh/hydra/) to manage OAuth2 clients for our apps

## Installing

Docker images are available in our [DockerHub](https://hub.docker.com/r/cloudokihub/apisuite-be).

Every new image is tagged with:
- commit hash
- latest (dev-latest and stg-latest from develop and staging respectively)
- semantic version from `package.json` (only in production)

Depending on your goals, you could use a fixed version like `1.0.0` or
`latest` to simply get the most recent version every time you pull the image.

We provide `docker-compose.yaml` to help with simplified setups, 
usually for development purposes (`./util` contains additional files to be used in with this compose setup).
Using this for production is not advised!

## Environment variables

There is a configuration sample file in `.env.sample` with all variables needed for a complete docker-compose setup.

More details on key server variables can be found in `src/config/schema.js`.

## API

API documentation follows [OpenAPI 3.0 specifications](https://swagger.io/docs/specification/basic-structure/)

Documentation is done via [JSDoc](https://jsdoc.app/) comments on the routes declared in `src/routes/`

When the server is running, API documentation is served on `/api-docs`.

## Development

- Node.js version is kept in `.nvmrc`. Running `nvm use` in the terminal should give you the right version
- Remember to run linter (`npm run lint`) and tests (`npm test`) before committing or creating a pull request
- Commits should follow [conventional commits](https://www.conventionalcommits.org) spec
- To help enforce commit standards, commitizen is configured. Install globally `npm i -g commitizen` and run `cz` to launch the commit CLI  
- API first development is preferred, so that we can keep the API solid and consistent
- Database migrations should be planed/created in a gradual way to avoid breaking changes 
  (example: renaming a column can be done in 2 steps: create new column; change code to start using new column; delete old column when code no longer references it) 
- `docker-compose.debug.yml` contains all the core backend components except the core API, 
  which can be used to start all backend dependencies and run the API in a debugger

### History

This repo was extracted and ported from one where the Kraken came to life. 
Therefore, history does not reflect all the contributions from the previous developers.

Original (private) repo is still kept in the same place for reference.
