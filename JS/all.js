console.clear();

//先確認檔案是否正確帶入axios

let data = [];

//網址另外放，會讓程式碼，更乾淨
//LV2
const getUrl = 'https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json';

axios.get(getUrl).then((response)=>{
  
  data = response.data.data;
  renderData(data);
  formatData();
}).catch((error)=>{
    console.log(`有細節出錯，${error}`);
})

function formatData(){
//篩選地區，並累加數字上去
//totalObj 會變成 {高雄:2，台北:1，台中:1}
let totalObj = {};
data.forEach(function(item,index){
  if(totalObj[item.area]==undefined){
     totalObj[item.area] = 1; //賦值 = 1
    
  }else{
     totalObj[item.area] += 1 ;
  }
   //entries 二維陣列包陣列=> 專門取key屬性 與 value值 同時抓取。
  renderChart(Object.entries(totalObj));
}); 


//繼續陣列再包陣列
// newData = [["高雄","台北","台中"]]
// let newData = [];
// let area = Object.keys(totalObj);

// area.forEach(function(item,index){
//   let ary = [];
//   ary.push(item);
//   ary.push(totalObj[item]);
//   newData.push(ary);
// });
    // renderChart(Object.entries(totalObj));
}

function renderChart(data){
// 將newData 丟入 c3產生器

const chart = c3.generate({
  bindto:"#chart",
  size: {
  width: 200
},
  data:{
    columns:data,
    type: 'donut',
  },color: {
  pattern: ['#E68618', '#26C0C7', '#5151D3','#FF0000']
},
  donut:{
    title:"套票地區比重",
     width: 25,
     label: {
    show: false
  }
  }
})
}

//做LV2 需要進入data取值，還需要做除錯功能
//今日學習箭頭函式練習


//渲染卡片套票
//取得搜索內容
const ticketCardArea = document.querySelector('.ticketCard-area');
const searchResultText = document.querySelector('#searchResult-text');
const cantFindArea = document.querySelector('.cantFind-area');

//函數 渲染畫面的資料集
function renderData(data){
  let str = ''; // 先預設一個空字串
  data.forEach(function(item){
    str += `<li class="ticketCard">
        <div class="ticketCard-img">
          <a href="#">
            <img src="${item.imgUrl}" alt="">
          </a>
          <div class="ticketCard-region">${item.area}</div>
          <div class="ticketCard-rank">${item.rate}</div>
        </div>
        <div class="ticketCard-content">
          <div>
            <h3>
              <a href="#" class="ticketCard-name">${item.name}</a>
            </h3>
            <p class="ticketCard-description">
              ${item.description}
            </p>
          </div>
          <div class="ticketCard-info">
            <p class="ticketCard-num">
              <span><i class="fas fa-exclamation-circle"></i></span>
              剩下最後 <span id="ticketCard-num"> ${item.group} </span> 組
            </p>
            <p class="ticketCard-price">
              TWD <span id="ticketCard-price">$${item.price}</span>
            </p>
          </div>
        </div>
      </li>`;
    
  }) // 透過迴圈把 標籤內文字貼第一個，將需要的data 值(item) 依依將屬性放入
  
  if(data.length > 0){ // 當我的篩選結果的資料呈現 大於 0 個，幫我把查無關鍵字資料圖塊隱藏起來，顯示卡片套票區出來
    cantFindArea.style.display = 'none';
  }else{
    cantFindArea.style.display = 'block'; // 如果小於 0 個資料，就顯示查無資料的圖塊出來
  }
  
  ticketCardArea.innerHTML = str ; //最後用innerHTML 把套票卡片顯示出來
  searchResultText.textContent = `本次搜尋共 ${data.length} 筆資料`;// 這個因為沒有標籤所以純數字跟純中文只需要textContent 更好!
}
renderData(data);//最後渲染完整的卡片套票


// 篩選卡片

//取值時，都需要console.log();檢查是否搜索到正確資料
const regionSearch = document.querySelector('.regionSearch');


function filterData(){ // 篩選地區的資料集
  let filterResult= [] ; //篩選結果作為空陣列
  
  data.forEach(function(item){  // 透過迴圈將JS的地區與HTML地區 的同等值 push到空陣列，這樣對應的地區就會放入篩選內
    if(item.area === regionSearch.value){
      filterResult.push(item);
    }
    
     if(regionSearch.value === ''){ //如果do取出的HTML的值 等於空字串，代表回到全部地區，也將他推到資料集內
      filterResult.push(item);
    }
    
  })
  
  
  renderData(filterResult); // 選染篩選結果畫面
  
}  
 
regionSearch.addEventListener('change',function(){ //搜索區透過監聽函式去包 篩選資料的函式，一觸發切換 就可以切換地區
  filterData();
})

//新增卡片
const ticketName = document.querySelector('#ticketName');

const ticketImgUrl = document.querySelector('#ticketImgUrl');
const ticketRegion = document.querySelector('#ticketRegion');
const ticketPrice = document.querySelector('#ticketPrice');
const ticketNum = document.querySelector('#ticketNum');
const ticketRate = document.querySelector('#ticketRate');
const ticketDescription = document.querySelector('#ticketDescription');

//套票按鈕
const addTicketBtn = document.querySelector('.addTicket-btn');
const addTicketForm = document.querySelector('.addTicket-form');

function addData(){ //新增資料集，創建空物件，客戶輸入什麼就推入什麼值
  let obj = {
    id: data.length,
    name: ticketName.value.trim(),//避免客戶誤觸發空白建，所以運用trim()
    imgUrl:ticketImgUrl.value.trim(),
    area: ticketRegion.value.trim(),
    description: ticketDescription.value.trim(),
    group: Number(ticketNum.value.trim()), // 將字串改為數字型別，用Number()去包覆
    price: Number(ticketPrice.value.trim()),
    rate: Number(ticketRate.value.trim())
  }
  
  //錯誤提示驗證器
  let errorMsg = '';
  
  if(!obj.name){  // 如果物件的名字 為 代表 !空字串，就輸入資訊進入 真的空字串errorMsg內
    errorMsg = '套票名稱必填';
  }else if (!obj.imgUrl){
    errorMsg = '圖片網址必填';
  }else if (!obj.area){
    errorMsg = '景點地區必填';
  }else if (!obj.description){
    errorMsg = '套票描述必填';
  }else if (!obj.group){
    errorMsg = '套票組數必填';
  }else if (!obj.price){
    errorMsg = '套票金額必填';
  }else if (!obj.rate){
    errorMsg = '套票星級必填';
  }
  
  if(errorMsg){ // 如果 errorMsg 現在真的是 ''空字串，請提示彈出給我上面的文字內容
    alert(errorMsg);
    return; //依但沒完整填寫，就return 彈出提示畫面，並中斷函式。直到內容填寫完整才進行下一步
  }
  
  data.push(obj);  //將已處理好的obj資料推上去
  regionSearch.value = ''; // 新增好套票內容，就讓搜索地區的值 等於空字串。這樣能回到全部地區畫面
  renderData(data); // 渲染(新資料集內容)
  addTicketForm.reset(); // 輸入好新增套票內容，那麼Form表單就先清空，以便於下次填寫
}

addTicketBtn.addEventListener('click',function(){ // 透過新增套票BNT按鈕，進行click 點擊觸發函式 再包覆我剛做好的 新增資料集函式
  addData();
  formatData(); // 圓餅數據圖 放到新增卡片區時，也都需要呈現出來
  
})