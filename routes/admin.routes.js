import express from "express"
import { authenticateUsers } from "../middlewares/authenticateUsers.middleware.js"
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js"
import {getAllUsers, getUserById, deleteUser, updateRole} from "../controllers/admin.controller.js"

const router = express.Router();

router.use(authenticateUsers, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.post('/user', getUserById);
router.delete('/users/', deleteUser);
router.patch('/users/role', updateRole);

//Note routes


export default router;