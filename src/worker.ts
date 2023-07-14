import auth from './auth.js';
import { escapeHtml } from './escape.js';
import template from './template.html';

export default {
	async fetch(request: Request, env: ENV) {
		//authenticate
		const user = await auth(request, env);
		if (!user) {
			return new Response('404');
		}

		const defaultData = { todos: [] };

		//getters and setters from KV store
		const setCache = (key: string, data: string) => env.TODOS.put(key, data);
		const getCache = (key: string) => env.TODOS.get(key);

		//load existing todos
		async function getTodos(request: Request) {
			const cacheKey = `data-${user}`;
			let data;
			//get cache for user
			const cache = await getCache(cacheKey);
			if (!cache) {
				//new user
				await setCache(cacheKey, JSON.stringify(defaultData));
				data = defaultData;
			} else {
				data = JSON.parse(cache);
			}

			//load html template and replace with our todo list
			const body = template.replace(
				'$TODOS',
				JSON.stringify(
					data.todos?.map((todo: Todo) => ({
						id: escapeHtml(todo.id),
						name: escapeHtml(todo.name),
						completed: !!todo.completed,
					})) ?? []
				)
			);
			return new Response(body, {
				headers: { 'Content-Type': 'text/html' },
			});
		}

		async function updateTodos(request: Request) {
			const body = await request.text();
			const cacheKey = `data-${user}`;
			try {
				JSON.parse(body);
				await setCache(cacheKey, body);
				return new Response(body, { status: 200 });
			} catch (err: any) {
				return new Response(err, { status: 500 });
			}
		}

		if (request.method === 'PUT') {
			return updateTodos(request);
		}
		return getTodos(request);
	},
};
