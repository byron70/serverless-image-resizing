var AWS = require('aws-sdk');
var S3 = new AWS.S3();
var Sharp = require('sharp');

var BUCKET = process.env.BUCKET;
var URL = process.env.URL;

BUCKET = 'images.photoeye.com';

exports.handler = function (event, context) {
  console.log(event.queryStringParameters.key);
  var key = event.queryStringParameters.key;
  var keys = key.split(/_|\./);
  var keys_ = key.split(/_/);
  var baseImage;
  var width;
  var height;
  var extension = keys.slice(-1)[0];
  var widthAndHeight = (
    keys.length >= 3 
    && !isNaN(parseInt(keys.slice(-3)[0]))
    && !isNaN(parseInt(keys.slice(-2)[0])));

  if (widthAndHeight){
    width = parseInt(keys.slice(-3)[0], 10);
    height = parseInt(keys.slice(-2)[0], 10);
    baseImage = keys_.slice(0, -2).join('_');
  }
  else {
    width = parseInt(keys.slice(-2)[0], 10);   
    baseImage = keys_.slice(0, -1).join('_');
  }  
  
  var originalKey = baseImage + '.' + extension;

  if (extension.toLowerCase() == 'jpg') {
    extension = 'jpeg';
  }

  console.log(`getObject: ${BUCKET}/${originalKey}`);

  S3.getObject({ Bucket: BUCKET, Key: originalKey }).promise()
    .then((data) => {
      console.log(`resizing with height: ${height} width: ${width}`);
      if (height && width) {
        return Sharp(data.Body)
          .resize(width, height)
          .max()
          .withoutEnlargement(true)
          .toFormat(extension)
          .toBuffer()
      }
      else {
        return Sharp(data.Body)
          .resize(width, height)
          .withoutEnlargement(true)
          .toFormat(extension)
          .toBuffer()
      }
    }
    )
    .then((buffer) => {
      console.log(`put object: ${key}`);
      S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
        ContentType: `image/${extension}`,
        Key: key.toLowerCase()
      }).promise()
    })
    .then(() => {
      console.log(`success redirect to: ${URL}/${key}`);
      context.succeed({
        statusCode: '301',
        headers: { 'location': `${URL}/${key}` },
        body: ''
      })
    })
    .catch((err) => {
      console.log('something here', err);
      context.fail(err)
    })
}
