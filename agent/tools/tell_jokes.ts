import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Tell a joke",
  inputSchema: z.object({}),
  async execute() {
    const res = await fetch(
      `https://api.api-ninjas.com/v1/jokes`
    );
    const data = await res.json();
    return data[0].joke;
  },
});