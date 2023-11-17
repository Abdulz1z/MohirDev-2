const http = require("http");
const fs = require("fs");
const { randomUUID } = require("crypto");

const server = http.createServer((req, res) => {
  fs.readFile("books.json", "utf8", (err, data) => {
    const books = JSON.parse(data);
    if (req.method === "GET" && req.url === "/books") {
      res.writeHead(200, { "Content-Taype": "Applicatoin/json" });
      res.end(JSON.stringify(books));
    } else if (req.method === "GET" && req.url.startsWith("/books/")) {
      const id = req.url.split("/").pop();
      const book = books.find((b) => b.id === id);
      if (book) {
        res.writeHead(200, { "Content-Taype": "Applicatoin/json" });
        res.end(JSON.stringify(book));
      } else {
        res.writeHead(404, { "Content-Type": " Application/json" });
        res.end(JSON.stringify("Ma'lumot topilmadi"));
      }
    } else if (req.method === "POST" && req.url === "/books") {
      let body = "";

      req.on("data", (data) => {
        body += data;
      });

      req.on("end", () => {
        const newBook = JSON.parse(body);
        const existingBook = books.find((book) => book.title === newBook.title);
        console.log(existingBook);
        if (existingBook) {
          res.writeHead(500, { "Content-Type": " application/json" });
          res.end(JSON.stringify({ error: "Bu kitob bazada mavjud" }));
        } else {
          newBook.id = randomUUID();
          books.unshift(newBook);
          fs.writeFile("books.json", JSON.stringify(books), "utf8", (err) => {
            if (err) {
              res.writeHead(500, { "Content-Type": " application/json" });
              res.end(JSON({ error: "Fayilga yozishda xatolik berdi" }));
            } else {
              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(JSON.stringify(newBook));
            }
          });
        }
      });
    } else if (req.url.startsWith("/books/") && req.method === "PUT") {
      const id = req.url.split("/").pop();
      let body = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });
      req.on("end", () => {
        const updatedBook = JSON.parse(body);
        const bookUpdateIndex = books.findIndex((book) => book.id === id);
        if (bookUpdateIndex !== -1) {
          books[bookUpdateIndex] = { id, ...updatedBook };

          fs.writeFile("books.json", JSON.stringify(books), "utf8", (err) => {
            if (err) {
              res.writeHead(500, { "Content-Taype": "application/json" });
              res.end(JSON({ error: "Fayilga yozishda xatolik" }));
            } else {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(books[bookUpdateIndex]));
            }
          });
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Ma'lumot topilmadi" }));
        }
      });
    } else if (req.method === "DELETE" && req.url.startsWith("/books/")) {
      const id = req.url.split("/").pop();
      console.log(typeof id);
      const index = books.findIndex((b) => b.id == id);
      console.log(typeof index);
      if (index !== -1) {
        const deleteBooks = books.splice(index, 1)[0];
        fs.writeFile("books.json", JSON.stringify(books), "utf8", (err) => {
          if (err) {
            res.writeHead(500, { "Content-Taype": "application/json" });
            res.end(JSON({ error: "Fayilga yozishda xatolik" }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(deleteBooks));
          }
        });
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Ma'lumot topilmadi" }));
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    }
  });
});

const port = 7747;

server.listen(port, () => {
  console.log("listening on port");
});
