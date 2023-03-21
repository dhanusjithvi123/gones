const express = require('express');
const router = express.Router();


const controller = require('../controllers/userController');
const Login = require('../middleware/isLogin');





let isLogin =Login.userLogin


/* GET users listing. */
router.get('/',controller.countItem,controller.home);

router.get('/login',controller.countItem,controller.loginPage);

router.get('/signup',controller.signupPage);

router.get('/otpVerify',controller.verifyPage);

router.get('/logout',controller.doLogout)

router.get('/register',controller.getOtp)

router.get('/viewProfile',isLogin,controller.viewProfile)

router.get('/shop',controller.countItem,controller.shop);

router.get('/cart/:id',isLogin,controller.addToCart)

router.get('/viewCart',isLogin,controller.viewCart)

router.get('/editProfile',isLogin,controller.editProfile) 

router.get('/addaddress', controller.countItem, isLogin,controller.addressPage)

router.get('/about' ,isLogin,controller.aboutpage)

router.get('/add-to-wishlist/:id',isLogin,controller.addToWishList)

router.get('/checkout',isLogin,controller.getCheckoutPage,controller.countItem)

router.get("/getAddressDetails/:userid",isLogin,controller.fetchAddress)

router.get("/success-page/:user_id",isLogin,controller.codSuccessPage)

router.get("/trackoder",controller.countItem,isLogin,controller.getorder)

router.get("/forgot-password",controller.countItem,controller.getforgotPasswordPage)

router.get("/alladdress",controller.countItem,isLogin,controller.countItem,controller.getalladdress)

router.get("/product-display",controller.countItem,isLogin,controller.countItem)

router.get("/address-delete",isLogin,controller.userAddressDelete)

router.get("/address-edit",controller.countItem,isLogin,controller.userAddressEdit)

router.get('/cancelOrder/:id',isLogin,controller.cancelOrder)

router.get("/product-details/:product_id",controller.countItem,controller.getproductdetailspage);


// // post
router.post('/register',controller.doSignup,controller.getOtp)

router.post('/registers',isLogin,controller.getOtp)

router.post('/signin',controller.doLogin)

router.post('/verify-user',controller.countItem,controller.verifyUser)

router.post('/postEditProfile',isLogin,controller.postEditProfile)

router.post('/couponcheck',isLogin,controller.couponcheck)

router.post('/order',isLogin,controller.postOrderpage);

router.post("/address",isLogin,controller.postAddressPage);

router.post('/confirm-order',isLogin,controller.paymentConfirm)

router.post("/cashon-delivery",isLogin,controller.postCashonDelivery)

router.post("/update-address/:id",isLogin,controller.updateAddressPage);

router.post('/forgotPassword', controller.countItem,controller.postForgotPassword,controller.getOtp)

router.post('/forgotpasswordotp',controller.countItem,controller.forgotverifyUser )

// put

router.put('/removecart',isLogin,controller.removeCartItemPage)

router.put('/increment-decrement-count/:type',isLogin,controller.postCartIncDec) 

module.exports = router;



















