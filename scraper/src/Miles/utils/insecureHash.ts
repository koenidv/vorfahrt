import { createHash } from "node:crypto";

export default function insecureHash(...args: any[]) {
    return createHash("sha1").update(args.join(":")).digest("base64url");
}