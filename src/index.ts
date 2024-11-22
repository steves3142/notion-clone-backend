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