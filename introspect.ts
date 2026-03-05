import { getIntrospectionQuery, buildClientSchema, printSchema } from "graphql";
import fs from "fs";

async function main() {
  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });
  const { data } = await response.json();

  const schema = buildClientSchema(data);
  fs.writeFileSync("schema.graphql", printSchema(schema));
  console.log("Saved schema.graphql");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});