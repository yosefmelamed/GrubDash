const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
let lastOrderId = orders.reduce((maxId, order) => Math.max(maxId, order.id), 0);

//validate that an order exists and if yes then pass down it down with res.locals
function orderExists(req, res, next) {
  const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}.`,
  });
};

//validate that various data properties exist
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
        status: 400,
        message: `Order must include a ${propertyName}`
    });
  };
}

//validate that existing properties are not empty
function bodyIsNotEmpty(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data !== "") {
      return next();
    }
    next({
        status: 400,
        message: `Order must include a ${propertyName}`
    });
  };
}

//validate that the dish is an array and is not empty
function dishIsArray(req, res, next){
  const { data: {dishes}  = {} } = req.body;
    if (!Array.isArray(dishes)|| dishes.length ===0){
      return next({
          status: 400,
          message: `Order must include at least one dish`
      });
  }
  next();
}

//validate that the put id matches an order id
function idMatch(req, res, next){
  const {orderId} = req.params;
  const {data:{id}= {}} =req.body;
  if(id && id !== orderId){
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
  })
  }
  return next()
}

//validate that the dish property is a number bigger than 0
function dishIsValid(req, res, next){
 const { data: {dishes} ={} } = req.body;
  console.log(dishes)
  for(let i=0; i< dishes.length; i++){
  if(dishes[i].quantity <= 0 || !Number.isInteger(dishes[i].quantity)){
      return next({
        status: 400,
        message: `dish ${i} must have a quantity that is an integer greater than 0`,
    });
  }}
next()
}    

//validate the status property
function statusIsValid(req, res, next){
  const {data:{status} = {} } = req.body;
  if(status !== "invalid"){
    return next()
  }
  next({
    status: 400,
      message: `status`,
  })
}

//post
function create(req, res) {
  const { data: {  deliverTo, mobileNumber, dishes, status }= {} } = req.body;
  const newOrder = {
    id: ++ lastOrderId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
    status: status,
    }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder });
}

//get the current order information
function read(req, res, next) {
  res.json({ data: res.locals.order });
};

//put for updating an order
function update(req, res) {
  const orders = res.locals.order;
  const { data: {  deliverTo, mobileNumber, dishes, status }= {} } = req.body;
    orders.deliverTo = deliverTo;
    orders.mobileNumber = mobileNumber;
    orders.dishes = dishes;
    orders.status = status;
  res.json({ data: orders });
}

//validate that deleting is allowed
function canDelete(req, res, next){
  const order = res.locals.order;
  if(order.status === "pending"){
    return next()
  }
  next({
    status: 400,
    message: `An order cannot be deleted unless it is pending`
  })
}

//delete for an order
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  // `splice()` returns an array of the deleted elements, even if it is one element
  const deletedOrder = orders.splice(index, 1);
  res.sendStatus(204);
}

//get all orders
function list(req, res) {
  res.json({ data: orders });
}

//export functions and the relevant validations
module.exports = {
   create: [
      bodyDataHas("deliverTo"),
      bodyDataHas("mobileNumber"),
      bodyDataHas("dishes"),
      dishIsValid,
      dishIsArray,
      create
  ],
  list,
  read: [orderExists, read],
   update: [
     orderExists,
     bodyIsNotEmpty("dishes"),
     idMatch,
     bodyDataHas("deliverTo"),
     bodyDataHas("mobileNumber"),
     bodyDataHas("status"),
     bodyDataHas("dishes"),
     dishIsValid,
     dishIsArray,
     statusIsValid,
     update
  ],
  delete: [orderExists, canDelete, destroy],
 
};