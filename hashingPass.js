import bcrypt from "bcryptjs";

// Replace with your plain password
const plainPassword = 'xac';

const salt = bcrypt.genSaltSync(10); // You can change the salt rounds
const hashedPassword = bcrypt.hashSync(plainPassword, salt);

console.log('Hashed password:', hashedPassword);
