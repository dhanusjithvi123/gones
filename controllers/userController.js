const bcrypt = require('bcrypt');
const db = require('../config/connection');
const mongoose = require('mongoose');
const sendOtp = require("../mn/nodemailer");
const UserModel = require("../models/userModel");
const ProductModel = require("../models/productModel");
const CategoryModel = require("../models/categoryModel");
const carts = require("../models/cart");
const wishlist = require('../models/wishlist');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel')
const BannerModel = require('../models/banner')
const couponModel = require('../models/coupon')
const moment = require("moment");
moment().format();
const Razorpay = require("razorpay");
const cart = require('../models/cart');
const productModel = require('../models/productModel');

let count = { cart: 0, }


userErr = '';
passErr = '';





const signupPage = async (req, res, next) => {
  try {
    let error = req.session.error;
    let succ = req.session.succ;
    req.session.error = null;
    req.session.succ = null;
    
    res.render('user/signup', { title: "SignUp", login: req.session, count, error })
  } catch (error) {
    next(error)
  }
}


const verifyPage = async (req, res, next) => {
  try {
    if (!req.session.userLogin) {
      res.render('user/otpVerify', { title: "Verification", login: req.session })
    } else {
      res.redirect('/');
    }
  } catch (error) {
    next(error)
  }
}


