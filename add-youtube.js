const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Dumindu2006/.gemini/antigravity/scratch/fly-for-peace';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const youtubeLink = `\n                        <a href="https://www.youtube.com/@flyforpeaceofficial" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i></a>`;

let updated = 0;
for (const file of files) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    const target = `<a href="https://www.linkedin.com/company/flyforpeace" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin-in"></i></a>`;
    
    if (content.includes(target) && !content.includes('youtube.com/@flyforpeaceofficial')) {
        content = content.split(target).join(target + youtubeLink);
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        updated++;
    }
}
console.log(`Updated ${updated} HTML files to include the YouTube social icon.`);
