import fs from 'fs';

export default (filePath: string):void => {
  fs.unlink(filePath, (err) => {
    if (err) console.log(err);
  });
};
