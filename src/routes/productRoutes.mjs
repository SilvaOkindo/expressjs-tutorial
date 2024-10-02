import { Router } from "express"

export const productRoutes = Router()

productRoutes.get("/api/products", (request, response) => {
    const product = {
        name: "Iphone 16 pro max",
        price: "$2000",
        warranty: "1 year"
    }

    //console.log(request.headers.cookie)
    console.log(request.signedCookies.hello)


    if(request.signedCookies.hello && request.signedCookies.hello === "world") {
        return response.status(200).send(product)

    }

    return response.status(403).send({message: "You dont have the right the cookie"})

})