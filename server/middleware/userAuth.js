import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if(!token){
        return res.status(401).json({sucess:false, message: 'Not Authorized Login Again'})
    }

    try{
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id){
            req.user = { userId: tokenDecode.id };
        }else{
            return res.json({sucess:false, message: 'Not Authorized Login Again'})
        }
        next();

    }catch(error){
        res.status(400).json({sucess: false, message: error.message});
    }

}

export default userAuth;