const loginPage = async (req, res, next) => {
  try {
    if (!req.session.userLogin) {
      res.render('user/login', { title: "Login", login: req.session, count });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    next(error)
  }
}


const home = async (req, res, next) => {
  const user = req.session
  try {
    const categoryData = await CategoryModel.find({ iBlocked: false }, { name: 1 });
    const bannerData = await BannerModel.find({ isDeleted: false })
    const Products = await ProductModel.find({ flag: false }).limit(12)
    return res.render('user/index', { title: "Home", login: req.session, user, bannerData, count, Products ,categoryData});
  } catch (error) {
    next(error)
  }
}


const aboutpage = async (req, res, next) => {
  try {
    const categoryData = await CategoryModel.find({ iBlocked: false }, { name: 1 });
    return res.render('user/about', { title: "Home", login: req.session, count,categoryData });
  } catch (error) {
    next(error)
  }

}


const doLogout = async (req, res, next) => {
  try {
    req.session.userLogin = false
    req.session.destroy()
    res.redirect('/')
  } catch (error) {
    next(error)
  }
}


const viewProfile = async (req, res, next) => {
  try {
    const categoryData = await CategoryModel.find({ iBlocked: false }, { name: 1 });
    const email = req.session.userEmail;
    let userid = await userModel.findOne({ email: email });
    const userData = await UserModel.findOne({ _id: userid._id })
    res.render('user/profile', { login: req.session, userData: userData, count,categoryData })

  } catch (error) {
    next(error)
  }
}


const getalladdress = async (req, res) => {
  try {
    const email = req.session.userEmail;
    let userid = await userModel.findOne({ email: email });
    const userDatas = await UserModel.findOne({ _id: userid._id })
    res.render('user/addresslist', { login: req.session, userDatas: userDatas, count })

  } catch (error) {
    next(error)
  }
}



const editProfile = async (req, res, next) => {
  try {
    let userData = await UserModel.findOne({ _id: req.session.user.id })
    res.render('user/editprofile', { userData })
  } catch (error) {
    next(error)
  }
}



const userAddressDelete = async (req, res, next) => {
  try {
    const id = req.query.id;
    await userModel.updateOne(
      {},
      { $pull: { addressDetails: { _id: id } } }
    );
    res.redirect("/alladdress");
  } catch (error) {
    res.status(500).send("Error deleting address");
    next(error)
  }
};



const shop = async (req, res) => {
  try {
    const perPage = 12;
    const page = parseInt(req.query.page) || 1;
    const sortOption = req.query.sort || 'created_at';
    const categoryData = await CategoryModel.find({ iBlocked: false }, { name: 1 });
    const filter = {};
    const category = req.query.category;
    const searchKeyword = req.query.search || '';
    if (category) {
      filter.category = category;
    }
    if (searchKeyword) {
      filter.productName = { $regex: new RegExp(searchKeyword, 'i') };
    }
    let sort = {};
    switch (sortOption) {
      case 'low-to-high':
        sort = { Price: 1 };
        break;
      case 'high-to-low':
        sort = { Price: -1 };
        break;
      case 'name-ascending':
        sort = { productName: 1 };
        break;
      case 'name-descending':
        sort = { productName: -1 };
        break;
      default:
        sort = { created_at: -1 };
        break;
    }
    
    const countQuery = category ? { ...filter, category } : filter;
    const totalCount = await productModel.countDocuments(countQuery);
    const totalPages = Math.ceil(totalCount / perPage);
    const nextPage = (page < totalPages) ? page + 1 : null;
    const prevPage = (page > 1) ? page - 1 : null;
    const Products = await productModel.find(filter)
      .sort(sort)
      .skip((perPage * (page - 1)))
      .limit(perPage);
    res.render('../views/user/shop.ejs', {
      Products,
      catData: categoryData,
      selectedCategory: req.query.category,
      req: req,
      totalCount,
      currentPage: page,
      totalPages,
      nextPage,
      prevPage,
      searchKeyword,
      sortby: sortOption,
      // selectedCategory: category,
      count,
      login: req.session,
      categoryData,
    });
  } catch (error) {
    console.log(error.message);
  }
};






const getproductdetailspage = async (req, res, next) => {

  try {
    let email = req.session.userEmail;
    const Products = await productModel.find()
    const categoryData = await CategoryModel.find({ iBlocked: false }, { name: 1 });
    productModel.findById({ _id: req.params?.product_id }).then((product) => {
      res.render("user/productover", {
        product, ses: req.session.userEmail,
        login: req.session, count, Products,
        categoryData

      });
    });

  } catch (error) {
    next(error)
  }
};






const chackout = async (req, res, next) => {
  try {
    res.render('user/chackout', { title: "Shop", login: req.session, count })
  } catch (error) {
    next(error)
  }
}

const addToWishList = async (req, res) => {

  const id = req.params.id
  const objId = mongoose.Types.ObjectId(id)
  const session = req.session.user

  let proObj = {
    productId: objId
  }
  const userData = await user.findOne({ email: session })
  const userWishlist = await wishlist.findOne({ userId: userData._id })
  if (userWishlist) {

    let proExist = userWishlist.product.findIndex(
      (product) => product.productId == id
    );
    if (proExist !== -1) {
      res.redirect('/viewWishList')
    } else {

      wishlist.updateOne(
        { userId: userData._id }, { $push: { product: proObj } }
      ).then(() => {
        res.redirect('/viewWishList')
      })
    }

  } else {
    const newWishlist = new wishlist({
      userId: userData._id,
      product: [
        {
          productId: objId
        },
      ]
    });
    newWishlist.save().then(() => {

      res.redirect('/viewWishList')
    })
  }

}








const viewWishList = async (req, res) => {
  const session = req.session.user
  const userData = await user.findOne({ email: session })
  const userId = userData._id

  const wishlistData = await wishlist
    .aggregate([
      {
        $match: { userId: userId }
      },
      {
        $unwind: "$product"
      },
      {
        $project: {
          productItem: "$product.productId",
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productItem",
          foreignField: "_id",
          as: "productDetail"
        }
      },
      {
        $project: {
          productItem: 1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] }
        }
      }
    ]);
  countWishlist = wishlistData.length
  res.render('user/wishlistpage', { wishlistData, countWishlist, countInCart })
}




// post 

const doLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      req.session.userLogin = false;
      req.session.userErr = "User dont exist";
      return res.redirect('/login');
    }
    if (user.isBlocked) {
      req.session.userLogin = false;
      req.session.userErr = "User is blocked";
      return res.redirect('/login');
    }
    const isPass = await bcrypt.compare(password, user.password);
    if (!isPass) {
      req.session.userLogin = false;
      req.session.passErr = "Wrong password";
      return res.redirect('/login');
    }
    req.session.passErr = "";

    req.session.username = user.name
    req.session.userId = user._id
    req.session.userEmail = user.email
    req.session.userLogin = true
    res.redirect('/');
  } catch (error) {
    next(error)
  }
}


