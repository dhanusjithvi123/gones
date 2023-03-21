module.exports={
    userLogin:(req,res,next)=>{
        console.log(req?.session);
        if(req.session.username){
            next()
        }else{
            res.redirect('/login')
        }
    },

    adminLogin:(req,res,next)=>{
        if(req.session.adminLogin){
            next()
        }else{
            res.redirect('/admin/login')
        }
    }
}