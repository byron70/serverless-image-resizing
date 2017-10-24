event = {
    params: {
        querystring: {
        key: 'artists/edwardranney/portfolio3/images_large/image10_0_111.jpg'
        }
    }
}

var i = require('./index')
i.handler(event, null, function(err, data){
    console.log(data);
})
