const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(rootDir);
let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let modified = false;

  // Replace <Loader2 ... />
  // We need to parse size and figure out if it's a page loader or button loader.
  // Common sizes: w-4 h-4 -> size 20. w-5 h-5 -> size 20. w-8 h-8 -> size 32. w-12 h-12 -> size 60.
  // Also size={...} props
  const loaderRegex = /<Loader2\s+[^>]*\/?>/g;
  
  if (content.match(loaderRegex)) {
    content = content.replace(loaderRegex, (match) => {
      let finalSize = 20; // Default for buttons
      if (match.includes('w-12') || match.includes('w-16') || match.includes('size={4') || match.includes('size={6')) {
        finalSize = 60;
      } else if (match.includes('w-8') || match.includes('size={3')) {
        finalSize = 40;
      }
      
      // The user wants: "Replace only loader logic, not layout"
      // If the old loader was taking up full space, the parent div handles it.
      // We just drop in <InfinityLoader size={...} />
      modified = true;
      return `<InfinityLoader size={${finalSize}} />`;
    });
  }

  // Also replace old InfinityLoader usages that now have fullScreen or text props, if any
  const oldInfinityRegex = /<InfinityLoader(\s+[^>]*)?\/>/g;
  if (content.match(oldInfinityRegex)) {
    content = content.replace(oldInfinityRegex, (match, props) => {
      // If it doesn't have size={}, we better add it or normalize
      if (!props) return match;
      if (props.includes('text=') || props.includes('fullScreen')) {
        modified = true;
        let pSize = 60;
        if (props.includes('size="sm"')) pSize = 30;
        if (props.includes('size="md"')) pSize = 40;
        
        let needWrapper = props.includes('fullScreen={true}') || (props.includes('text=') && !match.includes('fullScreen={false}'));
        
        if (needWrapper) {
          return `<div className="fixed inset-0 bg-primary/95 backdrop-blur-sm z-50 flex items-center justify-center min-h-screen w-full"><InfinityLoader size={60} /></div>`;
        } else {
          return `<InfinityLoader size={${pSize}} />`;
        }
      }
      return match;
    });
  }

  if (modified) {
    // Inject import if not present
    if (!content.includes('InfinityLoader')) { // Wait, it will definitely include it now
       // check import statement
    }
    
    // Actually, let's just make sure "import InfinityLoader" is there if the string "<InfinityLoader" is present
    if (content.includes('<InfinityLoader') && !content.includes('import InfinityLoader')) {
      // Find the relative path to components/common/InfinityLoader
      // e.g., if we are in src/pages/FindWork.jsx, relpath is ../components/common/InfinityLoader
      
      const fileDir = path.dirname(file);
      const loaderDir = path.join(rootDir, 'components', 'common');
      let relPath = path.relative(fileDir, loaderDir);
      if (!relPath.startsWith('.')) relPath = './' + relPath;
      relPath = relPath + '/InfinityLoader';
      
      // Inject after the last import, or at top
      const importList = content.match(/^import .*$/gm);
      const lastImport = importList ? importList[importList.length - 1] : null;
      if (lastImport) {
        content = content.replace(lastImport, lastImport + `\nimport InfinityLoader from '${relPath}';`);
      } else {
        content = `import InfinityLoader from '${relPath}';\n` + content;
      }
    }
    
    // Remove Loader2 from lucide-react if present and no longer used
    if (!content.includes('<Loader2')) {
      // It might be imported as { Loader2, ... }
      content = content.replace(/,\s*Loader2/, '');
      content = content.replace(/Loader2,\s*/, '');
      content = content.replace(/Loader2\s*}/, '}');
      // If it ends up as import { } from 'lucide-react', remove the whole line
      content = content.replace(/import\s+{\s*}\s+from\s+['"]lucide-react['"];?\n?/, '');
    }

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      replacedCount++;
      console.log('Updated:', file);
    }
  }
});

console.log(`Replaced loaders in ${replacedCount} files.`);
