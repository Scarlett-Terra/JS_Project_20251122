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
const pendingCartActions = new Set();
const cartPatchTimers = new Map();
const cartPatchSnapshots = new Map();

function cloneCartData(){
  return JSON.parse(JSON.stringify(cartData));
}

function calcCartTotal(){
  cartTotal = cartData.reduce((total,item)=>{
    return total + item.product.price * item.quantity;
  },0);
}

function restoreCart(snapshot,total){
  cartData = snapshot;
  cartTotal = total;
  renderCart();
}

function updateCartTotalDom(){
  const totalNodes = document.querySelectorAll('.cartTotalPrice');
  totalNodes.forEach(node=>{
    node.textContent = `NT$${formatNumber(cartTotal)}`;
  });
}

function updateCartItemDom(item){
  const cartRow = shoppingCartTableBody.querySelector(`tr[data-id="${item.id}"]`);
  if(!cartRow){
    return;
  }

  const qtyNodes = cartRow.querySelectorAll('.cartQty');
  const subtotalNodes = cartRow.querySelectorAll('.cartSubtotal');
  const subtotal = item.product.price * item.quantity;

  qtyNodes.forEach(node=>{
    node.textContent = item.quantity;
  });

  subtotalNodes.forEach(node=>{
    node.textContent = `NT$${formatNumber(subtotal)}`;
  });
}

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
  shoppingCartTableBody.innerHTML = '<tr class="cartEmpty"><td colspan="5">商品目前為空，請選購</td></tr>' ;
  shoppingCartTableFoot.innerHTML = '';
    return;
  }
  
  let str = '';
  cartData.forEach(item=>{
    const isPending = pendingCartActions.has(item.id);
    const disabledAttr = isPending ? 'disabled' : '';
    str += `<tr data-id=${item.id} >
                    <td data-label="商品">
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                        <div class="cartMobileItem">
                          <img src="${item.product.images}" alt="">
                          <div class="cartMobileContent">
                            <p class="cartMobileTitle">${item.product.title}</p>
                            <div class="cartMobileRow">
                              <span>單價</span>
                              <strong>NT$${formatNumber(item.product.price)}</strong>
                            </div>
                            <div class="cartMobileRow">
                              <span>數量</span>
                              <div class="quantityControl">
                                <button type="button" class="minusBtn" ${disabledAttr}>-</button>
                                <span class="cartQty">${item.quantity}</span>
                                <button type="button" class="addBtn" ${disabledAttr}>+</button>
                              </div>
                            </div>
                            <div class="cartMobileRow">
                              <span>小計</span>
                              <strong class="cartSubtotal">NT$${formatNumber(item.product.price * item.quantity)}</strong>
                            </div>
                          </div>
                        </div>
                    </td>
                    <td data-label="單價"><span>NT$${formatNumber(item.product.price)}</span></td>
                    <td data-label="數量">
                      <div class="quantityControl">
                        <button type="button" class="minusBtn" ${disabledAttr}>-</button>
                        <span class="cartQty">${item.quantity}</span>
                        <button type="button" class="addBtn" ${disabledAttr}>+</button>
                      </div>
                  </td>
                    <td data-label="小計"><span class="cartSubtotal">NT$${formatNumber(item.product.price * item.quantity)}</span></td>
                    <td class="discardBtn" data-label="操作">
                        <a href="#" class="material-icons clearBtn" aria-label="刪除商品">close</a>
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
                    <td class="cartTotalPrice">NT$${formatNumber(cartTotal)}</td>
                </tr>`;
}

//取得post 新增購物車功能

function postCart(id,quantity){
  const previousCartData = cloneCartData();
  const previousCartTotal = cartTotal;
  const existCartItem = cartData.find(item=>item.product.id === id);
  const pendingId = existCartItem ? existCartItem.id : `pending-${id}`;

  pendingCartActions.add(pendingId);

  if(existCartItem){
    existCartItem.quantity = quantity;
  }else{
    const product = productData.find(item=>item.id === id);
    if(product){
      cartData.push({
        id: pendingId,
        quantity,
        product
      });
    }
  }

  calcCartTotal();
  renderCart();

  const data = {
  "data": {
    "productId": id,
    "quantity": quantity
  }
}
  
return axios.post(`${customerApi}/carts`,data).then(res=>{
  cartData = res.data.carts;
  cartTotal = res.data.finalTotal;
  // 這個要渲染 取得全部購物車資料的空陣列內容
  renderCart(cartData);  
  Toast.fire({
    icon: "success",
    title: "您的商品添加成功"
  });
}).catch(error=>{
  console.log(error);
  restoreCart(previousCartData,previousCartTotal);
  Toast.fire({
    icon: "error",
    title: "加入失敗，請稍後再試"
  });
}).finally(()=>{
  pendingCartActions.delete(pendingId);
  renderCart();
});
}


// 新增購物車 監聽功能 2 修改後可以點加入購物車就新增數字

productWrap.addEventListener('click', (e) => {
  e.preventDefault();
  
  const btn = e.target.closest('.addCardBtn');
  if (!btn || btn.classList.contains('is-loading')) return;

  const productId = btn.dataset.id;
  btn.classList.add('is-loading');
  btn.textContent = '加入中...';

  let quantity = 1;

  cartData.forEach(item => {
    if(item.product.id === productId){
      quantity = item.quantity + 1;
    }
  });

  postCart(productId, quantity).finally(()=>{
    btn.classList.remove('is-loading');
    btn.textContent = '加入購物車';
  });
});


// delete 刪除所有品項

function deleteAllCart(){
  const previousCartData = cloneCartData();
  const previousCartTotal = cartTotal;

  cartData = [];
  cartTotal = 0;
  renderCart();

axios.delete(`${customerApi}/carts`).then(res=>{
  cartData = res.data.carts;
  cartTotal = res.data.finalTotal;
  // 這個要渲染 取得全部產品資料的空陣列內容
  renderCart(cartData);  
  
}).catch(error=>{
  console.log(error);
  restoreCart(previousCartData,previousCartTotal);
  Toast.fire({
    icon: "error",
    title: "清空失敗，請稍後再試"
  });
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
const previousCartData = cloneCartData();
const previousCartTotal = cartTotal;
pendingCartActions.add(id);

cartData = cartData.filter(item=>item.id !== id);
calcCartTotal();
renderCart();

axios.delete(`${customerApi}/carts/${id}`).then(res=>{
  cartData = res.data.carts;
  cartTotal = res.data.finalTotal;
  // 這個要渲染 取得全部產品資料的空陣列內容
  renderCart();  
}).catch(error=>{
  console.log(error);
  restoreCart(previousCartData,previousCartTotal);
  Toast.fire({
    icon: "error",
    title: "刪除失敗，請稍後再試"
  });
}).finally(()=>{
  pendingCartActions.delete(id);
  renderCart();
});
}


// 修改數量 patch 

function updateCart(id,qty){
  if(qty < 1 || pendingCartActions.has(id)){
    return;
  }

  const targetCartItem = cartData.find(item=>item.id === id);
  if(!targetCartItem){
    return;
  }

  if(!cartPatchSnapshots.has(id)){
    cartPatchSnapshots.set(id,{
      cartData: cloneCartData(),
      cartTotal
    });
  }

  targetCartItem.quantity = qty;
  calcCartTotal();
  updateCartItemDom(targetCartItem);
  updateCartTotalDom();

  if(cartPatchTimers.has(id)){
    clearTimeout(cartPatchTimers.get(id));
  }

  const timer = setTimeout(()=>{
    const data = {
      data: {
        id,
        quantity: targetCartItem.quantity
      }
    };
  
    axios.patch(`${customerApi}/carts`,data).then(res=>{
      cartData = res.data.carts;
      cartTotal = res.data.finalTotal;
      const updatedCartItem = cartData.find(item=>item.id === id);
      if(updatedCartItem){
        updateCartItemDom(updatedCartItem);
      }
      updateCartTotalDom();
      cartPatchSnapshots.delete(id);
    }).catch(error=>{
      const snapshot = cartPatchSnapshots.get(id);
      console.log(error);
      if(snapshot){
        restoreCart(snapshot.cartData,snapshot.cartTotal);
      }
      Toast.fire({
        icon: "error",
        title: "更新失敗，請稍後再試"
      });
      cartPatchSnapshots.delete(id);
    }).finally(()=>{
      cartPatchTimers.delete(id);
    });
  },250);

  cartPatchTimers.set(id,timer);
}


// 單一刪除指令 監聽 // 因為數量不能歸零 所以加號必須先做出來
shoppingCartTableBody.addEventListener('click',(e)=>{
  const cartRow = e.target.closest('tr');
  if(!cartRow || !cartRow.dataset.id){
    return;
  }
  let deleteId = cartRow.getAttribute('data-id');
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

// 為每一個欄位加上監聽事件 // 距離Input 上層div 最近的 .orderInfo-inputWrap 內的 .orderInfo-message
inputs.forEach(input => {
  input.addEventListener('input', e => {
    const inputWrap = e.target.closest('.orderInfo-inputWrap');
    const msg = inputWrap?.querySelector('.orderInfo-message');
    if(!msg){
      return;
    }
    if (e.target.value.trim() !== '') {
      msg.style.display = 'none'; // 有輸入內容 → 隱藏紅字
    } else {
      msg.style.display = 'block'; // 清空後 → 顯示紅字
    }
  });
});

function initRecommendationCarousel(){
  const wall = document.querySelector('.recommendation-wall');
  const topList = document.querySelector('.gallery-top');
  const bottomList = document.querySelector('.gallery-bottom');
  const modal = document.querySelector('.recommendation-modal');
  const modalClose = document.querySelector('.recommendation-modal-close');
  const modalImg = document.querySelector('.recommendation-modal-img');
  const modalName = document.querySelector('.recommendation-modal-name');
  const modalProduct = document.querySelector('.recommendation-modal-product');
  const modalText = document.querySelector('.recommendation-modal-text');

  if(!wall || !topList || !bottomList || !modal){
    return;
  }

  bottomList.querySelectorAll('.recommendation-card').forEach(card=>{
    topList.appendChild(card);
  });
  bottomList.remove();
  topList.classList.add('recommendation-track');

  const cards = Array.from(topList.querySelectorAll('.recommendation-card'));
  cards.forEach(card=>{
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    topList.appendChild(clone);
  });

  topList.addEventListener('click',e=>{
    const card = e.target.closest('.recommendation-card');
    if(!card){
      return;
    }

    const image = card.querySelector('.recommend-img img');
    const info = card.querySelectorAll('.recommend-img p');
    const text = card.querySelector('.recommend-content > p:last-child');

    modalImg.src = image?.src || '';
    modalImg.alt = info[0]?.textContent || '推薦者';
    modalName.textContent = info[0]?.textContent || '';
    modalProduct.textContent = info[1]?.textContent || '';
    modalText.textContent = text?.textContent || '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
  });

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
  }

  modalClose.addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{
    if(e.target === modal){
      closeModal();
    }
  });
}

function initCompareCarousel(){
  const section = document.querySelector('.furniture-compare');
  const wrap = section?.querySelector('.wrap');
  const rows = Array.from(document.querySelectorAll('.compare-table tr')).slice(1);

  if(!section || !wrap || rows.length === 0){
    return;
  }

  const carousel = document.createElement('div');
  carousel.className = 'compare-carousel';
  carousel.innerHTML = `
    <div class="compare-track"></div>
    <div class="compare-modal" aria-hidden="true">
      <div class="compare-modal-content" role="dialog" aria-modal="true" aria-label="家具比較內容">
        <button type="button" class="compare-modal-close" aria-label="關閉">close</button>
        <h4 class="compare-modal-title"></h4>
        <dl class="compare-modal-list"></dl>
      </div>
    </div>
  `;

  const track = carousel.querySelector('.compare-track');
  const modal = carousel.querySelector('.compare-modal');
  const modalTitle = carousel.querySelector('.compare-modal-title');
  const modalList = carousel.querySelector('.compare-modal-list');
  const modalClose = carousel.querySelector('.compare-modal-close');
  const labels = ['窩窩系統模組家具','組合式家具','實木家具'];

  function getCompareIcon(value){
    if(value === '✅'){
      return 'check_circle';
    }
    if(value === '不一定'){
      return 'help';
    }
    return 'remove_circle';
  }

  function getCompareText(value){
    if(value === '✅'){
      return '支援';
    }
    return value || '無';
  }

  function openCompareModal(card){
    const title = card.dataset.title;
    const values = JSON.parse(card.dataset.values);
    modalTitle.textContent = title;
    modalList.innerHTML = labels.map((label,index)=>`
      <div class="compare-modal-row">
        <dt>${label}</dt>
        <dd>${values[index]}</dd>
      </div>
    `).join('');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
  }

  rows.forEach(row=>{
    const cells = Array.from(row.children);
    const title = cells[0]?.textContent.trim() || '';
    const values = cells.slice(1).map(cell=>cell.textContent.trim() || '無');
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'compare-card';
    card.dataset.title = title;
    card.dataset.values = JSON.stringify(values);
    const mainIcon = getCompareIcon(values[0]);
    const mainText = getCompareText(values[0]);
    card.innerHTML = `
      <span class="compare-card-title">${title}</span>
      <span class="compare-card-actions">
        <span class="compare-card-main">
          <span class="material-icons">${mainIcon}</span>
          <span>${mainText}</span>
        </span>
        <span class="compare-card-more">查看比較</span>
      </span>
    `;
    card.addEventListener('click',()=>openCompareModal(card));
    track.appendChild(card);
  });

  Array.from(track.children).forEach(card=>{
    const clone = card.cloneNode(true);
    clone.addEventListener('click',()=>openCompareModal(clone));
    track.appendChild(clone);
  });

  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
  }

  modalClose.addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{
    if(e.target === modal){
      closeModal();
    }
  });

  wrap.appendChild(carousel);
  section.classList.add('is-carousel');
}


// 初始值
function init(){
  initCompareCarousel();
  initRecommendationCarousel();
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
