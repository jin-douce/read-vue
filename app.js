const express = require("express");
const mysql = require("mysql");
const constant = require("./const");
const cors = require("cors");
const connect = require('./connect');

const app = express();
// cors是expresss的一个第三方中间件，解决跨域（简单请求）
app.use(cors());
app.use(express.json()); //数据JSON类型
app.use(express.urlencoded({
    extended: false
})); //解析post请求数据


app.get("/", (req, res) => {
  res.send(new Date().toDateString());
});


app.get('/booklist', (req, res) => {
    const id = req.query.id;
    connect(id ? `SELECT * FROM booklist WHERE id=${id};` : `SELECT * FROM booklist;`, function (err, results, fields) {
        if (err) throw  err;
        id ? res.send(results[0]) : res.send(results)
    })
});

app.get('/book', (req, res) => {
    const book = req.query.book;
    const bookId = req.query.id;
    connect(`SELECT * FROM book${book} WHERE id=${bookId}`, function (err, results) {
        if (err) throw err;
        res.send(results[0])
    })
})
app.get('/booktitles', (req, res) => {
    const id = req.query.id;
    connect(`SELECT * FROM booktitles WHERE id=${id};`, function (err, results) {
        if (err) throw  err;
        res.send(results[0]);
    })
})

app.get('/type', (req, res) => {
    const type = req.query.type;
    connect(`SELECT * FROM booklist WHERE type='${type}'`, function (err, results) {
        if (err) throw err;
        res.send(results)
    })
})

app.get('/search', (req, res) => {
    const keyword = req.query.keyword;
    connect(`SELECT * FROM booklist WHERE name LIKE "%${keyword}%" OR author LIKE "%${keyword}%";`, function (err, results) {
        if (err) throw err;
        res.send(results);
    })
})

// 书架
// app.get('/shelf', (req, res) => {
//     const userId = req.query.userId;
//     console.log(req.query.userId);
//     connect(`SELECT * FROM bookshelf WHERE userid=${userId}`, function (err, results) {
//         if (err) throw err;
//         res.send(results)
//     })
// })
app.get('/book/shelf', (req, res) => {
    res.json({
      bookList: []
    })
  })

app.get('/checkShelf',(req, res) => {
    const userId = req.query.userId;
    const bookId = req.query.bookId;
    connect(`SELECT * FROM bookshelf WHERE userid=${userId} AND bookid=${bookId}`, function (err, results, fileds) {
        if (err) throw err;
        if (results.length === 1) {
            res.send(true)
        }
        else {
            res.send(false)
        }
    })
})

// post
app.post('/login', (req, res) => {
//   console.log(req.body);
  const user = req.body.user;
  const pwd = req.body.pwd;
  
  connect(`SELECT * FROM users WHERE user_name="${user}" AND password="${pwd}";`, function (err, results) {
      if (err) throw err;
      if(results.length === 1) {
          connect(`SELECT * FROM user_info WHERE user="${user}";`, function (err, results) {
              if (err) throw err;
              if(results.length === 1) {
                  res.send(results[0])
              }
              else {
                  res.send(false)
              }
          })
      }
      else {
          res.send(false)
      }
  })
})

app.post('/register', (req, res) => {
    const user = req.body.user;
    const pwd = req.body.pwd;
    const email = req.body.email;

    connect(`SELECT * FROM users WHERE user_name="${user}";`, function (err, results, fileds) {
        if (err) throw err;
        if (results.length === 1) {
            res.send({
                insertStatus: 2
            })
        } else {
            let id = new Date().getTime();
            let sql = `INSERT INTO \`books\`.\`users\`(\`user_id\`, \`user_name\`, \`password\`, \`email\`) VALUES ('${id}', '${user}', '${pwd}', '${email}');`
            connect(sql, function (err, results, fileds) {
                if (err) throw err;
                if (results.affectedRows === 1) {
                    let sql2 = `INSERT INTO \`books\`.\`user_info\`(\`id\`, \`user\`, \`font_size\`, \`style_model\`, \`night\`, \`head_img\`) VALUES ('${id}', '${user}', 16, 'style1', 'false', 
                    'https://tse2-mm.cn.bing.net/th/id/OIP-C.hvXT1R0c0aPWrdz-aRThJwAAAA?w=200&h=200&c=7&r=0&o=5&dpr=1.5&pid=1.7');`;
                    connect(sql2, function (err, results, fileds) {
                        if (err) throw err;
                        if (results.affectedRows === 1) {
                            connect(`SELECT * FROM user_info WHERE user="${user}";`, function (err, results) {
                                if (err) throw err;
                                if (results.length === 1) {
                                    res.send({
                                        insertStatus: 1,
                                        userInfo: results[0]
                                    })
                                } else {
                                    res.send({
                                        insertStatus: 0
                                    })
                                }
                            })
                        } else {
                            res.send({
                                insertStatus: 0
                            })
                        }
                    })
                } else {
                    res.send({
                        insertStatus: 0
                    })
                }
            })
        }
    })
})

// 加入书架
app.post('/inShelf',(req, res) => {
    const userId = req.body.userId;
    const sql = `INSERT INTO \`books\`.\`bookshelf\`(\`userid\`, \`bookid\`, \`bookname\`, \`author\`, \`images\`, \`wordcount\`, \`type\`, \`intro\`, \`serialize\`) 
    VALUES ('${userId}','${req.body['userInfo[id]']}','${req.body['userInfo[name]']}','${req.body['userInfo[author]']}','${req.body['userInfo[images]']}','${req.body['userInfo[wordcount]']}','${req.body['userInfo[type]']}','${req.body['userInfo[intro]']}','${req.body['userInfo[serialize]']}');`

    connect(sql, function (err, results) {
        if (err) throw err;
        if (results.affectedRows === 1) {
            res.send(true)
        } else {
            res.send(false)
        }
    })

})




const server = app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log("server is listening at http://%s:%s", host, port);
});




