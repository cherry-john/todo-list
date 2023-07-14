import { parse } from 'cookie';
import jwt from '@tsndr/cloudflare-worker-jwt';

export default async function auth(request: Request, env: ENV): Promise<boolean | string> {
	const AUTH_COOKIE = 'CF_Authorization';

	let keys: Key[] = [];
	const url = env.team_domain + '/cdn-cgi/access/certs';
	const response = await fetch(url, {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	});
	// process response
	const keylist = await response.json<cloudflareKeys>();
	keys = keylist.keys;

	const cookie = parse(request.headers.get('Cookie') || '');
	if (cookie[AUTH_COOKIE] != null) {
		let verifiedjwt = false;
		for (const key of keys) {
			try {
				verifiedjwt = await jwt.verify(cookie[AUTH_COOKIE], key, { algorithm: 'RS256' });
			} catch (err) {
				console.error(err);
			}
		}
		if (verifiedjwt) {
			const decodedjwt = jwt.decode(cookie[AUTH_COOKIE]).payload;
			if (decodedjwt.aud == env.proj_aud && decodedjwt.iss == env.team_domain) {
				// Respond with the expected response
				return decodedjwt['email'];
			}
		}
	}
	//Something was wrong with the JWT so reject it
	return false;
}
