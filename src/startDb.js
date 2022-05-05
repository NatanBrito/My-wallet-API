import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();


let db;
const mongoClient= new MongoClient(process.env.SERVER_DB);    
const promise= mongoClient.connect();
promise.then(()=>{
    db=mongoClient.db("myWallet");
    console.log(chalk.bold.blue(" data base em pé"))
})
export default db;