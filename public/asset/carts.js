
function incrementCount(userId, productId, price ,maxQuantity) {
  const baseUrl = window.location.origin;
  let quantity = document.querySelector("#Quantity" + productId);

  let total = document.querySelector("#total-price" + productId);
  let product_price = document.querySelector("#product-price"+productId);
  let total_amount = document.querySelector("#total-amount");



  let currentQuantity = Number(quantity.innerText);
  if (currentQuantity >= maxQuantity) {
    // Replace this line:

    // With this line:
    Swal.fire({
      icon: "warning",
      title: `Out Of Stock`,
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }


  fetch(baseUrl + "/increment-decrement-count/inc", {
    method: "PUT",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      user_id: userId,
    }),
  }).then(() => {
    
    quantity.innerText = Number(quantity.innerText) + 1;
    product_price.innerHTML=(Number(quantity.innerText)  ) * parseInt(price);
    total_amount.innerHTML=parseFloat(total_amount.innerHTML)+parseInt(price)
    // total_amount.innerText = Number(total_amount.innerText) + Number(price);
    // sub_total.innerText = Number(sub_total.innerText) + Number(price);
    // total.innerText = parseInt(total.innerText) + Number(price);
    // console.log(parseInt(total.innerText) + Number(price))
  });
}




function decrementCount(userId, productId, price) {
  let quantity = document.querySelector("#Quantity" + productId);
  let total = document.querySelector("#total-price" + productId);
  let product_price = document.querySelector("#product-price"+productId);
  let total_amount = document.querySelector("#total-amount");
  const baseUrl = window.location.origin;
  if (Number(quantity.innerText) > 1) { 
    fetch(baseUrl + "/increment-decrement-count/dec", {
      method: "PUT",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        user_id: userId,
      }),
    }).then(() => {
      quantity.innerText = Number(quantity.innerText) - 1;
    product_price.innerHTML=(Number(product_price.innerHTML)  ) - parseInt(price);
    total_amount.innerHTML=parseFloat(total_amount.innerHTML)-parseInt(price)
      // quantity.innerText = Number(quantity.innerText) - 1;
      // total.innerText = parseInt(total.innerText) - Number(price);
      // total_amount.innerText = Number(total_amount.innerText) - Number(price);
      // sub_total.innerText = Number(sub_total.innerText) - Number(price);
    });
  } else {
    console.log("error");
  }
}




// Make an AJAX request to update the total price
function updateTotalPrice(quantity, productId) {
  $.ajax({
    url: "/update-total-price",
    type: "POST",
    data: {
      quantity: quantity,
      productId: productId,
    },
    success: function (data) {
      // Update the total price on the page
      $("#total-price").text(data.totalPrice);
    },
  });
}

// cart product delete




function deleteItem(productId, price) {  
  

  let quantity = document.querySelector("#Quantity" + productId);
  let total = document.querySelector("#total-price" + productId);
  let sub_total = document.querySelector("#total-amount1");
  let total_amount = document.querySelector("#total-amount2");
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this item!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      fetch(`/removecart?id=${productId}`, {
        method: "PUT",
      })
        .then((response) => {
          console.log(response);
          const itemRow = document.getElementById(`cart-item-${productId}`);
          if (itemRow) {
            itemRow.remove();
            total.innerText = parseInt(total.innerText) - Number(price);
            total_amount.innerText =
              Number(total_amount.innerText) - Number(price);
            sub_total.innerText = Number(sub_total.innerText) - Number(price);
          }
          // Reload the page after item is deleted
          location.reload();
        })
        .catch((error) => {
          // Handle errors here
          console.error(error);
        });
    }
  });
}

let couponStatus = false;
let coupenTotalAmount = null;
document.getElementById("coupon-code-input").addEventListener("keyup", (e) => {
  if (e.target?.value?.length <= 0) {
    couponStatus = false;
    let total_amount = document.querySelector("#total-amount1");
    if (coupenTotalAmount) {
      total_amount.innerHTML = coupenTotalAmount;
    }
  }
});


