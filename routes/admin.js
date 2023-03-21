const express = require('express');

const router = express.Router();
const Login = require('../middleware/isLogin');
const session = require('express-session');
const {upload}=require('../mn/multer');
const salesReport =require("../mn/export")


  //session setup
  const oneHour = 1000*60*60;
  router.use(session({
      secret: "key",
      resave: true,
      saveUninitialized: true,
      cookie: {maxAge: oneHour}
  }))



//Cache Control
router.use((req,res,next)=>{
    res.set('Cache-Control','no-store');
    next();
})


const controller = require('../controllers/adminController');
let isLogin =Login.adminLogin






router.get('/', isLogin,controller.homePage);

router.get('/login',controller.loginPage);

router.get('/logout',controller.doLogout)

router.get('/home',controller.usersPage);

router.get('/product', isLogin,controller.productsPage);

router.get('/addproduct', isLogin,controller.addProductPage);

router.get('/categories',isLogin,controller.getCategoryPage,);

router.get('/products/add', isLogin,controller.addProductPage);

router.get('/users', isLogin,controller.usersPage);

router.get('/users/details/:id', isLogin,controller.viewUser);

router.get('/blockUser/:id', isLogin,controller.blockUser);

router.get('/coupon', isLogin,controller.getCouponPage);

router.get('/unBlockUser/:id', isLogin,controller.unblockUser); 

router.get('/banner', isLogin,controller.getBnner);

router.get('/blockCategory/:id',isLogin,controller.blockCategory);

router.get('/unblockCategory/:id',isLogin,controller.unblockCategory)

router.get('/products/edit/:id', isLogin,controller.editProductPage);

router.get('/products/flag/:id', isLogin,controller.flagProduct);

router.get('/order-management',isLogin,controller.getorderManagement)

router.get('/Coupon', isLogin,controller.getCouponPage);

router.get("/exportorder", salesReport.exportorder)

router.get("/get-month-wise-data",isLogin,controller.dashBoardDataGet)

router.get("/get-order-status",controller.dashBoardOrderStatus)

router.get('/restoreBanner/:id', isLogin,controller.restoreBanner);

router.get('/deleteBanner/:id',isLogin,controller.deleteBanner);

router.get('/deletecoupon/:id',isLogin,controller.deletecoupon);

router.get('/restorecoupon/:id', isLogin,controller.restorecoupn);

router.get("/get-month-wise-data",isLogin,controller.dashBoardDataGet)

router.get('/salesReport',isLogin,controller.salesReport);

router.get('/dailyReport',isLogin, controller.dailyReport);

router.get('/monthlyReport',isLogin,controller.monthlyReport);

router.get('/cancel',isLogin,controller.cancelled);



// post 



router.post('/signin',controller.doLogin);

router.post('/add-categories',isLogin,controller.postCategoriesPage);

router.post('/products/add-product',controller.uploadMiddleware,controller.addProduct);

router.post('/products/edit-product/:id',controller.editProduct);

router.post('/addBanner',upload, isLogin,controller.addBanner);

router.post('/editBanner/:id',isLogin,controller.editBanner);

router.post('/editcoupon/:id',isLogin,controller.editcoupon);

router.post("/coupon",isLogin,controller.postCouponPage)

router.post('/order-statuschange/:id',isLogin,controller.orderStatusChanging)

router.post('/image-edit/:public_id/:product_id',isLogin,controller.uploadSingleImage,controller.productImageEdit)

router.post('/categorySales',isLogin,controller.categorySales);

module.exports = router;