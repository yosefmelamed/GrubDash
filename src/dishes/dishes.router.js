// TODO: Implement the /dishes routes needed to make the tests pass
const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/:dishId")
.get(controller.read)
.post(controller.list)
.put(controller.update)
//.delete(controller.delete)
.all(methodNotAllowed);

router.route("/")
.get(controller.list)
.post(controller.create)
.all(methodNotAllowed);

module.exports = router;




