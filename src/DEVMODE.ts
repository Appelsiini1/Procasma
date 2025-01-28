// Dotenv cannot be used in the renderer process, because it uses fs.
import "dotenv/config";

export const devmode = process.env.DEVMODE === "true" ? true : false;
export const devmodeString = process.env.DEVMODE;

export default devmode;
