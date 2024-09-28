import express from "express"


const app = express()

app.use(express.json())

const PORT = 3000

const users = [
    {
        id: 1,
        username: "silva",
        age: 25
    },

    {
        id: 2,
        username: "dan",
        age: 11
    },

    {
        id: 3,
        username: "Ethan",
        age: 22
    }
]

app.get("/", (req, res)=> {
    res.send({message: "Hello world"})
})


// get all users
app.get("/api/users", (req, res) => {

    console.log(req.query)

    const {query: {filter, value}} = req
    
    if(filter && value) {
       return res.send(
        users.filter(user => user[filter].includes(value))
       )
    }

    return res.send(users)
    
})

// get 1 user
// params returns an object
app.get("/api/users/:id", (request, response) => {

    console.log(request.params)
    const parsedId = parseInt(request.params.id)


    if(isNaN(parsedId)) return response.status(400).send({message: "Bad request"})

    const findUser = users.find(user => user.id === parsedId)

    if(!findUser) return response.status(404).send({message: "Bad request. User not found"})

    response.send(findUser)
    
})

// adding user 
app.post("/api/users", (request, response) => {
    const newUSer = {id: users[users.length - 1].id + 1, ...request.body}
    //console.log(newUSer)
    users.push(newUSer)
    return response.status(200).json({message: "user added successfully"})
})


// updating a user
app.put("/api/users/:id", (request, response) => {

    const {body, params: {id}} = request
    const parsedId = parseInt(id)

    if(isNaN(parsedId)) return response.status(400).send({message: "Bad request"})
    
    const findIndex = users.findIndex((user) => user.id === parsedId)

    if(findIndex === -1) return response.status(404).send({message: "User not foiund"})

    users[findIndex] = {id: parsedId, ...body}

    return response.status(200).json({message: "User updated"})

})


// editing a user
app.patch("/api/users/:id", (request, response) => {

    const {body, params: {id}} = request
    const parsedId = parseInt(id)

    if(isNaN(parsedId)) return response.status(400).send({message: "Bad request"})
    
    const findIndex = users.findIndex((user) => user.id === parsedId)

    if(findIndex === -1) return response.status(404).send({message: "User not foiund"})

    users[findIndex] = {...users[findIndex], ...body}

    return response.status(200).json({message: "User updated"})

})


// delete user
app.delete("/api/users/:id", (request, response) => {
    const parsedId = parseInt(request.params.id)

    const findIndex = users.findIndex(user => user.id === parsedId)

    if(findIndex === -1) return response.sendStatus(404)

    return response.status(200).send(
        users.splice(findIndex, 1)
    )

})



app.listen(PORT, () => {
    console.log(`Serving running on ${PORT}`);
    
})
