const order = require("../models/orderModel");
const product = require("../models/productModel");
const user = require("../models/userModel");
const excelJS = require("exceljs");

// export order
const exportorder = async (req, res) => {
  try {
    console.log("enterin ");
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // Set column headers
    worksheet.columns = [
      { header: "S. No.", key: "s_no", width: 10 },
      { header: "Date", key: "date", width: 20 },
      { header: "User Name", key: "user", width: 20 },
     
      { header: "Payment", key: "payment", width: 15 },
    
      { header: "Address", key: "address", width: 40 },
      { header: "Total", key: "total", width: 15 },
    ];

    // Set border for all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Add data to worksheet
    let counter = 1;
    let totalof = 0;
    console.log("1111111111111");
    const saledata = await order.find();
    saledata.map((sale) => {
      sale.s_no = counter;
      sale.date = sale.createdAt.toLocaleDateString();
      sale.order_id = sale._id.toString();
      sale.user = sale.name;

      let items = [];

      sale.orderItems.map(async (item) => {
        product.findById({ _id: item.productId }).then((products) => {
          console.log("products"+products);
        });
      });

      // sale.items = sale.orderItems.map(item => `${item.name} (${item.
      //   quantity})`).join(', ');

      sale.payment = sale.paymentMethod;
      console.log(sale.payment+"1111111111111111111111111111111111111111111111111111111111111111");
      sale.paymentStatus = sale.paymentStatus;
      console.log(sale.paymentStatus);
      sale.orderStatus = sale.orderStatus;
      console.log(sale.orderStatus);
      sale.address = sale.street;
      console.log(sale.address);
      let myValue = sale.totalPrice;
      let newValue = isNaN(myValue) ? 0 : myValue;
      let tot = 1 * newValue;
      totalof += tot;
      console.log(items, "salessssssssssssssss");
      worksheet.addRow({ ...sale, ...items });
      counter++;
    });

    // Add total row
    worksheet.addRow({ date: "Total", total: totalof });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales_Report.xlsx`
    );

    // Write workbook to response
    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  exportorder,
};
