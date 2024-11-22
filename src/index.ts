import { Hono } from "hono";
import { OpenAI } from "openai";
import { cors } from "hono/cors";

type Bindings = {
	OPEN_AI_KEY: string;
	AI: Ai;
}

const app = new Hono<{Bindings: Bindings}>();

app.use(
	'/*',
	cors({
		origin: '*', //Allow requests from Next.JS app
		allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-type'], //Add Content-Type to the allowed headers to fix CORS
		allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT'],
		exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
		maxAge: 600,
		credentials: true,
	})
);

app.post('/translateDocument', async (c) => {
	const { documentData, targetLang } = await c.req.json();

	//Generate a summary of the document
	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
		input_text: documentData,
		max_length: 1000,
	});

	//translate the summary into another language
	const response = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
		text: summaryResponse.summary,
		source_lang: 'english',
		target_lang: targetLang,
	})

	return new Response(JSON.stringify(response));
});

app.post('/chatToDocument', async(c) => {
	const openai = new OpenAI({
		apiKey: c.env.OPEN_AI_KEY,
	});

	const { documentData, question } = await c.req.json();
	
	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: 'system',
				content: 'You are an assistant helping the user chat with a document, I am providing a JSON file of the markdown for the document. Using this, answer the users question in the clearest way possible, the document is about ' +
				documentData,
			}, 
			{
				role: 'user',
				content: 'My Question is ' + question,
			},
		],
		model: 'gpt-4o',
		temperature: 0.5,
	});

	const response = chatCompletion.choices[0].message.content;

	return c.json({ message: response });
})

export default app;