const verifyUser = async (req, res, next) => {
  try {

    if (req.body.otp == otp) {
      await UserModel.findOneAndUpdate({ email: req.session.email }, { $set: { verified: true } })
        .then(() => {
          otp = "";
          res.redirect('/login')

        })
        .catch((error) => {
          next(error)
        })

    } else {
      return res.redirect('/verify', { count })

    }
  } catch (error) {
    next(error)
  }
}





const doSignup = async (req, res, next) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      // If a user with the provided email already exists, redirect to the signup page with an error message
      req.session.error = "Email Already Exists";
      res.redirect("/signup");
    } else {
      // If the email is not already in use, create a new user object and save it to the database
      const newUser = new UserModel({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: await bcrypt.hash(req.body.password, 10),
      });

      await newUser
        .save()
        .then(() => {
          next();
        })
        .catch((error) => {
          console.log(error);
          res.redirect("/registers");
          console.log("enter registers");

        });

    }
  } catch (error) {
    // If there is an error, log it and return an error message to the user
    console.error(error);
    res.status(500).send("An error occurred while registering your account. Please try again later.");
  }
};


const getOtp = async (req, res, next) => {
  console.log("enter the get otp");
  let email = req.body.email

  console.log(email);

  otp = Math.floor(100000 + Math.random() * 900000);
  await sendOtp.sendVerifyEmail(email, otp)
    .then(() => {
      res.redirect('/otpverify');
    }).catch((error) => {
      next(error)
    })

}

const postEditProfile = async (req, res, next) => {
  try {
    await UserModel.updateOne(

      { _id: req.session.user.id },
      {

        $set: {

          name: req.body.name,
          mobile: req.body.phone,
          addressDetails: [
            {
              housename: req.body.housename,
              area: req.body.area,
              landmark: req.body.landmark,
              district: req.body.district,
              state: req.body.state,
              postoffice: req.body.postoffice,
              pin: req.body.pin,
            },
          ],
        }

      }
    )
    res.redirect('/viewProfile', { count })

  } catch (error) {
    next(error);
  }
}


