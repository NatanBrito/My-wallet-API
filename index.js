import express from "express"
import chalk from "chalk"
import cors from "cors"
import { MongoClient, ObjectId} from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid} from "uuid"
const app= express();
app.use(cors());
app.use(express.json());
dotenv.config();
const mongoClient= new MongoClient(process.env.SERVER_DB);    
let wallet;
const promise= mongoClient.connect();
promise.then(()=>{
    wallet=mongoClient.db("myWallet");
    console.log(chalk.bold.blue(" data base em pé"))
})
const  signSchema= joi.object({
    name: joi.string().min(1).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(1).required(),
    repassword: joi.ref('password')
})
app.post("/sign-up",async (req,res)=>{
  const {name,email,password,repassword}=req.body;
  const xx={name,email,password,repassword}
  const validate= signSchema.validate(xx,{abortEarly:false})
  const cryptPassword= bcrypt.hashSync(password,10)
  if(validate.error){
      res.status(409).send(validate.error.details.map((e)=>{return e.message}))
      return;
  }
  const user={email,password:cryptPassword};
  console.log({user})
  try{
      const searchEmail= await wallet.collection("users").findOne({email})  
      console.log({searchEmail})
      if(searchEmail){
          res.status(400).send("e-mail já cadastrado")
          return;
        }
        await wallet.collection("users").insertOne(user);
        res.sendStatus(200)
    }catch(e){
        res.status(409).send(e)
    }
})

app.post("/sign-in",async (req,res)=>{
    const {email,password}= req.body;
    try{
        const searchEmail= await wallet.collection("users").findOne({email})
        if(!searchEmail){ return res.status(409).send("user not find")}
        const returnPassword= bcrypt.compareSync(password,searchEmail.password);
        if(!returnPassword){
            res.status(401).send("password or e-mail invalid...");
            return;
        }
        const token= uuid();
        await wallet.collection("sessions").insertOne({
            token,            
            userId:searchEmail._id
        })

        res.status(200).send(token);
    }catch(e){
        res.status(409).send(e)
    }
})


app.listen(process.env.DOOR, () => {
    console.log(chalk.bold.green("Silencio, estamos no AR!!!"));  });
  