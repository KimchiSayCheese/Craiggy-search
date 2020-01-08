require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const fetch = require('node-fetch')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const app = express()
app.use(cors())
app.use(morgan('tiny'))



function getResults(body) {
  const { document } = (new JSDOM(body)).window
  let rows = [...document.querySelectorAll('li.result-row')]

  return rows.map(row => {
    let title = row.querySelector('a.result-title').textContent
    let price = row.querySelector('span.result-price').textContent
    let image = row.querySelector('a.result-image')
    if(!image.classList.contains('empty')) {
      image = image.getAttribute('data-ids').split(',').map(item => {
        return `https://images.craigslist.org/${item.replace('1:', '')}_1200x900.jpg`

      })

    } else {
      image = 'No Image'
    }
    
    
    return {
      title,
      price,
      image
    }
  })
}



//route
app.get('/', (req,res) => {
  res.json({
    message: 'Hello twitter world'
  })
})

app.get('/search/:loc/:cat/:search_val', (req, res) => {
  const { loc:location, search_val:searchValue, cat:category } = req.params
  const categories = {
    games: 'vga',
    electronics: 'ela',
    computers: 'sya'
  }
  
  const url = `https://${location}.craigslist.org/search/${
    categories[category] === undefined ? 'vga' : categories[category]
  }?sort=date&query=${searchValue}`
 
  fetch(url)
    .then(response => response.text())
    .then(body => {
      const result = getResults(body)
      res.json({
        result
      })
    })
    .catch(error => console.log(error))
  


})


app.use((req, res, next) => {
  const error = new Error('Not Found')
  res.status(404)
  next(error)
})

app.use((error, req, res, next) => {
  res.status(res.statusCode || 500)
  res.json({
    message: error.message
  })
})

const PORT = process.env.PORT || 1234
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})