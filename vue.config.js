// module.exports = {
//     resolve: {
//         alias: {
            
//         }
//     }
// };

const fs = require('fs')
module.exports = {
    devServer: {
      https: {
        key: fs.readFileSync('./ssl/localhost+3-key.pem'),
        cert: fs.readFileSync('./ssl/localhost+3.pem'),
      },
    },
  };
  