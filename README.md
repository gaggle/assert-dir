# assert-dir
Asynchronous assertion of two folders being identical

Supports custom comparers for file globs, 
so you can assert specific formats are semantically identical 
even if their literal content differs.
(e.g. HTML or XML files can differ in linebreaks without being semantically different) 

## Installation
```bash
npm i gaggle/assert-dir --save-dev
```

## Use
```js
const assertDir = require('assert-dir')

assertDir('path1', 'path2')
```

Custom comparers are passed in as an array,
each element a two-element array 
consisting of a pattern and a compare-function.

```js
const allFilesAreGood = ['*', () => true]
assertDir('path1', 'path2', [allFilesAreGood])
```

Multiple custom comparers can be added, 
files are matched in order.

A compare-function is a synchronous function 
that returns false if the two files are not identical. 
It is passed these arguments:
```
<relative path>, <actual path>, <expected path>, <actual data>, <expected data>
``` 
