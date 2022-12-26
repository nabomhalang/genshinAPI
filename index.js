const express = require("express");
const app = express(), port = 3000;

const { prepare } = require("./routes");

prepare(app).then(() => {
    app.listen(port, "0.0.0.0", () => {
        console.log(`App listening on port ${port}`);
    });
});
