interface ENV {
	team_domain: string;
	proj_aud: string;
	TODOS: KVNamespace;
}

interface Todo {
	id: string;
	name: string;
	completed: boolean;
}

type Todos = Todo[];

interface Key {
	kid: string;
	kty: string;
	alg: string;
	use: string;
	e: string;
	n: string;
}

interface PublicCert {
	kid: string;
	cert: string;
}

interface cloudflareKeys {
	keys: Key[];
	public_cert: PublicCert;
	public_certs: PublicCert[];
}

interface cloudflareJWT {
  
}

declare module '*.html' {
	const content: string;
	export default content;
}
