console.clear();

const txt = document.querySelector('.txt');
const btn_add = document.querySelector('.btn_add');
const list = document.querySelector('.list');
const undoneNum = document.querySelector('.undoneNum');
const doneNum = document.querySelector('.doneNum');

// 切換tab 狀態
let tabStatus = "all";

let data = [];

//永久儲存 localStorageSet 網頁 重新整理不會消失
if (localStorage.getItem("todoData")) {
  data = JSON.parse(localStorage.getItem("todoData"));
  updataList(); // 用舊資料渲染畫面
}

// 完成dataList() 清單

function dataList(){
   //驗證要輸入文字
   if(txt.value.trim() === ''){
        alert('請輸入待辦事項');
        return;
   }

    let obj = {};
    obj.content = txt.value.trim();
    obj.id = new Date().getTime();
    obj.checked = false;

    data.push(obj);
    txt.value = '';

    tabInit(); // 更新tab 回到全部
    updataList();
}

// 點擊新增按鈕
btn_add.addEventListener('click',e=>{
    e.preventDefault();
    dataList();
})
// 點鍵盤也能輸入
txt.addEventListener('keydown',e=>{
    if(e.key === "Enter"){
        dataList();
    }
})

//完成渲染data

function renderData(data){
    let str = '';
    data.forEach(item=>{
        str += `<li data-id="${item.id}">
                    <label class="checkbox" for="">
                        <input type="checkbox" ${item.checked ? "checked" : ""}/>
                        <span>${item.content}</span>
                    </label>
                    <a href="#" class="delete"></a>
                </li>`
    });
        list.innerHTML = str;
}


// list 監聽 input + delete id
list.addEventListener('click',e=>{
    //idx findIndex 一定是數字 ， data-id 取出來是字串 需要轉數字
    let id = parseInt(e.target.closest('li').getAttribute('data-id'));
    
    let idx = data.findIndex(item => item.id === id);

    if(e.target.classList.contains('delete')){
        e.preventDefault();
        data.splice(idx,1); //從data中 將指定的idx 刪除1筆
    }else if(e.target.nodeName === "INPUT"){
        data[idx].checked = !data[idx].checked; //反轉 切換打勾狀態
    };

    updataList();
})


//tab切換
const tab = document.querySelector('.tab');
const tabLi = document.querySelectorAll('.tab li');
const tabAll = document.querySelector('#tabAll');

tab.addEventListener('click',e=>{
    e.preventDefault();
    tabStatus = e.target.dataset.tab;

    tabLi.forEach(item => item.classList.remove('active')); // 移除active
    e.target.classList.add('active'); // 滑鼠點擊到的目標 加上active
    updataList();

} )


//tabInit (更新tab 回到全部)

function tabInit(){
    tabLi.forEach(item => item.classList.remove('active')); // 移除active
    tabAll.classList.add('active'); // 滑鼠點擊到的目標 加上active
    tabStatus = "all";
}

//更新內容updataList 做tab切換


function updataList(){
    let newData = []; //舊data 經過篩選後的newData
    

    if(tabStatus === "all"){
        newData = data;
    }else if(tabStatus === "undone"){
        newData = data.filter(item => !item.checked); // 沒打勾
    }else if(tabStatus === "done"){
        newData = data.filter(item => item.checked); // 已打勾
    }

    // 顯示 待完成 數量
    undoneNum.textContent = `${data.filter(item => !item.checked).length} 個待完成`;
    // 顯示 已完成 數量
    doneNum.textContent = `${data.filter(item => item.checked).length} 個已完成`;

    //永久儲存 localStorageSet
    
  localStorage.setItem("todoData", JSON.stringify(data));

    renderData(newData);

};

//清除已完成項目 綁定刪除 deleteAllDown監聽
const deleteAllDown = document.querySelector('.deleteAllDown');

deleteAllDown.addEventListener('click',e=>{
    e.preventDefault();
    data = data.filter(item => !item.checked); //「保留沒打勾的項目，刪掉打勾的項目」
    updataList();
})
