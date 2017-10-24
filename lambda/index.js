var AWS = require('aws-sdk');
var S3 = new AWS.S3();
var Sharp = require('sharp');

var BUCKET = process.env.BUCKET;
var URL = process.env.URL;

BUCKET = 'images.photoeye.com';

exports.handler = function (event, context, callback) {
  console.log(event.params);
  var key = event.params.querystring.key;
  var keys = key.split(/_|\./);
  var keys_ = key.split(/_/);
  var imageBase64;
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

  if (width <= 0){
    width = null;
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
      imageBase64 = buffer.toString('base64');
      console.log(`put object: ${key}`);
      return S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
        ContentType: `image/${extension}`,
        Key: key.toLowerCase()
      }).promise()
    })
    .then((data) => {
      console.log(`return image ${key}`);
      callback(null, imageBase64);
    })
    .catch((err) => {
      console.log('something here', err);
      callback(err, null);
    })
}

// artists/edwardranney/portfolio3/images_large/image10_0_111.jpg
// https://1lefrvaye0.execute-api.us-east-1.amazonaws.com/prod/resize?key=artists/edwardranney/portfolio3/images_large/image10_0_240.jpg
