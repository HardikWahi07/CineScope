// Initial empty state to prevent app crash
window.config = { API_KEY: "", BASE_URL: "https://www.omdbapi.com/", GROQ_KEY: "" };

async function initConfig() {
    try {
        // PRO: Try to fetch secrets from secrets.env
        const response = await fetch('secrets.env');
        if (!response.ok) throw new Error("File not found");
        const text = await response.text();
        const env = {};
        text.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) env[key.trim()] = value.trim();
        });
        
        if (env.OMDB_API_KEY) {
            window.config.API_KEY = env.OMDB_API_KEY;
            window.config.GROQ_KEY = env.CHABOT_API_KEY || "";
            console.log("CineScope Environment Loaded Successfully ✅");
            return true;
        } else {
            console.warn("Keys were empty in secrets.env! Make sure you have OMDB_API_KEY=yourkey");
            return false;
        }
    } catch (error) {
        console.error("FATAL: Could not fetch secrets.env. Run a local server!");
        return false;
    }
}