const addToCart = async (req, res) => {

  try {
    const email = req.session.userEmail;
    const user = await userModel.findOne({ email: email });

    let userCart = await carts.findOne({ userId: user._id });
    if (!userCart) {
      userCart = await carts.create({ userId: user._id });
    }

    const productId = req.params.id;
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    const existingItem = userCart.cartItems.find(item => item.productId == productId);
    if (existingItem) {
      await carts.updateOne(
        { userId: user._id, 'cartItems.productId': productId },
        { $inc: { 'cartItems.$.qty': 1 } }
      );
    } else {
      await carts.updateOne(
        { userId: user._id },
        { $push: { cartItems: { productId: productId, qty: 1 } } }
      );
    }

    res.redirect('/shop');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


const viewCart = async (req, res, next) => {
  try {

    const email = req.session.userEmail;


    const user = await userModel.findOne({ email: email });

    const userId = user._id;


    const cartList = await carts.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$cartItems",
      },
      {
        $lookup: {
          from: "products",
          localField: "cartItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },

    ]);

    const sum = cartList.reduce((accumulator, object) => {
      accumulator = accumulator + object.product.srp;
      return accumulator;
    }, 0);

    let userData = await UserModel.findOne({ _id: req.session.userId })


    countInCart = cartList.length


    res.render("user/cart.ejs", {
      cartList: cartList, sum,
      userId: req.session.userEmail, countInCart, userData, login: req.session, count
    });

  } catch (error) {
    next(error);
  }

}


const removeCartItemPage = async (req, res) => {
  try {
    console.log("enter");
    // if( req.query.id==null)
    const id = req.query.id;
    console.log(id+"iddd");
    carts.updateOne(
      {},
      { $pull: {cartItems: { productId: id } } },
      function (err) {
        if (err) {
          console.error(err);
          console.log("enter 1");
          res.status(500).send({ message: "Failed to remove item" });
        } else {
            console.log(" enterr");
          res.status(200).send({ message: "Item removed successfully" });
        }
      }
    );
  } catch (error) {

    res.status(500).send({ message: "Failed to remove item" });
  }
};


const postCartIncDec = async (req, res, next) => {
  try {
    const type = req.params.type;
    const userId = req.body.user_id;
    const productId = req.body.product_id;


    let update = {};
    if (type === "inc") {
      update = { $inc: { "cartItems.$.qty": 1 } };
    } else if (type === "dec") {
      update = { $inc: { "cartItems.$.qty": -1 } };
    } else {
      return res
        .status(400)
        .json({
          error: "Invalid type parameter. Only 'inc' or 'dec' are allowed.",
        });
    }

    const result = await carts.updateOne(
      { userId: userId, "cartItems.productId": productId },
      update
    );

    if (result.nModified === 0) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    res.json({
      msg: "Cart item quantity updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};


const addressPage = async (req, res, next) => {
  try {

    res.render('user/addadress', { count, login: req.session })

  } catch (error) {
    next(error)
  }
}


const postAddressPage = async (req, res) => {
  let email = req.session.userEmail;


  try {
    let email = req.session.userEmail;
    await UserModel.updateOne(
      { email: email },
      {
        $push: {
          addressDetails: {
            Fullname: req.body.name,
            mobile: req.body.mobile,
            email: req.body.email,
            countryname: req.body.country,
            city: req.body.town,
            state: req.body.state,
            houseaddress: req.body.address,
            postal_code: req.body.zip,
          },
        },
      }
    );

    res.redirect("/addaddress");
  } catch (error) {
    console.error(error);
  }
};


const couponcheck = async (req, res, next) => {
  try {

    console.log();

    const couponCode = req.body.couponCode;
    console.log(req.session.userId + "fffffff");
    console.log(couponCode + "vcodeee");
    const user = await userModel.findOne({ _id: req.session.userId });
    const userId = req.session.userId;
    console.log(userId + "uuuuuuuuuuuser");
    const couponUsed = await userModel.findOne({
      _id: userId,
      coupondata: {
        $elemMatch: {
          coupons: couponCode,
        },
      },
    });
    console.log("data entre");
    if (couponUsed) {
      return res
        .status(400)
        .json({ status: 400, message: "Coupon has already been used." });
    }
    const coupon = await couponModel.findOne({ couponCode });
    console.log(coupon + "ggggggggggg");


    if (!coupon) {
      return res.status(404).json({ status: 404, message: "Coupon not found" });
    }

    console.log(req.body.totalAmount);

    const total_amount = req.body.totalAmount;

    console.log(total_amount);

    console.log(coupon.minimumAmount);

    if (coupon.minimumAmount > total_amount) {
      console.log("data enter");

      console.log(coupon.minimumAmount);

      return res.status(400).json({
        status: 400,
        message: `Minimum amount required for this coupon is ${coupon.minimumAmount}`,
      });
    }
    console.log(coupon + "coupon");

    console.log(coupon.minimumAmount + "minimam");


    return res.status(200).json(coupon);


  } catch (error) {
    next(error);
  }
};



const getCheckoutPage = async (req, res, next) => {

  try {
    const couponCode = req.query.couponCode;
    console.log(req.query);
    const email = req.session.userEmail;
    const user = await userModel.findOne({ email: email });

    const userId = user._id;

    const cartList = await carts.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$cartItems",
      },
      {
        $lookup: {
          from: "products",
          localField: "cartItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
    ]);
    let total = req.session?.totalAmount;
    res.render("../views/user/checkout.ejs", {
      cartList: cartList,
      userData: user,
      userId: userId,
      count,
      user: user,
      totalAmount: total,
      discountAmount: req.query?.discountedAmount,
      couponCode: couponCode,
      ses: req.session.userEmail

    });
  } catch (error) {
    next(error)
  }
}



const fetchAddress = async (req, res) => {
  try {
    const addressId = req.params.userid;
    const email = req.session.userEmail;
    const userData = await userModel.findOne({ email });
    const addressDetails = userData.addressDetails.id(addressId);
    if (!addressDetails) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.json(addressDetails);
  } catch (error) {

    res.status(500).json({ message: 'Internal server error' });
  }
}



const postOrderpage = async (req, res) => {
  console.log("online payment 234567889900");
  const amount = req.body.amount
  const razorpayInstance = new Razorpay({
    // key_id:process.env.KEY_ID,
    key_id: "rzp_test_JIKK9QptO5LqSc",
    key_secret: "WA4zv0MmJR7F5GuBdUV082Qd"

  })
  razorpayInstance.orders.create({

    amount: amount * 100,
    currency: "INR"
  }, (err, order) => {
    console.log("online payment2");
    res.json({ success: true, order, amount })
  })
}



const paymentConfirm = async (req, res) => {
  const userId = req.body.userId
  const couponCode = req.body.couponCode;
  console.log(couponCode + "gggggggggggggg");
  try {
    const razorpayInstance = new Razorpay({
      key_id: "rzp_test_JIKK9QptO5LqSc",
      key_secret: "WA4zv0MmJR7F5GuBdUV082Qd",
    });
    const order = await razorpayInstance.orders.fetch(req.body.response.razorpay_order_id)
    if (order.status === 'paid') {


      const cartList = await cart.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $unwind: "$cartItems",
        },
        {
          $lookup: {
            from: "products",
            localField: "cartItems.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$product",
        },
      ]);

      await userModel.updateOne(
        { _id: userId },
        { $push: { coupondata: { coupons: req.body.couponCode } } }
      );
      const newOrder = new orderModel({

        // userId: req.session.user.userId
        orderItems: cartList.map((item) => ({
          productId: item.product._id,
          quantity: item.cartItems.qty,
        })),
        products: req.session.orderedItems,
        totalPrice: order.amount / 100,
        order_id: req.body.response.razorpay_order_id,
        name: req.body.name,
        state: req.body.state,
        city: req.body.city,
        street: req.body.street,
        mobile: req.body.mobile,
        email: req.body.email,
        paymentMethod: req.body.statusdata,
        userId: userId
      })

      newOrder.save().then(async (data) => {
        req.session.orderedItems = null
        res.json({ status: true, message: "order placed" })
        await cart.deleteMany({ userId: userId });

      }).catch(() => {
        res.json({
          status: false, message: "order not placed"
        })
      })
    } else {
      res.json({
        status: false, message: "order not placed"
      })
    }
  } catch (err) {

  }
}



const countItem = async (req, res, next) => {
  try {
    const userId = req.session.userId
    const carts = await cart.findOne({ userId: userId })
    // ?? nullish operator

    if (carts) {
      count.cart = carts.cartItems.length ?? 0
    } else {
      count.cart = 0

    }
    next()
  } catch (error) {
    next(error)
  }
}


const postCashonDelivery = async (req, res) => {
  try {

    const userId = req.query.userId;

    const cartList = await carts.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$cartItems",
      },
      {
        $lookup: {
          from: "products",
          localField: "cartItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
    ]);

    let orderId = 'G One00001';

    const newOrder = new orderModel({
      orderItems: cartList.map((item) => ({
        productId: item.product._id,
        quantity: item.cartItems.qty,
      })),
      products: req.session.orderedItems,
      totalPrice: req.body.amount,
      order_id: orderId, // use the generated orderId here
      name: req.body.name,
      state: req.body.state,
      city: req.body.city,
      street: req.body.street,
      mobile: req.body.mobile,
      email: req.body.email,
      paymentMethod: "COD",
      userId: userId,
    });
    console.log("Enter cashonDelivery2");
    // Save the new order to the database
    await newOrder.save();

    // Update the product table quantity
    for (const item of cartList) {
      await productModel.updateOne(
        { _id: item.product._id },
        { $inc: { quantity: -item.cartItems.qty } }
      );
    }

    // Clear the ordered items from the session and the cart items from the database
    req.session.orderedItems = null;
    await cart.deleteMany({ userId: userId });

    res.status(200).send({ orderId });
  } catch (err) {
    console.error(`Error Product Remove:`, err);
    res.status(500).send("Internal server error");
    res.redirect("/");
  }
};



const codSuccessPage = async (req, res, next) => {
  try {

    res.render("../views/user/successPage.ejs", { login: req.session })
  } catch (error) {
    next(error)
  }
}

const getorder = async (req, res, next) => {
  try {
    const email = req.session.userEmail;
    const userData = await userModel.findOne({ email });
    const userId = userData._id;

    const orderList = await orderModel.aggregate([
      {
        $sort: { "createdAt": -1 },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
        }
      },

    ]);

    console.log(userData + "user data");
    console.log(orderList + "oderList");
    console.log(userId + "dataid");
    res.render("../views/user/orders", {
      login: req.session,
      userDatas: userData,
      orderList,
      Dataid: userId,
    });
  } catch (error) {
    next(error);
  }
};





