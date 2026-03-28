import jwt from "jsonwebtoken";
import User from '../models/user.model.js'

const generateToken = async (userID, res) => {

        const accessToken = jwt.sign({userID}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
        const refreshToken = jwt.sign({userID}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
        
        const user = await User.findById(userID)
        user.refreshToken = refreshToken
        await user.save()

        res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 1000*60*15
        })
        res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 1000*60*60*24*7
        })
        return {accessToken, refreshToken}

//     const token = jwt.sign({ userID }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
//     res.cookie('token', token, {
//         httpOnly: true,
//         secure: true, 
//         sameSite: 'strict',
//         maxAge: 1000*60*60*24*7 //7d
//     });
//     return token
};

export default generateToken

/*  FLOw:

        generateToken(user._id, res)
                ↓
        jwt.sign({ userId: user._id }, secret, { expiresIn })
                ↓
        creates token string: "eyJhbG..."
                ↓
        res.cookie('token', "eyJhbG...", { httpOnly... })
                ↓
        cookie attached to response
                ↓
        res.json() sends response WITH cookie attached
                ↓
        browser receives response → stores cookie automatically

*/
