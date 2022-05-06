import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import chalk from "chalk" 
dotenv.config();


const mongoClient= new MongoClient(process.env.SERVER_DB);    
let wallet;
const promise= mongoClient.connect();
promise.then(()=>{
    wallet=mongoClient.db("myWallet");
    console.log(chalk.bold.blue(" data base em pé"))
})
export default wallet;

