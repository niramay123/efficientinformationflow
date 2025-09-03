import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required:true,
        },
        email:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true,

        },
        
        role:{
            type:String,
            enum:['admin','supervisor','operator'],
            default:'operator',
            required:true
        },

        profilePicture :{
            type:String,
        },

        resetPasswordExpired:{
            type:Date,
        }
    },
    {
        timestamps:true,
    }
)

export const User = mongoose.model("User",userSchema);