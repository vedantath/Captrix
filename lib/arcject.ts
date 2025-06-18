import arcjet from "@arcjet/next";
import { getEnv } from "./utils";

const aj = arcjet({
    key: getEnv('ARCJECT_API_KEY'),
    rules: [],
})

export default aj;