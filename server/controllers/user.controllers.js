import {User} from '../models/user.models.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {sendForgotMail, sendMail} from '../middlewares/sendMail.middlewares.js'

export const registerUser = async (req,res)=>{
    try {

        const {email,name,password,role} = req.body;

        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({
                message:"User already exists"
            })
        };

        const hashPassword = await bcrypt.hash(password, 10);

        user = {
            email,
            name,
            password:hashPassword,
            role
        };

        // otp generation
        const otp = Math.floor(Math.random()*1000000);

        const activationToken = jwt.sign(
            {
                user,
                otp
            },
            process.env.ACTIVATION_SECRET,
            {
                expiresIn:'5m'
            }
        );


        const data = {
            name,
            otp
        };

        await sendMail(email,"FluidControls otp verification",data);

        res.status(200).json({
            message:"Otp sent to your mail",
            activationToken,
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

export const verifyOtp = async (req,res)=>{

   try {
     const { activationToken,  otp } = req.body;
 
     const verify = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
     
     if(!verify)
     {
         return res.status(400).json({
             message:"otp expired!"
         })
     }
 
     if(String(verify.otp) !==String(otp))
     {
         return res.status(400).json({
             message:"otp is invalid"
         })
     };
 
     await User.create({
         name: verify.user.name,
         email:verify.user.email,
         password:verify.user.password,
         role:verify.user.role
     });
 
     res.status(200).json({
         message:"User registered successfully",
     })
   } catch (error) {
    res.status(500).json({
        message:error.message,
    })
   }
}

export const loginUser = async (req,res)=>{
    try {

        const {email, password} = req.body;

        if(!email || !password)
        {
            return res.status(400).json({
                message:"It is required to enter."
            });
        }

        const user = await User.findOne({email}).select("+password");

        if(!user)
        {
            return res.status(400).json({
                message:"User not found",
            })
        }

        const verifyPassword = await bcrypt.compare(password,user.password);

        if(!verifyPassword)
        {
            return res.status(400).json({
                message:"Password is Incorrect",
            })
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn:"15d" });

      const userResponse = user.toObject();
      delete userResponse.password;

        res.status(200).json({
            message:`Welcome back ${user.name}`,
            token,
            user: userResponse,
        });
        
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

export const getMyProfile =async(req,res)=>{
    try {
        const user = await User.findById(req.user._id);

        if(!user) {
          return res.status(404).json({message:"User not found."})
      }
      
        res.status(200).json({user});

    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

export const updateMyProfile = async (req,res)=>{
    try {

        const {email,name} = req.body;
        const updateFields = {};

        if (name) updateFields.name = name;
        if (email) updateFields.email = email;

        const user = await User.findByIdAndUpdate(
            req.user._id, 
            updateFields,
            {new: true}
        );

        res.json({user});   

    } catch (error) {
         res.status(400).json({
            message:error.message
        })
    }
}


export const updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: imagePath },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile picture updated', user });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

export const forgotPassword =async(req,res)=>{
    try {
        const {email} =req.body;
    
        const user = await User.findOne({email});
    
        if(!user) return res.status(400).json({message: "No user with this email"});
    
        const token = jwt.sign({email}, process.env.FORGOT_SECRET, { expiresIn: '15m' });
    
        const data = {email,token};
    
        await sendForgotMail("Fluid Controls- Reset Password ",data);
    
        res.json({message:"Reset password link has been sent to your email."})
    } catch (error) {
        res.status(400).json({
      message: error.message
    });
    }
}

// --- THIS IS THE UPDATED FUNCTION WITH DEBUGGING LOGS ---
export const getAllOperators = async (req, res) => {
    try {
        // --- DEBUG STEP 1: Check if the user object from isAuth is present
        console.log('--- [getAllOperators] User object received:', req.user);

        // --- DEBUG STEP 2: Perform the supervisor check directly here
        if (!req.user || !req.user.role || req.user.role.toLowerCase() !== 'supervisor') {
            console.error('--- [getAllOperators] Authorization FAILED! User is not a supervisor.', { role: req.user?.role });
            return res.status(403).json({
                success: false,
                message: "Authorization failed: User is not a supervisor."
            });
        }
        
        console.log('--- [getAllOperators] Authorization successful. Searching for operators...');
        const operators = await User.find({ role: /^operator$/i }).select('name email skills');

        console.log('--- [getAllOperators] Operators found in DB:', operators);

        res.status(200).json({
            success: true,
            operators,
        });
    } catch (error) {
        console.error('--- [getAllOperators] An error occurred:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching operators."
        });
    }
};

