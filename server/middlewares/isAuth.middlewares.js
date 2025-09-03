import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';

export const isAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // --- DEBUG LOG 1 ---
        // This will show us the exact details of the user who is logged in.
        console.log('--- [isAuth] Logged-in user found:', { id: user._id, role: user.role });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const isAdmin = (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized, no user data" });
        }
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({
                message: "You are not an admin, access denied"
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const isSupervisor = (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized, no user data" });
    }

    // --- DEBUG LOG 2 ---
    // This will confirm the role that is being checked.
    console.log('--- [isSupervisor] Checking role:', req.user.role);

    if (req.user.role.toLowerCase() !== "supervisor") {
        return res.status(403).json({ message: "You are not a supervisor, access denied" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const isOperator = (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: "Unauthorized, no user data" });
        }
        if (req.user.role.toLowerCase() !== 'operator') {
            return res.status(403).json({
                message: "You are not an operator, access denied"
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

