import express from "express"
import chalk from "chalk"
import cors from "cors"
import { MongoClient, MongoClient } from "mongodb";
import dotenv from "dotenv";
const app= express();
app.use(cors());
app.use(express.json());
dotenv.config();


const MongoClient= new MongoClient("mongodb://localhost:27017");

app.listen(5000, () => {
    console.log(chalk.bold.green("Silencio, estamos no AR!!!"));
  });