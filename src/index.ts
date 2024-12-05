import express, { Express } from "express";
import dotenv from "dotenv";
import { getText } from "@helpers/getText";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
  const text = getText();
  res.send(`Reponse text: ${text}`);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
