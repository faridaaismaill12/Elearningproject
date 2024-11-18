import {Schema} from 'mongoose';

export const UserSchema = new Schema({
    userid:{
        type: String ,
        required: true , 
        unique: true
    }, 

    name:{
        type: String , 
        required: true , 
        trim: true  
    },

    email:{
        type: String , 
        required: true , 
        unique: true ,
        lowercase: true ,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    passwordhash:{
        type: String ,
        required: true
    },

    role:{
        type: String , 
        required: true ,
        // enum: ['student' , 'admin' , 'instructor'] if we will use the enum to decide the role of the user
    },

    profile_picture_URL:{
        type: String ,
        default: null
    },

    createdAt:{
        type: Date ,
        default: Date.now
    },

    birthday:{
        type: Date ,
        required: false
    },

    enrolled_courses:[
        {
        // type: type will be a reference to the course collection when it is created
        // ref: 'Course' link to course collection
    }],

    bio:{
        type: String , 
        default: '' ,
        required: false ,
        trim: true
    },

    preferences:{
        type: String , // type can be changed to courses or another feature
        required: false
    },

    isActive:{
        type: Boolean ,
        default: true
    },

    lastLogin:{
        type: Date ,
        default: null
    },

    lastChangedPassword:{
        type: Date ,
        default: null
    }
});