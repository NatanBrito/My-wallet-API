import express from "express"
import chalk from "chalk"
import cors from "cors"
import { MongoClient} from "mongodb";
import dotenv from "dotenv";
const app= express();
app.use(cors());
app.use(express.json());
dotenv.config();

const mongoClient= new MongoClient(process.env.SERVER_DB);    
let db;
const promise= mongoClient.connect();
promise.then(()=>{
    db=mongoClient.db("myWallet");
    console.log(chalk.bold.blue(" data base em pé"))
})
app.listen(process.env.DOOR, () => {
    console.log(chalk.bold.green("Silencio, estamos no AR!!!"));  });
