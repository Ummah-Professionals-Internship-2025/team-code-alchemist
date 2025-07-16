const express = require("express")
const app = express()

app.get('/', (req, res) => {
    res.render('/Users/marufuddin/team-code-alchemist/frontend/src/index.js')
} )

app.listen(4000)
