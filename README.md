# Cost Analysis

![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![node.js](https://img.shields.io/badge/Node.js-16.16-blue.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-8.11-blue.svg)](https://www.npmjs.com/)
[![license](https://img.shields.io/:license-mit-green.svg)](https://opensource.org/licenses/MIT)

![screenshot](thumbnail.png)

This is an APS Cost Analysis Sample: A responsive javascript based web application that showcases the use of APS Viewer and APS web services, working in a connected environment with integrated data from MONGODB database. This sample helps in analysing cost breakdown of a model as per material property.

## Development

### Prerequisites

- [APS credentials](https://forge.autodesk.com/en/docs/oauth/v2/tutorials/create-app)
- [Node.js](https://nodejs.org) (we recommend the Long Term Support version)
- Terminal (for example, [Windows Command Prompt](https://en.wikipedia.org/wiki/Cmd.exe)
  or [macOS Terminal](https://support.apple.com/guide/terminal/welcome/mac))

### MongoDB database

Install [MongoDB](https://www.mongodb.com/), start an instance locally and create a database - we recommend to follow the tutorial [here](https://docs.mongodb.com/manual/tutorial/getting-started/) for detailed instructions & then create collection.

```
   YourDatabase
   Database : db_cost_analysis
   Collection :cn_cost_analysis
```

The MONGODB_URL environment variable is typically found in the environment configuration of an application. It is set in a .env file, as a system environment variable.

### Setup & Run

- Clone this repository
- Install dependencies: `npm install`
- Setup environment variables:
  - `APS_CLIENT_ID` - your APS application client ID
  - `APS_CLIENT_SECRET` - your APS application client secret
  - `MONGODB_URL` - your MONGODB_URL
- Run the server: `npm start`

> When using [Visual Studio Code](https://code.visualstudio.com),
> you can specify the env. variables listed above in a _.env_ file in this
> folder, and run & debug the application directly from the editor.

## Troubleshooting

Please contact us via https://aps.autodesk.com/en/support/get-help.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for more details.
