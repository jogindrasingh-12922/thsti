const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'Controllers');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.cs'));

let count = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const initialContent = content;

  // Replace "{id}" with "{id:int}" in routing attributes
  content = content.replace(/\[(HttpGet|HttpPut|HttpDelete|HttpPatch)\(\"\{id\}\"\)\]/g, '[$1("{id:int}")]');
  
  // Replace "{id}/something" with "{id:int}/something"
  content = content.replace(/\[(HttpGet|HttpPut|HttpDelete|HttpPatch)\(\"\{id\}\/([^"]+)\"\)\]/g, '[$1("{id:int}/$2")]');

  // Same for single quotes if any (though C# uses double for strings)
  if (content !== initialContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
  }
}

console.log(`Updated ${count} files.`);
