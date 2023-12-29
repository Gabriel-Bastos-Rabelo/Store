const fs = require("fs");

const requestHandle = (req, res) => {
   
    const method = req.method;
    if(req.url == "/"){

        res.write("<html>")

        res.write("<head><title>My first page</title></head>")

        res.write('<body><form action = "/message" method = "POST"><input type = "text" name = "message"></input><button>enviar</button></form></body>')

        res.write("</html>");


        return res.end();


    }

    if(req.url == "/message" && method == "POST"){

        const body = [];
        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        })

        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split("=")[1];
            fs.writeFileSync("message.txt", message);
        })
        

        res.statusCode = 302;
        res.setHeader("Location", "/");
        return res.end();

    }

    res.setHeader('Content-Type', 'text/html')

    res.write("<html>")

    res.write("<head><title>My first page</title></head>")

    res.write("<body><h1>My first node application</h1></body>")

    res.write("</html>");


    res.end();
}

module.exports = {requestHandle}

