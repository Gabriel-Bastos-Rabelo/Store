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
const multer = require("multer");

const flash = require("connect-flash");

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

require('dotenv').config();


const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(
			null,
			new Date()
				.toISOString()
				.replace(/\-/g, '')
				.replace(/\:/g, '') + file.originalname
		);
	}

})

const fileFilter = (req, file, cb) => {

	if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
		cb(null, true)
	}
	else{
		cb(null, false)
	}
}


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

app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use("/images", express.static(path.join(__dirname, 'images')))



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

app.get("/500", errorController.get500)

app.use(errorController.get404)

app.use((error, req, res, next) => {
	res.redirect("/500")
})

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize.sync().then((result) => {
	app.listen(3000);
})
	.catch(err => console.log(err))
