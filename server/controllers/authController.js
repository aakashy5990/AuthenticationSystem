import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import 'dotenv/config'
import transporter from '../config/nodemailer.js'

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password){
        return res.status(400).json({success:false, message:'Missing Details'})
    }

    try{
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(404).json({ success:false, message:'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({name, email, password:hashedPassword});
        await user.save();

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Join Soradesignstudio',
            text: `Welcome to Soradesignstudio website. Your account has been created with email id: ${email}`
        }
        try {
            await transporter.sendMail(mailOptions);
            console.log("💌 Email sent successfully!");
        }catch (emailErr) {
            console.error("❌ Email sending failed:", emailErr);
        }

        return res.json({success:true});

    }catch(err){
        res.status(500).json({success:false, message:err.message})
    }
}


export const login = async (req, res) => {
    const {email , password} = req.body;

    if(!email || !password){
        return res.status(400).json({success:false, message:'Email and  password are required'})
    }

    try{

        const user = await userModel.findOne({email});

        if(!user){
            return res.status(422).json({success:false, message:'Invalid email'})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(422).json({success:false, message:'Invalid password'})
        }

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success:true});


    }catch(error){
        return res.status(500).json({success:false, message:error.message});
    }
}

export const logout = async (req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.status(200).json({success: true, message: "Logged Out"});
    }catch(err){
        return res.status(500).json({ success: false, message: err.message})
    }
}

export const sendVerifyOtp = async (req, res) => {
    try{
        const { userId } = req.user;
        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account Already verified"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify Your account using this OTP`
        }

        await transporter.sendMail(mailOption);

        res.status(200).json({success: true, message: 'Verification OTP Send on Email'})
    }catch(err){
        res.json({success: false, message: err.message});
    }
}

export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const { userId } = req.user;
     
    if(!userId || !otp){
        return res.json({ success:false, message: 'Missing Details' });
    }

    try{
        const user = await userModel.findById(userId);

        if(!user){
            return res.status(404).json({ success: false, message: 'User Not Found' });
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.status(400).json({ success: false, message: 'Invalid Otp'});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.status(400).json({success: false, message: 'OTP Expired'})
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({success:true, message: 'Email Verified successfully'})

    }catch(err){
        return res.json({success: false, message: err.message});
    }
}

// check if user is authenticated 
export const isAuthenticated = async (req, res) => {
    try{
        return res.json({success: true});
    }catch(error){
        res.json({success: false, message: error.message});
    }
}

//  Send Password 
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.status(400).json({success:false, message:'Email is required'});
    }

    try{

        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).json({success:false, message: 'User not found'})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting you password`
        };

        await transporter.sendMail(mailOption);

        return res.status(200).json({success: true, message: 'OTP send to your Email'})

    }catch(err){
        return res.status(500).json({success:false, message:err.message});
    }
}


// Reset the user password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword} = req.body;
    
    if(!email || !otp || !newPassword){
        return res.json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    try{
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'})
        }
        
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP Expired'})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: 'Password has been reset successfully'})

    }catch(error){
        return res.json({success: false, message: error.message});
    }
}