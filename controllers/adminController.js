const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const AdminModel = require("../models/adminModel");
const CategoryModel = require("../models/categoryModel");
const ProductModel = require('../models/productModel');
const UserModel = require('../models/userModel');
const BannerModel = require('../models/banner')
const couponModel = require('../models/coupon');
const order = require('../models/orderModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');


const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const storage = multer.memoryStorage();
const DataUri = new require("datauri/parser");
const dUri = new DataUri();
const uploadMiddleware = multer({ storage }).array("images", 10);
const uploadSingleImage = multer({ storage }).single("images");
const { cloudinaryConfig, uploader } = require("../config/cloudinary");

const moment = require("moment");
moment().format();




const ObjectId = mongoose.Types.ObjectId;


//const Brand = CategoryModel.brand;
const loginPage = async (req, res, next) => {
  try {
    let adminErr
    let passErr

    req.session.adminErr = null
    req.session.passErr = null
    if (!req.session.adminLogin) {

      res.render('admin/account-login', { title: "Admin Login", login: req.session, adminErr, passErr });

    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    next(error)
  }
}


const homePage = async (req, res, next) => {
  try {
    const orderData = await order.find();
    const userData = await userModel.find();
    const productData = await ProductModel.find();
    const cod = await order.find({ paymentMethod: "COD" }).count();
    const online = await order.find({ paymentMethod: "Online" }).count();
    res.render('admin/home', { title: "Dashboard", productData, userData, orderData, cod, online })
  } catch (error) {
    next(error)
  }
}


const usersPage = async (req, res, next) => {
  try {
    const Users = await UserModel.find();
    let index = 1;

    res.render('admin/users-list', { title: "Users", index, Users })
  } catch (error) {
    next(error)
  }
}


const getCategoryPage = async (req, res) => {
  try {
    const errorData = req.session.error
    req.session.error = null
    const categoryData = await CategoryModel.find({});
    const catData = { name: "Example Category" };
    res.render("../views/admin/categories", {
      errorData, catData,
      categorydetails: categoryData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


const postCategoriesPage = async (req, res) => {
  try {
    let categoryName = req.body.catname.trim();
    const existingCategory = await CategoryModel.findOne({ name: { $regex: `^${categoryName}$`, $options: "i" } });
    if (existingCategory) {
      req.session.error = "Category already exists.";
      res.redirect("/admin/categories");
    } else {
      const category = new CategoryModel({ name: categoryName });
      await category.save();
      res.redirect("/admin/categories");
    }
  } catch (error) {
    console.log(error);
  };
};


const blockCategory = async (req, res, next) => {
  const catId = req.params.id;
  try {
    await CategoryModel.updateOne(
      { _id: catId },
      { $set: { iBlocked: true } }
    ).then(() => {
      return res.redirect("/admin/categories");
    });
  } catch (err) {
    next(err);
  }
};


const unblockCategory = async (req, res, next) => {
  const catId = req.params.id;
  try {
    await CategoryModel.updateOne(
      { _id: catId },
      { $set: { iBlocked: false } }
    ).then(() => {
      return res.redirect("/admin/categories");
    });
  } catch (err) {
    next(err);
  }
};


const productsPage = async (req, res, next) => {
  try {
    const Categories = await CategoryModel.find();
    const Products = await ProductModel.find();
    let index = 1;
    res.render('admin/products-list', { title: "Products", index, Categories, Products })
  } catch (error) {
    next(error)
  }
}


const addProductPage = async (req, res, next) => {
  try {
    const errorData = req.session.error;
    req.session.error = null;

    const categories = await CategoryModel.find();

    const catData = { edit: false, categories, name: "Add Product" };
    res.render("admin/add-product", { catData, errorData });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


const addProduct = async (req, res, next) => {

  try {
    let productname = req.body.productName.trim();

    let categ = req.body.category;

    const existingProduct = await productModel.findOne({ productName: { $regex: `^${productname}$`, $options: "i" } });

    if (existingProduct) {
      req.session.error = "Product already exists.";
      res.redirect("/admin/products/add");
    } else {
      let images = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          const file = dUri.format(
            path.extname(req.files[i].originalname).toString(),
            req.files[i].buffer
          ).content;

          const result = await uploader.upload(file, {
            transformation: [
              { width: 800, height: 880, gravity: "face", crop: "fill" },
            ],
          });
          images.push(result);
        }
      }

      const newProduct = new ProductModel({
        category: req.body.category_id,
        productName: productname,
        description: req.body.productDescription,
        Price: req.body.price,
        Stock: req.body.stock,
        image_url: images
      });

      await newProduct.save();
      res.redirect("/admin/product");
    }
  } catch (err) {
    console.log(err);
    next(err);
  }

}


const doLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminModel.findOne({ email: email });
    if (admin) {
      if (email === admin.email && password === admin.password) {
        req.session.email = req.body.email;

        adminErr = "Email incorrnt"
        passErr = "password incorrnt"
        req.session.adminLogin = true;
        return res.redirect('/admin');
      } else {
        return res.redirect('/admin/login');

      }
    } else {
      return res.redirect('/admin/login');
    }

  } catch (error) {

    next(error)
  }
}


const doLogout = async (req, res, next) => {
  try {
    req.session.adminLogin = false
    req.session.destroy()
    res.redirect('/admin/login')
  } catch (error) {
    next(error)
  }
}


const blockUser = async (req, res, next) => {
  const userId = req.params.id
  try {
    await UserModel.updateOne({ _id: userId }, { $set: { isBlocked: true } }).then(() => {
      return res.redirect('/admin/users')
    })
  } catch (err) {
    next(err)
  }
}


const unblockUser = async (req, res, next) => {
  const userId = req.params.id
  try {
    await UserModel.updateOne({ _id: userId }, { $set: { isBlocked: false } }).then(() => {
      return res.redirect('/admin/users')
    })
  } catch (err) {
    next(err)
  }
}


const viewUser = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id })
    return res.render('admin/user-detail', { title: "user details", user })
  } catch (error) {
    next(error)
  }
}


