// errorHandler.js
const errorHandler = (error, req, res, next) => {

    console.log(`errorHandler: ${error}`); // logging the error here
    console.log(error.name);
    console.log(error.message);  
  if (error.name === "MetadataError") {

    console.log(`errorHandler: ${error}`); // logging the error here
    console.log(error.name);
    console.log(error.message);
}
/*  switch(error.name) {
    case "metadataError":
      return
  }*/

  if (error.name === "ValidationError") {
      return res.status(400).send({
          type: "ValidationError",
          details: error.details,
      });
  }

  res.status(400).send(error.message); // returning the status and error message to client
};

module.exports = errorHandler;