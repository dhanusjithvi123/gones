const form = document.querySelector('form')
const Image = document.getElementById('images')
const productName = document.getElementById('product_name')
const Price = document.getElementById('price')
const Description = document.getElementById('description')
const Stock = document.getElementById('stock')
const Category = document.getElementById('category-select')
const Brands = document.getElementById('brand')
const errorElement = document.getElementById('alert')



function hideErrorMessage(){
    errorElement.innerHTML = ""
}
function showErrorMessage(message) {
    errorElement.innerHTML = `<div  class="alert alert-danger" role="alert">${message} </div>`
  
}
form.onsubmit=()=> {
   console.log("entered to product validation",1);
   if(Image.files.value === '' ||productName.value  === ''||Price.value  === ''||Description.value  === ''||Stock.value  === ''||Size.value  === ''||Category.value  === ''||subCategory.value === ''){
      showErrorMessage('Fill The Form ')
      return false;
   }
   if ( Image.files.length < 3 || Image.files.value === '' ) {
      showErrorMessage(' Please Select atLeast 3 images')
      return false;
    }
    if(Image.files.length > 3){
      showErrorMessage('Please select a maximum of 3 images')
      return false;
    }
    if (productName.value.length < 5 || productName.value === '' ) {
      showErrorMessage('Product name must be at least 5 characters long')
      return false;
    }

    if (Price.value.length < 0 || Price.value === '' ||Price.value <= 0) {
      showErrorMessage('Price must be a positive number')
      return false;

    }
    
    if (Description.value.length < 30 ||Description.value === '' ) {
      showErrorMessage('Description must be at least 30 characters long')
      return false;
    }

    if(Brands.value.length < 1 ||Brands.value === '' ){
      showErrorMessage('Enter the Brand name')
      return false;
    }

    if (Stock.value < 0||Stock.value === '' ) {
      showErrorMessage('Stock must be a positive number')
      return false;
    }
    if (Size.value < 0|| Size.value === '' ) {
      showErrorMessage('Size must be a positive number')
      return false;
    }
    if (Category.value === '') {
      showErrorMessage('Category is required')
      return false;
    }
    if (subCategory.value === '') {
      showErrorMessage('Subcategory is required')
      return false;
    }
    hideErrorMessage()
      return true;
  }


    
