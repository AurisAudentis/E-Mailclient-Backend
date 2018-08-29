import dev from "./dev";

const env = process.env.NODE_ENV || "dev";


const configs = {
    dev,
};
console.log("environment: " + env);
const config = configs[env];
export default config;