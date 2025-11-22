console.clear();


//Api 路徑
const baseUrl = 'https://livejs-api.hexschool.io/';
const apiPath = 'scarlett';

const customerApi = `${baseUrl}api/livejs/v1/customer/${apiPath}`;

//取得所有資料
let productData = [];

function getProduct(){
  
axios.get(`${customerApi}/products`).then(res=>{
  productData = res.data.products;
  renderProduct(productData);  // 這個要渲染 取得全部產品資料的空陣列內容
  
}).catch(error=>{
  console.log(error);
})
  }



//炫染卡片全產品

const productWrap = document.querySelector('.productWrap');
function renderProduct(data){
  let str = '';
  data.forEach(item=>{
    str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${formatNumber(item.price)}</p>
            </li>`;
  });
  productWrap.innerHTML = str ;
}

//製作篩選器

function filterProduct(value){
  let filterResult = [];
  productData.forEach(item=>{
    if(item.category === value){
      filterResult.push(item);
    }else if(value === "全部"){
      filterResult.push(item);
    }
  });
  renderProduct(filterResult);
}

//篩選器監控按鈕事件
const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change',(e)=>{
   e.preventDefault();
   filterProduct(e.target.value)
})

// 取得 我的購物車

let cartData = [];
let cartTotal = 0;

function getCart(){
axios.get(`${customerApi}/carts`).then(res=>{
  cartData = res.data.carts;
  cartTotal = res.data.finalTotal;
  // 這個要渲染 取得全部產品資料的空陣列內容
  renderCart(cartData);  
}).catch(error=>{
  console.log(error);
});
}
 
// 購物車表身 body 
const shoppingCartTableBody = document.querySelector('.shoppingCart-table tbody');
const shoppingCartTableFoot = document.querySelector('.shoppingCart-table tfoot');

function renderCart(){
  if(cartData.length === 0){
  shoppingCartTableBody.innerHTML = '商品目前為空，請選購' ;
  shoppingCartTableFoot.innerHTML = '';
    return;
  }
  
  let str = '';
  cartData.forEach(item=>{
    str += `<tr data-id=${item.id} >
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${formatNumber(item.product.price)}</td>
                    <td>
                      <button type="button" class="minusBtn"> - </button>
                      ${item.quantity}
                      <button type="button" class="addBtn"> + </button>
                  </td>
                    <td>NT$${formatNumber(item.product.price * item.quantity)}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons clearBtn">
                            X
                        </a>
                    </td>
                </tr>`; 
  });
  shoppingCartTableBody.innerHTML = str ;
  shoppingCartTableFoot.innerHTML = `<tr>
                    <td>
                        <a href="#" class="discardAllBtn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${cartTotal}</td>
                </tr>`;
}

//取得post 新增購物車功能

function postCart(id,quantity){
  //新增成功 提示功能 放在 post
   Toast.fire({
  icon: "success",
  title: "您的商品添加成功❤️"
});
  
  const data = {
  "data": {
    "productId": id,
    "quantity": quantity
  }
}
  
axios.post(`${customerApi}/carts`,data).then(res=>{
  cartData = res.data.carts;
  cartTotal = res.data.finalTotal;
  // 這個要渲染 取得全部購物車資料的空陣列內容
  renderCart(cartData);  
}).catch(error=>{
  console.log(error);
});
}

// 新增購物車 監聽功能
// productWrap.addEventListener('click',(e)=>{
//    e.preventDefault();
//    if(e.target.classList.contains('addCardBtn')){
//       postCart(e.target.dataset.id);
//    }

//    // 偉杰老師的加入購物車立刻新增數字寫法
//   const productId = e.target.dataset.id;

//    let qty = 1;
//    cartData.forEach(item=>{
//      if(item.product.id === productId){
//        qty = item.quantity += 1 ;
//      }
//   });
//     postCart(productId,qty)
// })


// 新增購物車 監聽功能 2 修改後可以點加入購物車就新增數字

productWrap.addEventListener('click', (e) => {
  e.preventDefault();
  
  const btn = e.target.closest('.addCardBtn');
  if (!btn) return;

  const productId = btn.dataset.id;

  let quantity = 1;

  cartData.forEach(item => {
    if(item.product.id === productId){
      quantity = item.quantity + 1;
    }
  });

  postCart(productId, quantity);
});


// delete 刪除所有品項

function deleteAllCart(){
  
axios.delete(`${customerApi}/carts`).then(res=>{
  cartData = res.data.carts;
  cartTotal = res.data.finalTotal;
  // 這個要渲染 取得全部產品資料的空陣列內容
  renderCart(cartData);  
  
}).catch(error=>{
  console.log(error);
});
}

// 刪除所有品項 點擊監聽
shoppingCartTableFoot.addEventListener('click',(e)=>{
   e.preventDefault();
   if(e.target.classList.contains('discardAllBtn')){
     deleteAllCart();
   };
})

// delete 單一刪除 id 品項

function deleteOneCart(id){
axios.delete(`${customerApi}/carts/${id}`).then(res=>{
  cartData = res.data.carts;
  cartTotal = res.data.finalTotal;
  // 這個要渲染 取得全部產品資料的空陣列內容
  renderCart();  
}).catch(error=>{
  console.log(error);
});
}


// 修改數量 patch 

function updateCart(id,qty){
  const data = {
  "data": {
     id,
    "quantity": qty
  }
}
  
axios.patch(`${customerApi}/carts`,data).then(res=>{
  cartData = res.data.carts;
  cartTotal = res.data.finalTotal;
  // 這個要渲染 取得全部購物車資料的空陣列內容
  renderCart();  
}).catch(error=>{
  console.log(error);
});
}


// 單一刪除指令 監聽 // 因為數量不能歸零 所以加號必須先做出來
shoppingCartTableBody.addEventListener('click',(e)=>{
  let deleteId = e.target.closest('tr').getAttribute('data-id');
  e.preventDefault();
  if(e.target.classList.contains('clearBtn')){
    deleteOneCart(deleteId);
  };
  
  if(e.target.classList.contains('addBtn')){
     let Result = {};
    cartData.forEach(item=>{
      if(item.id === deleteId){
      Result = item;
        }
    });
    let qty = Result.quantity + 1 ;
    updateCart(deleteId,qty)
  }else if(e.target.classList.contains('minusBtn')){
     let Result = {};
    cartData.forEach(item=>{
      if(item.id === deleteId){
      Result = item;
        }
    });
    let qty = Result.quantity - 1 ;
    updateCart(deleteId,qty)
  }
}); // 尾巴

//orders 訂單處理
function sendOrders(){
  if(cartData.length === 0){
    alert('請加入購物車商品')
    return;
  }
    
  if(checkForm()){
    alert("預訂資料，尚未填寫")
    return;
  }
  const data = {
  data: {
    user: {
      name: document.querySelector('#customerName').value.trim(),
      tel: document.querySelector('#customerPhone').value.trim(),
      email: document.querySelector('#customerEmail').value.trim(),
      address: document.querySelector('#customerAddress').value.trim(),
      payment: document.querySelector('#tradeWay').value.trim()
    }
  }
}
  
axios.post(`${customerApi}/orders`,data).then(res=>{
  orderInfoForm.reset(); // 清空購物車資料，無須其他的呼叫函式
}).catch(error=>{
  console.log(error);
});
}

//驗證通過表單 validate.jd cdn 置入
const orderInfoForm = document.querySelector('.orderInfo-form');

function checkForm(){
  const constraints = {
    姓名:{
      presence:{ message: "^是必填欄位"},
    },
    電話:{
      presence:{ message: "^是必填欄位"},
    },
    Email:{
      presence:{ message: "^是必填欄位"},
      email:{ message: "^請輸入正確的信箱"}
    },
    寄送地址:{
      presence:{ message: "^是必填欄位"},
    },
  };
  // 顯示 validate(Form表單,限定constraints規則)
  const errors = validate(orderInfoForm, constraints);

  if (errors) {
    console.log("驗證錯誤：", errors);
  } else {
    console.log("✅ 驗證通過！");
  }
  return errors;// 沒通過驗證就不要送出請求
  }

// 送出預定資料 綁定監聽
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click',(e)=>{
  e.preventDefault();
  sendOrders(e.target);
})

// 紅字提示文字
const dataMessage = document.querySelectorAll('[data-message]');

dataMessage.forEach(item=>{
  item.textContent = `${item.dataset.message} 為必填欄位`
})

// 清空紅色提示文字
// 監聽所有 type="text" 內的input 全選 select
const inputs = document.querySelectorAll('.orderInfo-input');

// 為每一個欄位加上監聽事件
inputs.forEach(input => {
  input.addEventListener('input', e => {
    const msg = e.target.closest('.orderInfo-inputWrap').querySelector('.orderInfo-message');
    if (e.target.value.trim() !== '') {
      msg.style.display = 'none'; // 有輸入內容 → 隱藏紅字
    } else {
      msg.style.display = 'block'; // 清空後 → 顯示紅字
    }
  });
});


// 初始值
function init(){
  getProduct(); // 取得所有產品資料
  getCart();    // 取得所有購物車資料
};

init();


// toast 加入成功提示文字

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});


//千分位 - 放在產品購物車render origin 或折扣後的價格內 - 固定公式
function formatNumber(number){
    let parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
    return parts.length > 1 ? parts.join(".") : parts[0];
}