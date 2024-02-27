const express = require("express");
const path = require("path");

const cors = require("cors");
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const productsRouter = require("./routes/productsRoutes");
const authRouter = require("./routes/authRoutes");
const customError = require("./utils/customError");
const errorController = require("./controllers/errorController");

const app = express();
const limiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: "Too Many Requests from this IP, Please Try Again in an Hour!",
});

app.use(helmet());
var corsOptions = {
  origin: "http://localhost:4200",
  methods: "GET, POST, PUT, PATCH, DELETE, HEAD",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
app.use(sanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "Stock",
      "category",
      "uniqueId",
      "filterValue",
      "value",
      "image",
      "alt",
      "title",
      "productName",
      "quantity",
      "rating",
      "ratingAverage",
      "originalPrice",
      "currentPrice",
      "discountPercentage",
    ],
  })
);

app.use((request, response, next) => {
  request.time = new Date().toISOString();
  next();
});

app.use("/", express.static(path.join(__dirname, "./public/mainPage")));
app.use(
  "/products",
  express.static(path.join(__dirname, "./public/products/"))
);

app.use("/api/v1/products", productsRouter);

app.use("/api/v1", limiter);
app.use("/api/v1", authRouter);

app.all("*", (request, response, next) => {
  const error = new customError(
    `Page Not Found for the Requested URL ${request.url}`,
    404
  );
  next(error);
});

app.use(errorController);

module.exports = app;