const addCategory = async (req, res, next) => {
  const cat = req.body.category;
  const isCat = await Category.findOne({ category: cat });


  try {
    if (!isCat) {
      const newCat = Category({
        category: cat
      })
      await newCat.save();
    }
    return res.redirect('/admin/categories');

  } catch (error) {
    next(error);
  }
}


const deleteCategory = async (req, res, next) => {
  const subcat_id = req.params.id;
  try {
    const subcategory = await Subcategory.deleteOne({ _id: subcat_id });
    return res.redirect('/admin/categories');

  } catch (error) {
    next(error);
  }
}


const getCouponPage = async (req, res, next) => {
  const couponData = await couponModel.find()

  try {

    res.render('admin/coupon', { couponData })
  } catch (error) {
    next(error)
  }
}


const postCouponPage = async (req, res) => {
  const data = {
    couponCode: req.body.code || "",
    startDate: new Date(req.body.start),
    endDate: new Date(req.body.end),
    minimumAmount: req.body.mini,
    maximumAmount: req.body.max,
    discount: req.body.discount,
  };

  if (!data.couponCode) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  if (data.startDate > data.endDate) {
    return res.status(400).json({ error: "Start date must be before end date" });
  }

  try {
    const coupon = new couponModel(data);
    await coupon.save();
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error);
  }
}


const getBnner = async (req, res, next) => {
  const bannerData = await BannerModel.find()
  try {
    res.render('admin/banner', { bannerData })
  } catch (error) {
    next(error)
  }
}


const restoreBanner = async (req, res, next) => {
  try {
    const id = req.params.id;
    await BannerModel.updateOne({ _id: id }, { $set: { isDeleted: false } });
    res.redirect("/admin/banner");
  } catch (err) {
    next(err)
  }
};


const deleteBanner = async (req, res, next) => {
  try {

    const id = req.params.id;
    await BannerModel.updateOne({ _id: id }, { $set: { isDeleted: true } })
    res.redirect('/admin/banner');
  } catch (err) {
    next(err)
  }

};


const editProductPage = async (req, res, next) => {
  try {
    const productId = ObjectId(req.params.id);
    const Product = await ProductModel.findOne({ _id: productId });
    const Categories = await CategoryModel.find();
    return res.render('admin/edit-product', { title: "Products :: Edit Product", Product, Categories, })
  } catch (error) {
    next(error)
  }
}


const editProduct = async (req, res, next) => {
  try {
    const productId = req.params.id

    const image = req.files;

    const productimages = image != null ? image.map((img) => img.filename) : null

    await ProductModel.findByIdAndUpdate({ _id: productId },
      {
        $set: {
          productName: req.body.productName,
          description: req.body.description,
          Price: req.body.Price,
          Stock: req.body.Stock,

        }
      })
      .then(() => {
        res.redirect("/admin/Product");
      }).catch((err) => {

        res.redirect("/admin/Product");
      });
  } catch (err) {
    next(err)
  }
}


const flagProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const product = await ProductModel.findOne({ _id: productId });
    if (product.flag) {
      await ProductModel.findByIdAndUpdate({ _id: productId }, { $set: { flag: false } })
    } else {
      await ProductModel.findByIdAndUpdate({ _id: productId }, { $set: { flag: true, blockedDate: new Date } })
    }
    return res.redirect('/admin/product');
  } catch (error) {
    next(error);
  }
}


const addBanner = async (req, res, next) => {
  try {
    const productimages = req.files
    await BannerModel.create({
      bannerText: req.body.bannerText,
      image: productimages,
    }).then((data) => {
      res.redirect('/admin/banner')
    })
  } catch (err) {
    next(err)
  }

};


