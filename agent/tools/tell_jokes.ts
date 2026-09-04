import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Tell a joke",
  inputSchema: z.object({}),
  async execute() {
    const res = await fetch(
      "https://official-joke-api.appspot.com/jokes/programming/random"
    );
    const data = await res.json();
    return data[0].setup + "\n\n" + data[0].punchline;
  },
});