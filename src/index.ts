import express, { Express } from "express";
import dotenv from "dotenv";
import { getText } from "@helpers/getText";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import queryParser from "qs";

const uri =
  "mongodb+srv://tomaszsochacki:TomekTest@cluster0.g4gbw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(express.static("./public")); // i potem url: http://localhost:3000/images/photo.jpg
app.use(cookieParser());

app.get("/", async (req, res) => {
  console.log("Cookies: ", req.cookies);
  console.log("Query params", req.query);
  const text = getText();
  res.send(`Reponse text: ${text}`);
});

app.get("/get-documents-counter", async (req, res) => {
  try {
    const dbClient = await client.connect();
    const db = client.db("sample_airbnb");
    const collection = db.collection("listingsAndReviews");
    const data = await collection.countDocuments({ beds: 3 });
    console.log(data);

    const text = getText();
    res.status(200).json({ counter: data });
    dbClient.close();
  } catch {
    res.status(422).json({ errorMessage: "some error..." }); // np. zepsus uri do polaczenia
  }
});

app.post("/add", async (req, res) => {
  const dbClient = await client.connect();
  const db = client.db("test");
  const collection = db.collection("test-collection");

  const data = { name: "Tomek", age: 38 };

  await collection.insertOne(data);
  res.send("ok");
  dbClient.close();
});

app.post("/insert", async (req, res) => {
  const dbClient = await client.connect();
  const db = client.db("test");
  const collection = db.collection("test-collection");
  console.log(req.body);
  await collection.insertOne(req.body);
  res.send("ok");
  dbClient.close();
});

app.put("/update/:id", async (req, res) => {
  const dbClient = await client.connect();
  const db = client.db("test");
  const collection = db.collection("test-collection");
  console.log(req.body);
  console.log(req.params.id);
  // await collection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isMemorized: true } });
  await collection.replaceOne({ _id: new ObjectId(req.params.id) }, { key: "123" });

  res.send("ok");
  dbClient.close();
});

app.get("/redirect-to-image", (req, res) => {
  res
    .status(201)
    .cookie("custom-cookie", "ABC ", {
      expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
    })
    .cookie("test", "test")
    .redirect(301, "/images/photo.jpg");
});

// do updateOne bardziej pasuje patch, a replaceOne to put

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

/*
curl -X PUT -H "Content-Type: application/json" -d "{ \"key1\": \"value1\" }" http://localhost:3000/update/67520b27f01c1deccd67020c
 
cookies w curl: curl -b "name=Tomek"  http://localhost:3000
curl -b "name=Tomek;y=9"  http://localhost:3000


w postkanie dodajemy header Cookie i potem x=5 ub x=5;y=10


do zrobienia query params w curl trzeba url owinac w cudzyslow:
curl "http://localhost:3000?name=Tomek&age=38"
inaczej do API pojdzie tylko pierwsze query
*/
