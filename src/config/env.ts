const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1`;

if (!BACKEND_URL) {
  throw new Error("Add your Backend URL to the .env file");
}

export { BACKEND_URL };
