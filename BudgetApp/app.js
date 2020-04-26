
var budgetController = (function(){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    

    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses = 0;
    
    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };
    
    Expense.prototype.calcPerc = function(totalIncome){
        if (totalIncome > 0) this.percentage = Math.round(this.value * 100/totalIncome);
    };
    
    Expense.prototype.getPerc = function(){
        return this.percentage;
    }
    
    var calculateBugdet = function(type){
            var sum = 0;
            data.allItems[type].forEach(function(cur){
                sum += cur.value;
            });
            data.totals[type] = sum;
        }
    return {
        addItem :  function(type,desc,val){
            var newItem,Id;
            if (data.allItems[type].length > 0){
                Id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                Id = 0;
            }
            
            if (type === 'exp'){
                newItem =  new Expense(Id,desc,val);
            }else {
                newItem = new Income(Id,desc,val);
            }
            
            data.allItems[type].push(newItem);           
//            data.totals[type] = data.totals[type] + parseFloat(val);
            return newItem;
        },
        
        testing : function(){
            console.log(data);
        },
        calcBudget : function(){
            calculateBugdet('inc');
            calculateBugdet('exp');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        getbudget : function(){
            return {
                totalBudget : data.budget,
                totalExp : data.totals.exp,
                totalInc : data.totals.inc,
                perc : data.percentage
            
            };
        },
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
               cur.calcPerc(data.totals.inc); 
            });
        }, 
        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPerc();
            });
            return allPerc;
        },
        deleteItem :  function(type, ID){
            var IDs, index;
            IDs = data.allItems[type].map(function(current){
                return current.id ;
            });
            
            index = IDs.indexOf(ID);
            
            if (index !== -1) {
                data.allItems[type].splice(index,1);
            }
        }
    }
})();


var UIController = (function(){
    
    var DOMStrings = {
        inputType : '.add__type',
        inputDesc : '.add__description',
        inputValue : '.add__value',
        inputButton : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetIncomeValue : '.budget__income--value',
        budgetExpensesValue : '.budget__expenses--value',
        budgetvalue : '.budget__value',
        percentagevalue : '.budget__expenses--percentage',
        container : '.container',
        itemPercentage : '.item__percentage',
        budgetMoth : '.budget__title--month'
    }
    
    var formatNumber = function(num,type){
        var numSplit, tnum,int;
        num = Math.abs(num).toFixed(2);
        numSplit =  num.split('.');
        tnum = '';
        if (numSplit[0] > 3){
            int = numSplit[0];
            for(var i = int.length ; i >3 ; i = i - 3){
                tnum = ',' + int.substr(i -3,3) + tnum;
            }
            tnum = int.substr(0,i) + tnum;
        }        
        return (type === 'inc' ? '+' : '-') + ' ' + tnum + '.' + numSplit[1];
    };
    
    return {
        getInput : function(){
                    
            return {
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDesc).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        getDOMStrings : DOMStrings,
        
        clearFields : function(){
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            })
            fieldsArr[0].focus();
        },
        
        addListItem : function(obj,type){
            var html,newHtml,element;
            
            // create a html string with place holder text
            if (type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'; 
            }else {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            
            // replace holder text with some actual code
            
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            //we insert the HTML into DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },
        addBudgetValue : function(budgetValues){
            document.querySelector(DOMStrings.budgetIncomeValue).textContent = formatNumber(budgetValues.totalInc,'inc');
            document.querySelector(DOMStrings.budgetExpensesValue).textContent = formatNumber(budgetValues.totalExp,'exp');
            document.querySelector(DOMStrings.budgetvalue).textContent = budgetValues.totalBudget;
            if (budgetValues.perc > 0){
                document.querySelector(DOMStrings.percentagevalue).textContent = budgetValues.perc + '%'; 
            }else{
                document.querySelector(DOMStrings.percentagevalue).textContent = '---';
            }
                  
        },
        displayPerc :  function(percentages){
            var fields;
            fields = document.querySelectorAll(DOMStrings.itemPercentage);
            
            var nodeListForEach = function(list, callback){
                list.forEach(function(cur,index){
                    callback(cur,index);
                });
            };
            
            nodeListForEach(fields,function(cur, index){
                if (percentages[index] > 0){
                    cur.textContent =  percentages[index] + '%';
                }else{
                    cur.textContent = '---'
                }
                
            });
        },
        
        deleteListItem :  function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);        
        },
        displayMonth : function(){
            var now,month,year;
            
            now = new Date();
            month = now.toLocaleString('default', { month : 'long'});
            year =  now.getFullYear();
            
            document.querySelector(DOMStrings.budgetMoth).textContent = month + ' ' + year;
        },
        changedTypeUx : function(){
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputType + ',' +
                                               DOMStrings.inputDesc + ',' + 
                                               DOMStrings.inputValue);
            
            fields.forEach(function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
            
            //.classList.toggle('.red_focus');
        }
    
    }
    
})();

var controller = (function(budgetCtrl,UICtrl){
    
    var setupEventListeners = function(){
        
        var DOM = UICtrl.getDOMStrings;
        
        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
        
        document.addEventListener('keypress',function(event){
            if(event.keyCode ===13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedTypeUx);
        
    }  
    
    var updateBudget = function(){
        // 4. calculate the budget
        budgetCtrl.calcBudget();
        var budget = budgetCtrl.getbudget();
        //5. dispaly on UId
        UICtrl.addBudgetValue(budget);
    }
    
    var calcPercetange = function(){
        var percentages = [];
        // calculate percentage
        budgetCtrl.calculatePercentages();
        
        
        // read perc from budget controller
        var percentages = budgetCtrl.getPercentages();
//        console.log(percentages);
        // Update in UI
        
        UICtrl.displayPerc(percentages);
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        
        // 1. get input data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add item to budget controller        
             newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            //3. Add it userInterface        
            UICtrl.addListItem(newItem,input.type);
            UICtrl.clearFields();

            //Calculdate and Update Budget
            updateBudget();
            // update perc
            
            calcPercetange();
        }
        
    };
    
    var ctrlDeleteItem = function(event){
       var itemId,splitId,type,ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id; 
        
        if (itemId){ //inc-0
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            
            //delete an item from data structure
            budgetCtrl.deleteItem(type,ID);
            //2. delete from user interface
            UIController.deleteListItem(itemId);
            //3. recalc budget
            updateBudget();
            // calc perc
            calcPercetange();
        }
    };
    
    return {
        init : function(){
            console.log('Application has Started !');
            setupEventListeners();
            UICtrl.addBudgetValue({
                totalBudget : 0,
                totalExp : 0,
                totalInc : 0,
                perc : '---'
            });
            UICtrl.displayMonth();
        }
    } ;
 
})(budgetController,UIController);

controller.init();