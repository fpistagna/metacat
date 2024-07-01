// responseHandler.js

const responseHandler = (code, data, req, res, next) => {
  console.log(`Response Handler: ${code}\n${data}\n`)

  switch(code) {
    case 200:
      return res.status(200).send({
        status: "success", data: data })    
    case 201:
      return res.status(201).send({ 
        status: "created", data: data })

    case 204:
      return res.status(204).send({ 
        status: "no data",
        data: data
      })

    default:
      return next()
  }
}

module.exports = responseHandler;