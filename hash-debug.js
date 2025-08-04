// hash-debug.js
import crypto from "crypto"

const yourToken = 'e10b95008c3ed0d31a97a8b6d447ba266479b461'; // Use the plain reset token from the reset URL
const hashed = crypto.createHash('sha256').update(yourToken).digest('hex');

console.log("Hashed token:", hashed);
