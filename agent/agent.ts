import { defineAgent } from "eve";

export default defineAgent({
  model: "zai/glm-5.3-flash",
    modelOptions: {
    providerOptions: {
      gateway: {
        models: [
          "google/gemini-3.8-flash",
          "deepseek/deepseek-v4-flash-vision-exp"
        ], 
      },
    }
    }
});
