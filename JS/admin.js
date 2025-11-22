const baseUrl = 'https://livejs-api.hexschool.io/api/livejs/v1/admin/';
const pathApi = 'scarlett';
const token = 'wu9H2A3745QoFdlJWDcgwrXhI0V2';          
const adminApi = `${baseUrl}${pathApi}/orders`;

const config = {
    headers:{
        authorization:token //大寫 A 不行
    }
}

//取得全部後端admin Order訂單資料
let orderData = [];

function getOrders(){
axios.get(adminApi,config).then(response=>{
    orderData = response.data.orders;
    //最新成立時間的訂單會放在最前面，舊訂單會放在最後面
    orderData.sort((a, b) => {
    return b.createdAt - a.createdAt;
    });
    renderOrders(); // 渲染訂單資料到畫面上
    calProductCategory(); //Lv1 全產品類別營收比重
    calProductTitle(); // Lv2 全品項營收比重
}).catch(err=>{
    console.log(err.response?.status, err.response?.data || "order資料獲取失敗");
    console.log('❌錯誤:', err.message);
});
}

//渲染Order訂單資料到畫面上
const orderPageTableBody = document.querySelector('.orderPage-table tbody');    

//日期 首先找 createdAt 這個英文去組合
//paid 是否已付款，永遠都用 三元運算子，去判斷是否已付款
function renderOrders(){    
    
    let str = '';
    orderData.forEach(order =>{
        //日期的變數，內容要 * 1000秒 為日期的格式 轉換toISO 日期的字串 在切割保留 0-10 的日期。最後用-轉換/格式
        const orderData = new Date(order.createdAt * 1000).toISOString().slice(0,10).replaceAll("-","/");
        //日期的變數，內容要 * 1000秒 為日期的格式 轉換成國際時間格式 (依照TW台灣時間去跑)，不要12小時制 = 自動轉24H制
        const orderDataTwo =new Date(order.createdAt * 1000).toLocaleString("zh-TW",{hour12:false});
        //回圈內再包迴圈
        let productStr = ''; // 產品字串
        order.products.forEach(products=>{
        productStr += `
        <p>${products.title}</p> x ${products.quantity}`;
    });
        
        str +=`<tr data-id="${order.id}">
                    <td>${order.id}</td>
                        <td>
                        <p>${order.user.name}</p>
                        <p>${order.user.tel}</p>
                    </td>
                    <td>${order.user.address}</td>
                    <td>${order.user.email}</td>
                    <td>
                        ${productStr}
                    </td>
                    <td>${orderDataTwo}</td> 
                    <td class="orderStatus">
                        <a href="#" class="handle">${order.paid ? `<span style="color:green">已處理</span>` : `<span style="color:red">未處理</span>`}</a>  
                    </td>
                    <td>
                        <input type="button" class="delSingleOrder-Btn" value="刪除">
                    </td>
                </tr>`;

    });
    orderPageTableBody.innerHTML = str;
}

// 刪除單一訂單 
// 錯誤一。config 是在`` 後面一個位置，${id}前方注意有 / ，有參數id都要加入參數
function deleteSingleOrder(id){
    axios.delete(`${adminApi}/${id}`,config).then(response=>{
        orderData = response.data.orders;
        renderOrders();
    }).catch(err=>{
        console.log(err.response?.data?.message || "刪除 order 獲取資料失敗");
    }); 
}

// 監聽刪除單一訂單按鈕
//錯誤二。e.target.closest('tr') 找到最近的 tr 標籤，然後用 getAttribute 取得 data-id 的值
//並不是用dataset.id    
orderPageTableBody.addEventListener('click',(e)=>{
    e.preventDefault();
    let id = e.target.closest('tr').getAttribute('data-id');
    if(e.target.classList.contains('delSingleOrder-Btn')){
        deleteSingleOrder(id);
    };
    // 下面這一部分很神奇，獨立class + nodeName 去做判斷時，切換文字顏色判斷最有效率    
    console.log(e.target);
    if(e.target.classList.contains('handle')){
        updateOrderStatus(id);
    }
    if(e.target.nodeName === 'SPAN'){
        updateOrderStatus(id);
    }
})

// 刪除全部訂單
function deleteOrderAll(){
    axios.delete(`${adminApi}`,config).then(response=>{
        orderData = response.data.orders;
        renderOrders();
    }).catch(err=>{
        console.log(err.response?.data?.message || "刪除 order 獲取資料失敗");
    }); 
}

// 監聽刪除全部訂單按鈕
const discardAllBtn = document.querySelector('.discardAllBtn');

discardAllBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    deleteOrderAll();
});

// 付款狀態更新 put . data 必須放url 的 第二位置，最後才放 config = token 
function updateOrderStatus(id){
    let result = {};
    orderData.forEach(putOrder=>{
        if(putOrder.id === id){
            result = putOrder;
        }       
    });
    console.log(result.paid); // 這裡result 的 paid 印出結果為true 。

    const data = {
  data: {
    id,
    paid: !result.paid // 取反向值，這樣上面一點是true 已處裡，按下去會變false 未處理
  }
}
    axios.put(adminApi,data,config).then(response=>{
        orderData = response.data.orders;
        renderOrders();
    }).catch(err=>{
        console.log(err.response?.data?.message || "更新 order 獲取資料失敗");
    });
}

//Lv1 全產品類別營收比重
//1.組成資料
//2.渲染圖表
function calProductCategory(){
    let resultObj = {};
    orderData.forEach(order=>{
        // 需要再進一步對 products 進行迴圈
        order.products.forEach(product=>{
            if(resultObj[product.category] == undefined){
                resultObj[product.category] = product.price * product.quantity;
            }else{
                resultObj[product.category] += product.price * product.quantity;
            }
        });
    });
    renderC3(Object.entries(resultObj));
    return ;
}
// Lv2 全品項營收比重 前三名
function calProductTitle(){
    let resultObj = {}; 
    orderData.forEach((order)=>{
        order.products.forEach(product=>{
            if (resultObj[product.title] === undefined) {
                resultObj[product.title] = product.price * product.quantity;
            } else {
                resultObj[product.title] += product.price * product.quantity;
            }
        });
    }); 

    const resultArr = Object.entries(resultObj);
    const sortResultArr = resultArr.sort((a,b)=>{
        // 由b大到a小排序，顛倒就是相反 
        return b[1] - a[1];
    });
        // console.log("sort由大至小排序：",sortResultArr);
        //排前三名的[]陣列
        const rankOfThree = [];
        let otherTotal = 0;
        sortResultArr.forEach((product,index)=>{
        if(index <= 2){
            rankOfThree.push(product);
        }else if(index > 2){
            otherTotal += product[1];
        }
    
        if(sortResultArr.length > 3){
            rankOfThree.push(["其他",otherTotal]);
    }; 
    // console.log("前三名陣列：",rankOfThree,otherTotal);
    //已經是[陣列了，不需要object.entries做]
    renderC3(rankOfThree);
    
});
}

//初始化資料
function init(){
getOrders();
}
init();

// C3.js
function renderC3(data){
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    //color - pattern 放外層的話，就會依照所屬色票做炫染
    color:{
        pattern:["#DACBFF","#9D7FEA","#5434A7","#301E5F"]
    },
    data: {
        type: "pie",
        columns: data,
        
    },
});
}