const getforgotPasswordPage = async (req, res) => {

  try {

    res.render("../views/user/forgotPasswordPage.ejs", { login: req.session, count })
  } catch (error) {
    console.log(error);
  }
}




const cancelOrder = async (req, res, next) => {
  try {
    console.log(req.params.id + "idddddd");


    await orderModel.updateOne({ _id: req.params.id }, { $set: { orderStatus: "cancelled" } })
    res.redirect("/trackoder");
  } catch (err) {
    next(err)
  }

};



const postForgotPassword = async (req, res, next) => {
  try {
    const { email, } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      userErr = 'user doesnot exist';
      req.session.userLogin = false;
      return res.redirect("/forgot-password");

    }
    if (user.isBlocked) {
      userErr = 'sorry user blocked';
      req.session.userLogin = false;
      return res.redirect('/forgot-password');
    }

    console.log("enter the get otp");


    console.log(email);

    otp = Math.floor(100000 + Math.random() * 900000);
    await sendOtp.sendVerifyEmail(email, otp)
      .then(() => {
        res.render('user/forgototp');
      }).catch((error) => {
        next(error)
      })

  } catch (error) {
    next(error)
  }
};




const forgotverifyUser = async (req, res, next) => {


  try {


    if (req.body.otp == otp) {

      await UserModel.findOneAndUpdate({ email: req.session.email }, { $set: { verified: true } })
        .then(() => {
          otp = "";
          res.render('user/resetpassword')

        })
        .catch((error) => {
          next(error)
        })

    } else {
      return res.redirect('/verify', { count })

    }
  } catch (error) {
    next(error)
  }
}



