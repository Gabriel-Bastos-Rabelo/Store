const path = require("path")
const bodyParser = require("body-parser")
const express = require("express");
const app = express();
const router = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error")
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require("csrf-csrf");

const flash = require("connect-flash");

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

require('dotenv').config();


const doubleCsrfOptions = {
	getSecret: () => process.env.SECRET_KEY,
	cookieName: "__Host-meu.x-csrf-token",
	cookieOptions: {
	  sameSite: "strict",
	  path: "/",
	  secure: true
	},
	size: 64,
	ignoredMethods: ["GET", "HEAD", "OPTIONS"],
	getTokenFromRequest: (req) => req.headers["x-csrf-token"]
  };

const {
	invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
	generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
	validateRequest, // Also a convenience if you plan on making your own middleware.
	doubleCsrfProtection, // This is the default CSRF protection middleware.
  } = doubleCsrf(doubleCsrfOptions);
  

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))




const options = {
	host: process.env.DB_HOST,
	port: 3306,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
};

const sessionStore = new MySQLStore(options);


app.use(session({
	key: 'session',
	secret: 'my secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));


app.use(cookieParser('sua chave secreta'));


app.use((req, res, next) => {
	res.locals.isLoggedIn = req.session.isLoggedIn;
	const csrfToken = generateToken(req, res);
	res.locals.csrfToken = csrfToken;


	next();
})

app.use(flash());


app.use("/admin", router);


app.use(shopRoutes);

app.use(authRoutes)


app.set('view engine', 'ejs');
app.set('views', 'view');

app.use(errorController.get404)

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});

sequelize.sync().then((result) => {
    app.listen(3000);
})
    .catch(err => console.log(err))
