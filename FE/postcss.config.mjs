const disableTailwind = process.env.DISABLE_TAILWIND === "1";

export default {
	plugins: disableTailwind
		? {}
		: {
			"@tailwindcss/postcss": {},
		},
};
