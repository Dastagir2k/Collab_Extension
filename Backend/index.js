import { LLMCall } from "./ai.js";

async function main() {
    try {
        const prompt = " ";
        const response = await LLMCall(prompt);
        console.log("AI Response:", response);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();