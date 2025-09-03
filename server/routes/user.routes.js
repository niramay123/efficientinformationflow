import {Router} from 'express';
// Import the new controller function and the supervisor middleware
import { forgotPassword, getMyProfile, loginUser, registerUser, updateMyProfile, updateProfilePic, verifyOtp, getAllOperators } from '../controllers/user.controllers.js';
// NOTE: isSupervisor is no longer needed here for this route
import { isAuth } from '../middlewares/isAuth.middlewares.js';
import { uploadFiles } from '../middlewares/multer.middlewares.js';
import { resetPassword } from '../middlewares/sendMail.middlewares.js';

const router = Router();

// --- Public Routes ---
router.post('/user/register',registerUser);
router.post('/user/verify-user',verifyOtp);
router.post('/user/login',loginUser);
router.post('/user/forgot',forgotPassword);
router.post('/user/reset',resetPassword);

// --- Protected Routes for "My Profile" ---
router.get('/user/my-profile',isAuth,getMyProfile);
router.put('/user/my-profile',isAuth,updateMyProfile);
router.put('/user/my-profile/profilepic',isAuth,uploadFiles,updateProfilePic);

// --- MODIFIED ROUTE FOR DEBUGGING ---
// The isSupervisor middleware is temporarily removed. The check is now inside the controller.
router.get('/users/operators', isAuth, getAllOperators);

export default router;