function applyCoupon() {
  const couponCode = document.getElementById("coupon-code-input").value;
  let discountamountDiv = document.querySelector("#discountedAmount");
  let total_amount = document.querySelector("#total-amount1");
  console.log(total_amount);
  const amount = total_amount.textContent;
  if (!couponStatus) {
    fetch("/couponcheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ couponCode: couponCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        console.log(data.minimumAmount);
        if (data?.message) {
          Swal.fire({
            icon: "success",
            title: data.message,
          });
        } else {
          if (data.minimumAmount <= total_amount.innerText) {
            coupenTotalAmount = total_amount.innerText;
            const discountAmount = data.discount / 100;
            const totalDiscount = Number(
              total_amount.innerText * discountAmount
            );
            const newTotal = Number(total_amount.innerText - totalDiscount);
            discountamountDiv.value = totalDiscount
            total_amount.innerText = newTotal;
            couponStatus = true;
            Swal.fire({
              icon: "success",
              title: "Coupon applied successfully!",
              text: `Discount: ${totalDiscount.toFixed(
                2
              )}\nNew total: ${newTotal.toFixed(2)}`,
            });
          } else {
            console.log("Minimum amount not met");
            Swal.fire({
              icon: "warning",
              title: "Minimum amount not met",
              text: `The minimum amount required for this coupon is ${data.minimumAmount}`,
            });
          }
        }
      })
      .catch((error) => {
        console.error("Failed to apply coupon:" + error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to apply coupon",
        });
      });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
    });
  }
}




function onlinePayment(userId) {
  const amount = document.querySelector("#totalAmount").innerText;
  const name = document.querySelector("#name").value;
  const state = document.querySelector("#state").value;
  const city = document.querySelector("#city").value;
  const street = document.querySelector("#street").value;
  const email = document.querySelector("#email").value;
  const mobile = document.getElementById("mobile").value;
  const status = document.getElementById("rzp-button1");
  const statusdata = status.getAttribute("data-value");


  if (!name || !state || !city || !street || !email || !mobile) {
    swal({
      title: "Error",
      text: "Please fill in all required fields",
      icon: "error",
      button: "Okay",
    });
    return;
  }

  // Validate email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    swal({
      title: "Error",
      text: "Please enter a valid email address",
      icon: "error",
      button: "Okay",
    });
    return;
  }

  // Validate mobile number
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(mobile)) {
    swal({
      title: "Error",
      text: "Please enter a valid 10-digit mobile number",
      icon: "error",
      button: "Okay",
    });
    return;
  }

  fetch("/order", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      var options = {
        key: "rzp_test_JIKK9QptO5LqSc", // Enter the Key ID generated from the Dashboard
        name: "G One",
        amount: res.order.amount,
        order_id: res.order.id, // For one time payment
        handler: function (response) {
          console.log(response);


          fetch("/confirm-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              state,
              city,
              street,
              email,
              mobile,
              userId,
              statusdata,
              response,
            }),
          })
            .then(() => {
              console.log("Order confirmation successful");
              // Show a sweet alert upon successful payment
                // window.location.href = `/success-page/${userId}`;
                window.location.href = `/trackoder`;

             
            })
            .catch((error) => {
              console.error("Error while confirming order:", error);
            });
        },
      };

      var rzp1 = new Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        swal({
          title: "Payment Failed",
          text: response.error.description,
          icon: "error",
        });
        console.log(response.error);
      });
      rzp1.open();
    })
    .catch((error) => {
      console.error("Error while fetching order:", error);
    });
}





// cashondelivery





function removeProduct(cartId, productId) {
  console.log('working ajax');
  console.log(productId);
  fetch('/removeProduct', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart: cartId, product: productId })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok');
    })
    .then(data => {
      console.log('nhnnnnnnnnnnnnnnnn');
      console.log(data);
      Swal.fire({
        title: 'Product removed from Cart!',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        location.reload();
      });
    })
    .catch(error => console.error(error));
}


function changeItemQty(itemId, prodId, count) {
  fetch('/cart/quantity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      item: itemId,
      product: prodId,
      change: parseInt(count),
      qty: document.getElementById('itemCount' + itemId).innerHTML
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok');
    })
    .then(response => {
      if (response.status) {
        let itemCount = parseInt(document.getElementById('itemCount' + itemId).innerHTML);
        itemCount += parseInt(count);
        document.getElementById('itemCount' + itemId).innerHTML = itemCount;

        let itemPrice = parseInt(document.getElementById('itemPrice' + itemId).innerHTML);
        itemPrice += parseInt(response.price);
        document.getElementById('itemPrice' + itemId).innerHTML = itemPrice;

        document.getElementById('total').innerHTML = response.total;
      }
      if (response.remove) {
        location.reload();
      }
    })
    .catch(error => console.error(error));
}

function addToCart(proId) {
  console.log('add to cart working');
  fetch('/cart/' + proId, { method: 'GET' })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok');
    })
    .then(() => {
      Swal.fire({
        title: 'Product added to Cart',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        location.reload();
      });
    })
    .catch(error => console.error(error));
}