const userAddressEdit = async (req, res, next) => {
  try {

    console.log("hiiiiiii");

    const addressId = req.query.addressId;
    const email = req.session.userEmail;
    const userData = await userModel.findOne({ email: email });

    const address = userData.addressDetails.find(
      (address) => address._id.toString() === addressId
    );

    res.render("../views/user/addressEditPage.ejs", {
      login: req.session,
      address: address,
      count
    });
  } catch (error) {
    next(error)
  }
};




const updateAddressPage = async (req, res, next) => {
  const addressid = req.params.id;

  try {
    const email = req.session.userEmail;
    await userModel.updateOne(
      { email: email, "addressDetails._id": addressid },
      {
        $set: {
          "addressDetails.$.Fullname": req.body.name,
          "addressDetails.$.mobile": req.body.mobile,
          "addressDetails.$.email": req.body.email,
          "addressDetails.$.city": req.body.town,
          "addressDetails.$.state": req.body.state,
          "addressDetails.$.houseaddress": req.body.address,
        },
      }
    );
    res.redirect("/alladdress");
  } catch (error) {
    next(error)
  }
};


const forgotNewPassword = async (req, res, next) => {

  try {
console.log(req.body);
    const email = req.session.email
  console.log(email);
    const password = req.body.password
    const hash = await bcrypt.hash(password,10)
    if (password === req.body.conPassword) {

      await userModel.findOneAndUpdate(
        { email: email },
        { $set: { password: hash } })

      res.render('user/login')

    } else {

      res.render('user/changePassword', { email, invalid: 'Password must be same' })
    }


  } catch (err) {
    console.log(err);
  }

};


module.exports = {

  home,
  doLogout,
  verifyUser,
  doSignup,
  loginPage,
  signupPage,
  verifyPage,
  shop,
  getOtp,
  doLogin,
  viewProfile,
  viewCart,
  addToCart,
  editProfile,
  postEditProfile,
  chackout,
  addToWishList,
  viewWishList,
  removeCartItemPage,
  postCartIncDec,
  addressPage,
  postAddressPage,
  getCheckoutPage,
  couponcheck,
  fetchAddress,
  postOrderpage,
  paymentConfirm,
  countItem,
  codSuccessPage,
  postCashonDelivery,
  getorder,
  getforgotPasswordPage,
  postForgotPassword,
  getalladdress,
  userAddressEdit,
  updateAddressPage,
  userAddressDelete,
  cancelOrder,
  aboutpage,
  getproductdetailspage,
  forgotverifyUser,
  forgotNewPassword,
}    