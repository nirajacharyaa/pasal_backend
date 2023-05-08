import express from "express";
import cors from "cors";
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname } from "path";
import morgan from "morgan";
import connectToDb from "./src/config/db.js";
import productRoute from "./src/routes/productRoutes.js";
import userRoute from "./src/routes/userRoutes.js";
import categoryRoute from "./src/routes/categoryRoutes.js";
import orderRoute from "./src/routes/orderRoutes.js";
import auth from "./src/middleware/authMiddleware.js";

const app = express();
const api = process.env.API_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("short"));
app.use(cors());
app.options("*", cors());

app.use(`${api}/products`, productRoute);
app.use(`${api}/orders`, auth, orderRoute);
app.use(`${api}/categories`, categoryRoute);
app.use(`${api}/users`, userRoute);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

app.get("/", async (req, res) => {
  res.send("Hello from pasal backend.");
});

app.listen(3000, () => {
  connectToDb();
  console.log("Server Running");
});
