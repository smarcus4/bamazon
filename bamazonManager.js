var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password:"samM1994",
    database:"bamazon"
})



connection.connect(function(err){

    if(err) throw err;
    console.log("connection was successful on Port number: " + connection.threadId);
    promptManager();

})




var promptManager = function(){
    inquirer.prompt([{
        type: 'list',
        message:"What would you like to purchase?",
        choices: ['View Products for Sale', 'View Low Inventory','Add to Inventory','Add New Product', 'Exit'],
        name: 'managerChoices'
        
    }]).then(function(managerResponse){
        switch(managerResponse.managerChoices) {
            case "View Products for Sale":
                productSale();
                break;
            case "View Low Inventory":
                lowInventory();
                break;
            case "Add to Inventory":
                addInventory();
                break;
            case "Add New Product":
                newProduct();
                break;
            case "Exit":
                connection.end();
                break;
            default:
                console.log("Error in the manager entry!");
        }
        
    })

}


function lowInventory(){
    console.log("Low Inventory");
    promptManager();
}
function productSale(){
    queryString = "SELECT * FROM products";
    connection.query(queryString, function(err, res){
        if (err) throw err;
        
        console.log("\n");
        console.log("----------------------------------------------------------------------------------------------------");
        console.log("VIEW THE CONTENT AVAILABLE IN OUR INVENTORY")
        console.log("----------------------------------------------------------------------------------------------------");
    
        console.log("Item ID "+ " | " + "Product Name"+ " | "+ "Deparment Name"+" | "+ "Cost"+ " | "+ "Quantity");
        console.log("----------------------------------------------------------------------------------------------------");
        for(var i =0; i<res.length; i++){
            
    
            console.log("Item ID: "+res[i].itemid +" | " +res[i].productname+" | "+ res[i].departmentname+" | "+"$"+res[i].price+" | "+res[i].stockquantity+' units'+"\n");
    
    
        }
        promptManager();
    
    });
}
function addInventory(){
    queryString = "SELECT * FROM products";
    connection.query(queryString, function(err, res){
        if (err) throw err;
        console.log("Review the items below to decide which item needs updating! Use the ID to locate the item needing updates!:")
        console.log("----------------------------------------------------------------------------------------------------------------" + '\n');

        for(var i= 0; i< res.length; i++){
            console.log("Item ID: "+res[i].itemid +" | " +res[i].productname+" | "+ res[i].departmentname+" | "+"$"+res[i].price+" | "+res[i].stockquantity+' units'+"\n");

        }
        stockItems();
    });
   
}

