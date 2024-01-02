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

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))


const options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'Gb@stos7',
	database: 'store_project'
};

const sessionStore = new MySQLStore(options);


app.use(session({
	key: 'session',
	secret: 'my secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));




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
    return User.findByPk(1);
}).then(user => {
    if (!user) {
        return User.create({ name: 'Max', email: 'gab@gmail.com' });
    }

    app.listen(3000);
})
    .catch(err => console.log(err))
