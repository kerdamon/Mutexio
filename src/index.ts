import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const cosmos_endpoint = process.env.COSMOS_ENDPOINT;
const cosmos_key = process.env.COSMOS_KEY;
if (!cosmos_endpoint || !cosmos_key) {
  throw new Error("Cosmos DB credentials missing");
}
const client = new CosmosClient({endpoint: cosmos_endpoint, key: cosmos_key});

app.get("/", async (req: Request, res: Response) => {
  const { database } = await client.databases.createIfNotExists({id: "ToDoList"});
  const { container } = await database.containers.createIfNotExists({id: "Items"});
  const item = await container.item("123").read();
  console.log(item.resource);

  res.send(`container: ${item.item}`);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
