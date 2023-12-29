const http = require("http");
const route = require("./routes");
const path = require("path")
const bodyParser = require("body-parser")
const express = require("express");
const app = express();
const router = require("./routes/admin");
const shopRoutes = require("./routes/shop");
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))
const errorController = require("./controllers/error")


app.use("/admin", router);

app.use(shopRoutes)


app.set('view engine', 'ejs');
app.set('views', 'view');

app.use(errorController.get404)


app.listen(3000)