const editBanner = async (req, res, next) => {
  try {



    const id = req.params.id;
    const editedData = req.body;
    await BannerModel.updateOne(
      { _id: id },
      {

        bannerText: editedData.bannerText,

      }
    ).then(() => {
      res.redirect('/admin/banner');
    })

  } catch (err) {
    next(err)
  }
};



const editcoupon = async (req, res, next) => {
  try {



    const id = req.params.id;
    const editedData = req.body;
   console.log(editedData.couponCode);

    await couponModel.updateOne(
      { _id: id },
      {

        couponCode: editedData.couponCode,
        discount: editedData.discount,
        minimumAmount: editedData.minimumAmount,
        maximumAmount: editedData.maximumAmount,
       
      }
    ).then(() => {
      res.redirect('/admin/Coupon');
    })

  } catch (err) {
    next(err)
  }
};




const deletecoupon = async (req, res, next) => {
  try {
    console.log("enter   ");
    const id = req.params.id;
    await couponModel.updateOne({ _id: id }, { $set: { isBlocked: true } })
    res.redirect('/admin/Coupon');
  } catch (err) {
    next(err)
  }

};



const restorecoupn = async (req, res, next) => {
  try {
    const id = req.params.id;
    await couponModel.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/Coupon");
  } catch (err) {
    next(err)
  }
};



const getorderManagement = async (req, res, next) => {
  try {

    const orderList = await order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },

    ]);




    res.render("../views/admin/adminOrderManagement.ejs", {
      orderList,
    });
  } catch (error) {
    next(error);
  }
};


const orderStatusChanging = async (req, res, next) => {
  try {

    const id = req.params.id;
    const data = req.body;

    await order.updateOne(


      { _id: id },
      {
        $set: {
          orderStatus: data.orderStatus,
          paymentStatus: data.paymentStatus,
        }
      }
    )
    res.redirect("/admin/order-management");
  } catch (err) {
    // next(err)

  }
};


