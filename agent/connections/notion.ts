import { connect } from "@vercel/connect/eve";
import { defineMcpClientConnection } from "eve/connections";
const notionConnector = process.env.NOTION_CONNECTOR ?? "notion/suganthi-cos";

export default defineMcpClientConnection({
    url: "https://mcp.notion.com/mcp",
    description:
        "Notion workspace: search, read, and edit pages and databases, including to-do and task lists.",
    auth: connect({
        connector: notionConnector,
        // User-scoped OAuth. Per Brian Emerick in #help-it this is the
        // sanctioned route for eve → Notion: no IT approval needed, and
        // already used by other eve agents. App scope needs an IT-minted
        // internal integration, which has been gated since INC-6014 — it
        // fails here with "Token subject is not accessible to this requester".
        principalType: "user",
    }),
});