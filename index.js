import express from "express"
import chalk from "chalk"
import cors from "cors"
import { MongoClient} from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt"
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
const  signSchema= joi.object({
    name: joi.string().min(1).required(),
    email: joi.string().email().required(),
    password: joi.string().min(1).required(),//faltando verificação de igualdade
    repassword: joi.string().min(1).required()
})
app.post("/sign-in",(req,res)=>{
  const {name,email,password,repassword}=req.body;
  const user={name,email,password,repassword}
  const validate= signSchema.validate(user)
  if(validate.error){
      res.sendStatus(409)
      return;
  }
  console.log(user);
  res.sendStatus(200)
})


app.listen(process.env.DOOR, () => {
    console.log(chalk.bold.green("Silencio, estamos no AR!!!"));  });
