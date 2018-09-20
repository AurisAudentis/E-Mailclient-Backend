import dev from "./dev";
import deploy from "./deploy";

const env = process.env.NODE_ENV || "dev";


const configs = {
    dev,
    deploy
};
console.log("environment: " + env);
const config = configs[env];
console.log(config);
export default config;