const dashBoardDataGet = async (req, res) => {
  //month wise data
  const FIRST_MONTH = 1
  const LAST_MONTH = 12
  const TODAY = new Date()
  const YEAR_BEFORE = new Date(TODAY)
  YEAR_BEFORE.setFullYear(YEAR_BEFORE.getFullYear() - 1)
  const MONTHS_ARRAY = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const pipeLine = [{
    $match: {
      createdAt: { $gte: YEAR_BEFORE, $lte: TODAY }
    }
  },
  {
    $group: {
      _id: { year_month: { $substrCP: ["$createdAt", 0, 7] } },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year_month": 1 }
  },
  {
    $project: {
      _id: 0,
      count: 1,
      month_year: {
        $concat: [
          { $arrayElemAt: [MONTHS_ARRAY, { $subtract: [{ $toInt: { $substrCP: ["$_id.year_month", 5, 2] } }, 1] }] },
          "-",
          { $substrCP: ["$_id.year_month", 0, 4] }
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      data: { $push: { k: "$month_year", v: "$count" } }
    }
  },
  {
    $addFields: {
      start_year: { $substrCP: [YEAR_BEFORE, 0, 4] },
      end_year: { $substrCP: [TODAY, 0, 4] },
      months1: { $range: [{ $toInt: { $substrCP: [YEAR_BEFORE, 5, 2] } }, { $add: [LAST_MONTH, 1] }] },
      months2: { $range: [FIRST_MONTH, { $add: [{ $toInt: { $substrCP: [TODAY, 5, 2] } }, 1] }] }
    }
  },
  {
    $addFields: {
      template_data: {
        $concatArrays: [
          {
            $map: {
              input: "$months1",
              as: "m1",
              in: {
                count: 0,
                month_year: {
                  $concat: [
                    { $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m1", 1] }] },
                    "-",
                    "$start_year"
                  ]
                }
              }
            }
          },
          {
            $map: {
              input: "$months2",
              as: "m2",
              in: {
                count: 0,
                month_year: {
                  $concat: [
                    { $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m2", 1] }] },
                    "-",
                    "$end_year"
                  ]
                }
              }
            }
          }
        ]
      }
    }
  },
  {
    $addFields: {
      data: {
        $map: {
          input: "$template_data",
          as: "t",
          in: {
            k: "$$t.month_year",
            v: {
              $reduce: {
                input: "$data",
                initialValue: 0,
                in: {
                  $cond: [
                    { $eq: ["$$t.month_year", "$$this.k"] },
                    { $add: ["$$this.v", "$$value"] },
                    { $add: [0, "$$value"] }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  {
    $project: {
      data: { $arrayToObject: "$data" },
      _id: 0
    }
  }]
  const userChart = await userModel.aggregate(pipeLine)
  const product = await productModel.aggregate(pipeLine)
  const orderChart = await order.aggregate(pipeLine)


  console.log(userChart);
  console.log(product);
  console.log(orderChart);


  res.json({
    userChart,
    product,
    orderChart
  })

}




const dashBoardOrderStatus = async (req, res) => {
  try {

    const orderCounts = await order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {};

    orderCounts.forEach(({ _id, count }) => {
      counts[_id] = count;
    });

    res.json({
      delivered: counts['delivered'] || 0,
      pending: counts['pending'] || 0,
      outdelivery: counts['out for Delivery'] || 0,
      ship: counts['shipped'] || 0,
    });

  } catch (error) {
    console.log(error);
  }
}


const productImageEdit = async (req, res, next) => {
  try {

    const public_id = req.params.public_id;
    const product_id = req.params.product_id;

    if (!req.file) {
      throw new Error("No image file provided");
    }

    const file = dUri.format(
      path.extname(req.file.originalname).toString(),
      req.file.buffer
    ).content;
    const result = await uploader.upload(file, {
      transformation: [
        { width: 800, height: 880, gravity: "face", crop: "fill" },
      ],
    });

    await productModel.updateOne(
      { _id: product_id, "image_url.public_id": public_id },
      {
        $set: {
          "image_url.$": result,
        },
      }
    );
    res.redirect("/admin/order-management");
  } catch (error) {
    next(error);
  }
};


const salesReport = async (req, res, next) => {
  try {
    const allsalesReport = await order.find({


      orderStatus: "delivered",
    });

    res.render("admin/salesReport", { allsalesReport });
  } catch (err) {
    console.log(err);
    next(err)
  }
}


const cancelled = async (req, res, next) => {
  try {    


  const cancel = await order.find({

      orderStatus: "cancelled",
 
    }).populate({
      path:'orderItems.productId',
      model:'Products'
    })
    console.log(cancel);

  cancel.forEach(sata => {
    console.log(sata);
    sata.orderItems.forEach(data => {
      console.log(data);
      console.log(data.productId);
      console.log(data.productId.productName);
    })
    })
    res.render("admin/cancel", { cancel });
  } catch (err) {
    console.log(err);
    next(err)
  }
}


const dailyReport = async (req, res, next) => {
  try {
    const allsalesReport = await order.find({
      $and: [
        {

          orderStatus: "delivered"
        },
        {
          orderDate: moment().format("MMM Do YY")
        }
      ]
    })

    res.render("admin/salesReport", { allsalesReport });
  } catch (err) {
    console.log(err);
    next(err)
  }
}


const monthlyReport = async (req, res, next) => {
  try {
    var d = new Date();
    d.setMonth(d.getMonth() - 1);
    const allsalesReport = await order.find({
      $and: [
        { paymentStatus: "paid", orderStatus: "delivered" },
        { created: { $gte: d } }
      ],
    })
    res.render('admin/salesReport', { allsalesReport });
  } catch (err) {
    console.log(err);
    next(err)
  }
}


const categorySales = async (req, res) => {
console.log("ffffffffffffffff");
  const data = await order.find()
    .populate({
      path:'orderItems.productId',
      model:'Products',
      populate: [{
        path:'category',
        model:'Category'
      }]
    })

    
  let categoryName = [];
  let ids = []
  data.forEach((category) => {
    category.orderItems.forEach(data => {
      ids.push(data.productId.category._id)
      categoryName.push(data.productId.category.name)
    })
  });

  const categoryNames = [...new Set(categoryName)];

  let value = ids.reduce((acc, id) => {
    const idString = id.toString();
    acc[idString] = acc[idString] ? acc[idString] + 1 : 1;

    return acc;
  }, {});

  let values = Object.values(value);

  if (categoryNames && values) {
    console.log(values, categoryNames);
    res.json({ success: true, categoryNames, values })
  } else {
    res.json({ success: false })
  }
}



module.exports = {

  loginPage,
  homePage,
  viewUser,
  usersPage,
  productsPage,
  addProductPage,
  addProductPage,
  doLogin,
  doLogout,
  blockUser,
  unblockUser,
  addProduct,
  getCouponPage,
  getBnner,
  addCategory,
  postCouponPage,
  deleteCategory,
  editProductPage,
  editProduct,
  flagProduct,
  addBanner,
  getCategoryPage,
  postCategoriesPage,
  unblockCategory,
  blockCategory,
  editBanner,
  getorderManagement,
  dashBoardDataGet,
  restoreBanner,
  deleteBanner,
  dashBoardOrderStatus,
  orderStatusChanging,
  uploadMiddleware,
  uploadSingleImage,
  productImageEdit,
  salesReport,
  dailyReport,
  monthlyReport,
  cancelled,
  editcoupon,
  deletecoupon,
  restorecoupn,
  categorySales,
}