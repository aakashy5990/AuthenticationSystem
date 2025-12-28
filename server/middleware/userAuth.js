import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if(!token){
        return res.status(401).json({success:false, message: 'Not Authorized. Login again.'})
    }

    try{
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id){
            req.body = req.body || {};
            req.body.userId = tokenDecode.id;
        }else{
            return res.status(401).json({success:false, message: 'Not Authorized. Login again.'})
        }
        next();

    }catch(error){
        res.status(401).json({success: false, message: 'Invalid or expired token.'});
    }

}

export default userAuth;