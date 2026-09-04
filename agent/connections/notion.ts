import { connect } from "@vercel/connect/eve";
import { defineMcpClientConnection } from "eve/connections";
const notionConnector = process.env.NOTION_CONNECTOR ?? "mcp.notion.com/suganthi-notion-cos";

export default defineMcpClientConnection({
    url: "https://mcp.notion.com/mcp",
    description: "Notion workspace: search, read, and edit pages and databases.",
    auth: connect(notionConnector),
});