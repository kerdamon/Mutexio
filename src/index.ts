import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";

dotenv.config();


const app: Express = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const cosmos_endpoint = process.env.COSMOS_ENDPOINT;
const cosmos_key = process.env.COSMOS_KEY;
if (!cosmos_endpoint || !cosmos_key) {
  throw new Error("Cosmos DB credentials missing");
}
const client = new CosmosClient({ endpoint: cosmos_endpoint, key: cosmos_key });

async function prepareContainer() {
  const { database } = await client.databases.createIfNotExists({ id: "mutexio" });
  const { container } = await database.containers.createIfNotExists({ id: "slots" });
  return container;
}

app.get("/", async (req: Request, res: Response) => {
  const container = await prepareContainer();
  const items = await container.items.readAll().fetchAll();
  res.send(`items: ${items.resources}`);
});

app.get("/slots", async (req: Request, res: Response) => {
  const container = await prepareContainer();
  const items = await container.items.readAll().fetchAll();
  res.json(items.resources);
});

app.post("/slot/:id", async (req: Request, res: Response) => {
  const container = await prepareContainer();
  const id = req.params.id;
  const item = { 
    id, 
    owner: "me",
    resouceUri: req.body.resouceUri, 
    blocked: false // TODO change to real owner
  }
  await container.items.create(item);
  console.log(item);

  res.json({created: "ok"});
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
