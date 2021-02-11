const HTTPStatus = require('http-status-codes')

const html = `<!DOCTYPE html>
<html>
  <head>
    <title>[[title]]</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <link rel="icon" href="[[favicon]]">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      .menu-content img {
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='[[spec-url]]'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js"> </script>
  </body>
</html>`

const redocHtml = (options) => {
  const { title, specUrl, favicon } = options
  return html.replace('[[title]]', title).replace('[[spec-url]]', specUrl).replace('[[favicon]]', favicon)
}

const redoc = (options) => {
  return (req, res) => {
    res.type('html')
    res.status(HTTPStatus.OK).send(redocHtml(options))
  }
}
module.exports = {
  redoc,
}
