export const getJson = async (url) => {
	const res = await fetch(url);
	if (!res.ok) {
		const data = await res.json();
		throw new Error(data.message || "Request failed");
	}
	return res.json();
};

export const sendJson = async (url, method, data) => {
	const res = await fetch(url, {
		method,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!res.ok) {
		const data = await res.json();
		throw new Error(data.message || "Request failed");
	}

	return res.json();
};

export const sendWithoutBody = async (url, method, data) => {
	const options = {
		method,
	};

	if (typeof data !== "undefined") {
		options.headers = {
			"Content-Type": "application/json",
		};
		options.body = JSON.stringify(data);
	}

	const res = await fetch(url, options);

	if (!res.ok) {
		const data = await res.json();
		throw new Error(data.message || "Request failed");
	}
};
