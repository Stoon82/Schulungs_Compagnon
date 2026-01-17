// Fix media template to convert single mediaUrl to gallery mode
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./compagnon.db');
const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

async function fixMediaGallery() {
  try {
    console.log('Looking for media templates with single URL that should be galleries...');
    
    // Get all submodules with MediaTemplate
    const submodules = await dbAll(`
      SELECT id, title, content 
      FROM submodules 
      WHERE template_type = 'MediaTemplate'
    `);
    
    console.log(`Found ${submodules.length} media submodules`);
    
    for (const sub of submodules) {
      const content = JSON.parse(sub.content);
      
      // Check if it has mediaUrl but galleryMode is false and mediaUrls is empty
      if (content.mediaUrl && !content.galleryMode && (!content.mediaUrls || content.mediaUrls.length === 0)) {
        console.log(`\n📝 Fixing: "${sub.title}"`);
        console.log(`   Current: mediaUrl="${content.mediaUrl}", galleryMode=false`);
        
        // Convert to gallery mode
        content.galleryMode = true;
        content.mediaUrls = [content.mediaUrl];
        
        // Detect media type from file extension
        const ext = content.mediaUrl.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
          content.mediaType = 'video';
        } else {
          content.mediaType = 'image';
        }
        
        console.log(`   Fixed: mediaUrls=[${content.mediaUrls}], galleryMode=true, mediaType=${content.mediaType}`);
        
        await dbRun(
          'UPDATE submodules SET content = ? WHERE id = ?',
          [JSON.stringify(content), sub.id]
        );
        
        console.log('   ✅ Updated!');
      }
    }
    
    console.log('\n✅ All media galleries fixed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    db.close();
  }
}

fixMediaGallery();
