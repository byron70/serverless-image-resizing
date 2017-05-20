event = {
    queryStringParameters: {
        key: 'books/z/zg693/zg693_200_200.jpg'
    }
}

var i = require('./index')

i.handler(event, null)

event = {
    queryStringParameters: {
        key: 'books/z/zg693/zg693_200_100.jpg'
    }
}

var i = require('./index')
i.handler(event, null)


event = {
    queryStringParameters: {
        key: 'books/z/zg693/zg693_100_200.jpg'
    }
}

var i = require('./index')
i.handler(event, null)