function stockItems(){
    inquirer.prompt([
        {
        type: 'input',
        message:"What item would you like to update? (Select item by locating the ITEM ID): ",
        name: 'itemChoice'
        
        },
        {
            type: "input",
            message: "How many units would you like to add?: ",
            name: "itemQuantity"
        }
        ]).then(function(answer){
        var item_id = answer.itemChoice;
        var quantity = answer.itemQuantity;
        var queryString2 = "SELECT * FROM products WHERE ?"

        if(answer){
            inquirer.prompt([
                {
                    type: "confirm",
                    message: "You have selected item at ID " + item_id + " and you have selected to add " +quantity + " units",
                    name: "confirmRestock",
                    default: true
                }
            ]).then(function(responseUser){

                connection.query(queryString2, {itemid : item_id}, function(err, res){

                    if (err) throw err;
                    var productInfo = res[0];
                    if(responseUser.confirmRestock){
                        console.log("Restocking " + quantity +" units, to itemID at " + item_id);

                        var totalProducts = parseInt(productInfo.stockquantity) + parseInt(quantity);
                        console.log("There are now a total of "+ totalProducts + " units");

                        var updateQuery = 'UPDATE products SET stockquantity = ' + totalProducts + ' WHERE itemid = ' + item_id;
                        for( var i = 0; i< res.length; i++){

                            console.log("------------------------------------------------------------------------------------------");
                            console.log("The item below has been updated to reflect the new stock unit amount"); 
                            console.log("------------------------------------------------------------------------------------------" + '\n');
  
                            console.log("Item ID: "+res[i].itemid +" | " +res[i].productname+" | "+ res[i].departmentname+" | "+"$"+res[i].price+" | "+productInfo.stockquantity+' units'+"\n");
                        }

                   
                        connection.query(updateQuery, function(err, res) {
                            if (err) throw err;
                            // console.log("Your restock was successful. There are now " + totalPrducts + " " + productInfo.productname + "(s) available.");
                            queryString3 = "SELECT * FROM products";

                            connection.query(queryString3, function(err, res){
                                if (err) throw err;

                                console.log("------------------------------------------------------------------------------------------");
                                console.log("New stock updates listed below: "); 
                                console.log("------------------------------------------------------------------------------------------" + '\n');

                                for(var i=0; i< res.length; i++){
                                 console.log("Item ID: "+res[i].itemid +" | " +res[i].productname+" | "+ res[i].departmentname+" | "+"$"+res[i].price+" | "+res[i].stockquantity+' units'+"\n");
                                }
                                promptManager();
                            });

                            
                        })
                   
                    }else{
                        console.log("Sorry we could not perform that request please try again!");
                        promptManager();
                    }
                })

            })
        }
        

    });
   
}


function lowInventory(){
    queryString = "SELECT * FROM products";
    connection.query(queryString, function(err, res){
        if (err) throw err;
       
        console.log("----------------------------------------------------------------------------------------------------");
        console.log("These products are getting low on stock better prepare to fill an order for these!");
        console.log("----------------------------------------------------------------------------------------------------");

        for(var i=0; i<res.length; i++){
            if(res[i].stockquantity <40){
              
                console.log("Item ID: "+res[i].itemid +" | " +res[i].productname+" | "+ res[i].departmentname+" | "+"$"+res[i].price+" | "+res[i].stockquantity+' units'+"\n");
            }
            
        }
        promptManager();
        
    })

}
function newProduct(){
    queryString = "SELECT * FROM products";
    connection.query(queryString, function(err, res){
        if (err) throw err;
       
        console.log("----------------------------------------------------------------------------------------------------");
        console.log("These are the current products we have in stock, which item would you like to add to this list?");
        console.log("----------------------------------------------------------------------------------------------------");

        for(var i=0; i<res.length; i++){


            console.log("Item ID: "+res[i].itemid +" | " +res[i].productname+" | "+ res[i].departmentname+" | "+"$"+res[i].price+" | "+res[i].stockquantity+' units'+"\n");
            
            
        }
        newProductPrompt()
        
    })
}


function newProductPrompt(){
    inquirer.prompt([
        {
            type: "input",
            message : "What item would you like to add?",
            name : "productname"
        },
        {
            type: "input",
            message : "What department would you like to place this item into?",
            name : "departmentname"
        },
        {
            type : "input",
            message : "What will be the cost of the item?",
            name : "price",
            // validate: validateNumeric       
        },
        {
            type : "input",
            message : "How many units would you like to stock?",
            name : "stockquantity",
            // validate : validateInteger
        }

    ]).then(function(productRes){

       
        console.log("Congratulations you have successfully added: \n" +
        "product name: " + productRes.productname + " \n"+
        "department name: " + productRes.departmentname + " \n"+
        "product cost: " + "$"+productRes.price + " \n"+
        "unit amount: " + productRes.stockquantity +" units"+ " \n")

        queryString4 = "INSERT INTO products SET ?";

        connection.query(queryString4, productRes, function(err, res, fields){
            if(err) throw err;
            console.log('New product has been added to the inventory under Item ID ' + res.insertId + '.');
			console.log("\n---------------------------------------------------------------------\n");
        })
        

    
    })
    promptManager();



}























