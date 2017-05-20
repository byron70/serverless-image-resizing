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
  var baseImage = keys[0];
  var width = parseInt(keys[1], 10);
  var extension = keys.slice(-1)[0];
  var height;
  if (keys.length == 4) {
    height = parseInt(keys[2], 10);
  }
  if (width <= 0) {
    width = null;
  }
  var originalKey = baseImage + '.' + extension;

  if (extension.toLowerCase() == 'jpg') {
    extension = 'jpeg';
  }

  S3.getObject({ Bucket: BUCKET, Key: originalKey }).promise()
    .then((data) => {
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
    .then((buffer) =>
      S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
        ContentType: 'image/' + extension,
        Key: key.toLowerCase()
      }).promise()
    )
    .then(() => context.succeed({
      statusCode: '301',
      headers: { 'location': `${URL}/${key}` },
      body: ''
    })
    )
    .catch((err) => {
      console.log('something here', err);
      context.fail(err)
    })
}
