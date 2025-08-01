const express = require("express")
const app = express()


app.get("/api", (req, res) => {
    res.json({"mentor" : ["Ahmed", "26", "Software Developer"]})
} )

app.listen(5000, () => {
    console.log("server started on port 5000")
})
