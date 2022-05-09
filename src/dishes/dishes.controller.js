const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
let lastDishId = dishes.reduce((maxId, dish) => Math.max(maxId, dish.id), 0)

//validate that the dish exists and pass down the current dish with res.locals
function dishIdExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(dish => dish.id === dishId);
   if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist ${dishId}.`,
  });
};

//validate the various data properties
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
        status: 400,
        message: `Dish must include a ${propertyName}`
    });
  };
}

//validate a dish id as existing
function validId(req, res, next){
  const {dishId} = req.params;
  const {data:{id}= {}} =req.body;
  if(id && id !== dishId){
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  })
  }
  return next()
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
        message: `Must include a ${propertyName}`
    });
  };
}

//validate that the dish propert is not empty and pass 404 if it is
function dishIsNotEmpty(dish) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data !== "") {
      return next();
    }
    next({
        status: 404,
        message: `Must include a ${dish}`
    });
  };
}

//validate the price property
function priceIsValid(req, res, next){
  const { data: { price }  = {} } = req.body;
  parseInt(price)
   if (price < 0 || price === 0 || !Number.isInteger(price)){
      return next({
          status: 400,
          message: `Dish must have a price that is an integer greater than 0`
      });
  }
  next();
}

//function for post
function create(req, res) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;
 const newDish = {
    id: ++ lastDishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
   
  };
  dishes.push(newDish)
  res.status(201).json({ data: newDish  });
}

//get current dish
function read(req, res) {
const foundDish = res.locals.dish;
res.json({ data: foundDish });
}


//function for put
function update(req, res) {
  const dish = res.locals.dish;
  const { data: { id, name, description, price, image_url } = {} } = req.body;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  res.json({ data: dish });
}

//get all dishes
function list(req, res) {
  const { dishId } = req.params;
  res.json({ data: dishes.filter(dishId ? dish => dish.id == dishId : () => true) });
}




//export the various functions and validations
module.exports = {
  create: [
      bodyDataHas("name"),
      bodyDataHas("description"),
      bodyDataHas("price"),
      bodyDataHas("image_url"),
      priceIsValid,
      bodyIsNotEmpty("name"),
      bodyIsNotEmpty("description"),
      bodyIsNotEmpty("price"),
      bodyIsNotEmpty("image_url"),
      create
  ],
  list,
  read: [dishIdExists, read],
  update: [
      dishIdExists,
      validId,
      bodyDataHas("name"),
      bodyDataHas("description"),
      bodyDataHas("price"),
      bodyDataHas("image_url"),
      priceIsValid,
      update
  ],

 };